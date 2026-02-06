import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type NodePositionChange,
  type Connection,
} from '@xyflow/react';
import { db } from '@/lib/db';
import type { MindMapNode, MindMapNodeData, MindMapEdge, LayoutMode } from '@/types';
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_SHAPE,
  DEFAULT_TEXT_SIZE,
  AUTO_SAVE_DEBOUNCE_MS,
  MAX_UNDO_STEPS,
  UNDO_BATCH_MS,
} from '@/lib/constants';
import { applyLayout } from '@/lib/layouts';

// ── Helpers ─────────────────────────────────────────────────────────

function getDescendantIds(nodeId: string, edges: MindMapEdge[]): string[] {
  const children = edges
    .filter((e) => e.source === nodeId)
    .map((e) => e.target);
  return children.concat(
    children.flatMap((childId) => getDescendantIds(childId, edges)),
  );
}

// ── Snapshot type ───────────────────────────────────────────────────

interface Snapshot {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  layoutMode?: LayoutMode;
}

// ── Store types ─────────────────────────────────────────────────────

interface MapState {
  mapId: number | null;
  mapName: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  layoutMode: LayoutMode;
  selectedNodeId: string | null;
  editingNodeId: string | null;
  loading: boolean;
  error: string | null;
  past: Snapshot[];
  future: Snapshot[];
  isAnimating: boolean;
}

interface MapActions {
  loadMap: (id: number) => Promise<void>;
  reset: () => void;
  onNodesChange: (changes: NodeChange<MindMapNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<MindMapEdge>[]) => void;
  addChildNode: (parentId: string) => void;
  addSiblingNode: (nodeId: string) => void;
  addEdge: (connection: Connection) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeData: (nodeId: string, partial: Partial<MindMapNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;
  setMapName: (name: string) => void;
  persist: () => void;
  saveThumbnail: (thumbnail: string) => void;
  undo: () => void;
  redo: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setIsAnimating: (v: boolean) => void;
}

const initialState: MapState = {
  mapId: null,
  mapName: '',
  nodes: [],
  edges: [],
  layoutMode: 'free',
  selectedNodeId: null,
  editingNodeId: null,
  loading: false,
  error: null,
  past: [],
  future: [],
  isAnimating: false,
};

// ── Debounced persist ───────────────────────────────────────────────

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedPersist(state: MapState) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    if (state.mapId == null) return;
    db.maps
      .update(state.mapId, {
        name: state.mapName,
        nodes: state.nodes,
        edges: state.edges,
        layoutMode: state.layoutMode,
        updatedAt: new Date(),
      })
      .catch(console.error);
  }, AUTO_SAVE_DEBOUNCE_MS);
}

// ── Drag tracking & snapshot batching (module-level) ────────────────

let isDragging = false;
let preDragSnapshot: Snapshot | null = null;
let lastSnapshotTime = 0;

function pushSnapshot(
  state: MapState,
  batchable: boolean,
): Snapshot[] {
  const now = Date.now();
  if (batchable && now - lastSnapshotTime < UNDO_BATCH_MS) {
    return state.past;
  }
  lastSnapshotTime = now;
  const snap: Snapshot = structuredClone({ nodes: state.nodes, edges: state.edges });
  const newPast = [...state.past, snap];
  if (newPast.length > MAX_UNDO_STEPS) {
    newPast.splice(0, newPast.length - MAX_UNDO_STEPS);
  }
  return newPast;
}

// ── Store ───────────────────────────────────────────────────────────

