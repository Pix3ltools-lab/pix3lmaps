'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  type NodeMouseHandler,
  type Connection,
} from '@xyflow/react';
import { useMapStore } from '@/hooks/useMapStore';
import { MindMapNode } from './MindMapNode';
import { NodeContextMenu, type ContextMenuAction } from './NodeContextMenu';
import { captureThumbnail } from '@/lib/thumbnailUtils';
import { Toast } from '@/components/ui/Toast';
import type { MindMapNodeData } from '@/types';

const nodeTypes = { mindmap: MindMapNode } as const;

const defaultEdgeOptions = {
  type: 'default',
  style: { stroke: 'var(--text-secondary)', strokeWidth: 2 },
};

interface ContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

export function MindMapCanvas() {
  const nodes = useMapStore((s) => s.nodes);
  const edges = useMapStore((s) => s.edges);
  const onNodesChange = useMapStore((s) => s.onNodesChange);
  const onEdgesChange = useMapStore((s) => s.onEdgesChange);
  const selectedNodeId = useMapStore((s) => s.selectedNodeId);
  const editingNodeId = useMapStore((s) => s.editingNodeId);
  const setEditingNodeId = useMapStore((s) => s.setEditingNodeId);
  const setSelectedNodeId = useMapStore((s) => s.setSelectedNodeId);
  const deleteNode = useMapStore((s) => s.deleteNode);
  const addChildNode = useMapStore((s) => s.addChildNode);
  const addSiblingNode = useMapStore((s) => s.addSiblingNode);
  const addEdge = useMapStore((s) => s.addEdge);
  const persist = useMapStore((s) => s.persist);
  const saveThumbnail = useMapStore((s) => s.saveThumbnail);
  const undo = useMapStore((s) => s.undo);
  const redo = useMapStore((s) => s.redo);
  const isAnimating = useMapStore((s) => s.isAnimating);
  const setIsAnimating = useMapStore((s) => s.setIsAnimating);
  const moveBranch = useMapStore((s) => s.moveBranch);
  const cutNode = useMapStore((s) => s.cutNode);
  const cancelMoveBranch = useMapStore((s) => s.cancelMoveBranch);
  const cutNodeId = useMapStore((s) => s.cutNodeId);
  const movingNodeId = useMapStore((s) => s.movingNodeId);
  const { fitView } = useReactFlow();

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);
  const thumbnailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Visual feedback for cut / move-target mode ─────────────────────
  const displayNodes = useMemo(() => {
    if (!cutNodeId && !movingNodeId) return nodes;
    const dimId = cutNodeId || movingNodeId;
    return nodes.map((n) =>
      n.id === dimId ? { ...n, style: { ...n.style, opacity: 0.5 } } : n,
    );
  }, [nodes, cutNodeId, movingNodeId]);

  // ── Thumbnail capture (debounced) ──────────────────────────────────
  useEffect(() => {
    if (thumbnailTimerRef.current) clearTimeout(thumbnailTimerRef.current);
    thumbnailTimerRef.current = setTimeout(async () => {
      const el = document.querySelector('.react-flow') as HTMLElement | null;
      if (!el) return;
      const thumb = await captureThumbnail(el);
      if (thumb) saveThumbnail(thumb);
    }, 1500);
    return () => {
      if (thumbnailTimerRef.current) clearTimeout(thumbnailTimerRef.current);
    };
  }, [nodes, edges, saveThumbnail]);

  // Clear animation flag after transition and fit view
  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => {
      setIsAnimating(false);
      fitView({ padding: 0.2, duration: 200 });
    }, 310);
    return () => clearTimeout(timer);
  }, [isAnimating, setIsAnimating, fitView]);

  const handleNodeDoubleClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setEditingNodeId(node.id);
    },
    [setEditingNodeId],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setEditingNodeId(null);
    setContextMenu(null);
    if (movingNodeId || cutNodeId) {
      cancelMoveBranch();
      setToast({ message: 'Move cancelled', type: 'info' });
    }
  }, [setSelectedNodeId, setEditingNodeId, movingNodeId, cutNodeId, cancelMoveBranch]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      addEdge(connection);
    },
    [addEdge],
  );

  const handleNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      setContextMenu({ nodeId: node.id, x: event.clientX, y: event.clientY });
    },
    [],
  );

  // ── Node click — intercept for move-target mode ───────────────────
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (!movingNodeId && !cutNodeId) return;
      const sourceId = movingNodeId || cutNodeId!;
      try {
        moveBranch(sourceId, node.id);
        setToast({ message: 'Branch moved successfully', type: 'success' });
      } catch (err) {
        setToast({ message: (err as Error).message, type: 'error' });
      }
    },
    [movingNodeId, cutNodeId, moveBranch],
  );

  // ── Keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInputFocused = tag === 'INPUT' || tag === 'TEXTAREA';

      // Ctrl+S / Cmd+S — always intercept
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        persist();
        return;
      }

      // Don't handle other shortcuts when editing text
      if (editingNodeId || isInputFocused) return;

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        // Undo/redo
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
          return;
        }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
          return;
        }

        // Ctrl+X — cut node for move
        if (e.key === 'x' && selectedNodeId) {
          e.preventDefault();
          cutNode(selectedNodeId);
          setToast({ message: 'Node cut — select a new parent and press Ctrl+V', type: 'info' });
          return;
        }

        // Ctrl+V — paste (move) cut node under selected node
        if (e.key === 'v' && cutNodeId && selectedNodeId) {
          e.preventDefault();
          try {
            moveBranch(cutNodeId, selectedNodeId);
            setToast({ message: 'Branch moved successfully', type: 'success' });
          } catch (err) {
            setToast({ message: (err as Error).message, type: 'error' });
          }
          return;
        }

        return;
      }

      // Tab — add child
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        addChildNode(selectedNodeId);
        return;
      }

      // Enter — add sibling
      if (e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        addSiblingNode(selectedNodeId);
        return;
      }

      // Escape — cancel move / clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        if (movingNodeId || cutNodeId) {
          cancelMoveBranch();
          setToast({ message: 'Move cancelled', type: 'info' });
        }
        setSelectedNodeId(null);
        setEditingNodeId(null);
        setContextMenu(null);
        return;
      }

      // Delete/Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        deleteNode(selectedNodeId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    editingNodeId,
    deleteNode,
    addChildNode,
    addSiblingNode,
    persist,
    undo,
    redo,
    setSelectedNodeId,
    setEditingNodeId,
    cutNode,
    cutNodeId,
    movingNodeId,
    moveBranch,
    cancelMoveBranch,
  ]);

  // ── Context menu actions ───────────────────────────────────────────
  const contextMenuActions: ContextMenuAction[] = contextMenu
    ? (() => {
        const node = nodes.find((n) => n.id === contextMenu.nodeId);
        const isRoot = !node?.data.parentId;
        return [
          {
            label: 'Add Child',
            icon: (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
            ),
            onClick: () => addChildNode(contextMenu.nodeId),
          },
          {
            label: 'Move branch...',
            icon: (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12l4-4 4 4" />
                <path d="M8 8V2" />
                <path d="M2 14h12" />
              </svg>
            ),
            onClick: () => {
              useMapStore.setState({ movingNodeId: contextMenu.nodeId });
              setToast({ message: 'Click on the new parent node (Escape to cancel)', type: 'info' });
            },
            disabled: isRoot,
          },
          {
            label: 'Edit',
            icon: (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 1.5l3.5 3.5L5 14.5H1.5V11z" />
              </svg>
            ),
            onClick: () => setEditingNodeId(contextMenu.nodeId),
          },
          {
            label: 'Delete',
            icon: (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4h12" />
                <path d="M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4" />
                <path d="M12.5 4l-.5 9.5a1 1 0 0 1-1 .5H5a1 1 0 0 1-1-.5L3.5 4" />
              </svg>
            ),
            onClick: () => deleteNode(contextMenu.nodeId),
            danger: true,
            disabled: isRoot,
          },
        ];
      })()
    : [];

  const isMoving = !!(movingNodeId || cutNodeId);

  return (
    <div
      className={`h-full w-full ${isAnimating ? 'layout-animating' : ''}`}
      style={isMoving ? { cursor: 'crosshair' } : undefined}
    >
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onConnect={handleConnect}
        onNodeContextMenu={handleNodeContextMenu}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        deleteKeyCode={null}
        zoomOnDoubleClick={false}
        fitView
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="var(--dot-grid)"
          style={{ opacity: 0.3 }}
          gap={20}
          size={1}
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as MindMapNodeData;
            return data.color || '#3498DB';
          }}
          maskColor="rgba(0,0,0,0.2)"
        />
      </ReactFlow>

      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={contextMenuActions}
          onClose={() => setContextMenu(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
