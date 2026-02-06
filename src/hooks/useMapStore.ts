import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import { db } from '@/lib/db';
import type { MindMapNode, MindMapEdge, LayoutMode } from '@/types';
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_SHAPE,
  DEFAULT_TEXT_SIZE,
  AUTO_SAVE_DEBOUNCE_MS,
} from '@/lib/constants';

// ── Helpers ─────────────────────────────────────────────────────────

function getDescendantIds(nodeId: string, edges: MindMapEdge[]): string[] {
  const children = edges
    .filter((e) => e.source === nodeId)
    .map((e) => e.target);
  return children.concat(
    children.flatMap((childId) => getDescendantIds(childId, edges)),
  );
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
}

interface MapActions {
  loadMap: (id: number) => Promise<void>;
  reset: () => void;
  onNodesChange: (changes: NodeChange<MindMapNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<MindMapEdge>[]) => void;
  addChildNode: (parentId: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;
  setMapName: (name: string) => void;
  persist: () => void;
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
      set({
        mapId: map.id ?? null,
        mapName: map.name,
        nodes: map.nodes,
        edges: map.edges,
        layoutMode: map.layoutMode,
        loading: false,
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
    set(initialState);
  },

  onNodesChange: (changes) => {
    const { nodes } = get();
    const updated = applyNodeChanges(changes, nodes);

    // Track selection changes
    let selectedNodeId = get().selectedNodeId;
    for (const change of changes) {
      if (change.type === 'select') {
        selectedNodeId = change.selected ? change.id : null;
      }
    }

    set({ nodes: updated, selectedNodeId });
    debouncedPersist(get());
  },

  onEdgesChange: (changes) => {
    const { edges } = get();
    const updated = applyEdgeChanges(changes, edges);
    set({ edges: updated });
    debouncedPersist(get());
  },

  addChildNode: (parentId) => {
    const { nodes, edges } = get();
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;

    const siblingCount = edges.filter((e) => e.source === parentId).length;
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

    set({
      nodes: [...nodes, newNode],
      edges: [...edges, newEdge],
      editingNodeId: newId,
    });
    debouncedPersist(get());
  },

  updateNodeLabel: (nodeId, label) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
      ),
      editingNodeId: null,
    });
    debouncedPersist(get());
  },

  deleteNode: (nodeId) => {
    const { nodes, edges } = get();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Protect root node (no parentId)
    if (!node.data.parentId) return;

    const descendantIds = getDescendantIds(nodeId, edges);
    const removeIds = new Set([nodeId, ...descendantIds]);

    set({
      nodes: nodes.filter((n) => !removeIds.has(n.id)),
      edges: edges.filter(
        (e) => !removeIds.has(e.source) && !removeIds.has(e.target),
      ),
      selectedNodeId: null,
      editingNodeId: null,
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
}));