export const useMapStore = create<MapState & MapActions>()((set, get) => ({
  ...initialState,

  loadMap: async (id) => {
    set({ loading: true, error: null });
    try {
      const map = await db.maps.get(id);
      if (!map) {
        set({ loading: false, error: 'Map not found' });
        return;
      }
      // Apply layout if not in free mode
      let nodes = map.nodes;
      if (map.layoutMode !== 'free') {
        nodes = applyLayout(map.layoutMode, map.nodes, map.edges);
      }
      set({
        mapId: map.id ?? null,
        mapName: map.name,
        nodes,
        edges: map.edges,
        layoutMode: map.layoutMode,
        loading: false,
        past: [],
        future: [],
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load map',
      });
    }
  },

  reset: () => {
    if (persistTimer) clearTimeout(persistTimer);
    isDragging = false;
    preDragSnapshot = null;
    lastSnapshotTime = 0;
    set(initialState);
  },

  onNodesChange: (changes) => {
    const state = get();

    // During layout animation, ignore position changes
    const filteredChanges = state.isAnimating
      ? changes.filter((c) => c.type !== 'position')
      : changes;

    if (filteredChanges.length === 0) return;

    const updated = applyNodeChanges(filteredChanges, state.nodes);

    // Track selection changes
    let selectedNodeId = state.selectedNodeId;
    for (const change of filteredChanges) {
      if (change.type === 'select') {
        selectedNodeId = change.selected ? change.id : null;
      }
    }

    // Drag detection
    const positionChanges = filteredChanges.filter(
      (c): c is NodePositionChange => c.type === 'position',
    );

    let newPast = state.past;

    for (const pc of positionChanges) {
      if (pc.dragging && !isDragging) {
        // Drag start — capture pre-drag snapshot
        isDragging = true;
        preDragSnapshot = structuredClone({ nodes: state.nodes, edges: state.edges });
      } else if (!pc.dragging && isDragging) {
        // Drag end — push pre-drag snapshot
        isDragging = false;
        if (preDragSnapshot) {
          newPast = [...state.past, preDragSnapshot];
          if (newPast.length > MAX_UNDO_STEPS) {
            newPast.splice(0, newPast.length - MAX_UNDO_STEPS);
          }
          preDragSnapshot = null;
        }
      }
    }

    const updates: Partial<MapState> = { nodes: updated, selectedNodeId };
    if (newPast !== state.past) {
      updates.past = newPast;
      updates.future = [];
    }

    set(updates);
    debouncedPersist(get());
  },

  onEdgesChange: (changes) => {
    const { edges } = get();
    const updated = applyEdgeChanges(changes, edges);
    set({ edges: updated });
    debouncedPersist(get());
  },

  addChildNode: (parentId) => {
    const state = get();
    const parent = state.nodes.find((n) => n.id === parentId);
    if (!parent) return;

    const past = pushSnapshot(state, false);

    const siblingCount = state.edges.filter((e) => e.source === parentId).length;
    const newId = crypto.randomUUID();

    const newNode: MindMapNode = {
      id: newId,
      type: 'mindmap',
      position: {
        x: (parent.position.x) + 250,
        y: (parent.position.y) + siblingCount * 100,
      },
      data: {
        label: '',
        color: DEFAULT_NODE_COLOR,
        shape: DEFAULT_NODE_SHAPE,
        fontSize: DEFAULT_TEXT_SIZE,
        parentId,
      },
    };

    const newEdge: MindMapEdge = {
      id: `edge-${parentId}-${newId}`,
      source: parentId,
      target: newId,
    };

    let finalNodes = [...state.nodes, newNode];
    const finalEdges = [...state.edges, newEdge];

    // Auto-layout in radial/tree modes
    if (state.layoutMode !== 'free') {
      finalNodes = applyLayout(state.layoutMode, finalNodes, finalEdges);
    }

    set({
      nodes: finalNodes,
      edges: finalEdges,
      editingNodeId: newId,
      past,
      future: [],
    });
    debouncedPersist(get());
  },

  addSiblingNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node?.data.parentId) return; // no-op on root
    get().addChildNode(node.data.parentId);
  },

  addEdge: (connection) => {
    const state = get();
    const { source, target } = connection;
    if (!source || !target) return;
    if (source === target) return;

    // Prevent duplicate edges
    const exists = state.edges.some(
      (e) => e.source === source && e.target === target,
    );
    if (exists) return;

    const past = pushSnapshot(state, false);
    const newEdge: MindMapEdge = {
      id: `edge-${source}-${target}`,
      source,
      target,
    };

    set({
      edges: [...state.edges, newEdge],
      past,
      future: [],
    });
    debouncedPersist(get());
  },

  updateNodeLabel: (nodeId, label) => {
    const state = get();
    const past = pushSnapshot(state, true);
    set({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
      ),
      editingNodeId: null,
      past,
      future: [],
    });
    debouncedPersist(get());
  },

  updateNodeData: (nodeId, partial) => {
    const state = get();
    const past = pushSnapshot(state, true);
    set({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...partial } } : n,
      ),
      past,
      future: [],
    });
    debouncedPersist(get());
  },

  deleteNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Protect root node (no parentId)
    if (!node.data.parentId) return;

    const past = pushSnapshot(state, false);

    const descendantIds = getDescendantIds(nodeId, state.edges);
    const removeIds = new Set([nodeId, ...descendantIds]);

    const filteredNodes = state.nodes.filter((n) => !removeIds.has(n.id));
    const filteredEdges = state.edges.filter(
      (e) => !removeIds.has(e.source) && !removeIds.has(e.target),
    );

    // Auto-layout in radial/tree modes
    let finalNodes = filteredNodes;
    if (state.layoutMode !== 'free') {
      finalNodes = applyLayout(state.layoutMode, filteredNodes, filteredEdges);
    }

    set({
      nodes: finalNodes,
      edges: filteredEdges,
      selectedNodeId: null,
      editingNodeId: null,
      past,
      future: [],
    });
    debouncedPersist(get());
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setEditingNodeId: (id) => set({ editingNodeId: id }),

  setMapName: (name) => {
    set({ mapName: name });
    debouncedPersist(get());
  },

  persist: () => {
    debouncedPersist(get());
  },

  saveThumbnail: (thumbnail) => {
    const { mapId } = get();
    if (mapId == null) return;
    db.maps.update(mapId, { thumbnail }).catch(console.error);
  },

  setLayoutMode: (mode) => {
    const state = get();
    if (mode === state.layoutMode) return;

    // Push snapshot with current layoutMode so undo restores both positions and mode
    const snap: Snapshot = structuredClone({
      nodes: state.nodes,
      edges: state.edges,
      layoutMode: state.layoutMode,
    });
    const newPast = [...state.past, snap];
    if (newPast.length > MAX_UNDO_STEPS) {
      newPast.splice(0, newPast.length - MAX_UNDO_STEPS);
    }

    let newNodes = state.nodes;
    if (mode !== 'free') {
      newNodes = applyLayout(mode, state.nodes, state.edges);
    }

    set({
      nodes: newNodes,
      layoutMode: mode,
      isAnimating: true,
      past: newPast,
      future: [],
    });
    debouncedPersist(get());
  },

  setIsAnimating: (v) => set({ isAnimating: v }),

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;

    const newPast = [...state.past];
    const snapshot = newPast.pop()!;
    const current: Snapshot = structuredClone({
      nodes: state.nodes,
      edges: state.edges,
      layoutMode: state.layoutMode,
    });

    set({
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      ...(snapshot.layoutMode ? { layoutMode: snapshot.layoutMode } : {}),
      past: newPast,
      future: [...state.future, current],
      selectedNodeId: null,
      editingNodeId: null,
    });
    debouncedPersist(get());
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const newFuture = [...state.future];
    const snapshot = newFuture.pop()!;
    const current: Snapshot = structuredClone({
      nodes: state.nodes,
      edges: state.edges,
      layoutMode: state.layoutMode,
    });

    set({
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      ...(snapshot.layoutMode ? { layoutMode: snapshot.layoutMode } : {}),
      past: [...state.past, current],
      future: newFuture,
      selectedNodeId: null,
      editingNodeId: null,
    });
    debouncedPersist(get());
  },
}));
