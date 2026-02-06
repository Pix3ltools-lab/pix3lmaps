'use client';

import { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  type NodeMouseHandler,
} from '@xyflow/react';
import { useMapStore } from '@/hooks/useMapStore';
import { MindMapNode } from './MindMapNode';
import type { MindMapNodeData } from '@/types';

const nodeTypes = { mindmap: MindMapNode } as const;

const defaultEdgeOptions = {
  type: 'default',
  style: { stroke: 'var(--text-secondary)', strokeWidth: 2 },
};

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
  const undo = useMapStore((s) => s.undo);
  const redo = useMapStore((s) => s.redo);
  const isAnimating = useMapStore((s) => s.isAnimating);
  const setIsAnimating = useMapStore((s) => s.setIsAnimating);
  const { fitView } = useReactFlow();

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
  }, [setSelectedNodeId, setEditingNodeId]);

  // Delete/Backspace handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      // Don't delete when editing text
      if (editingNodeId) return;

      // Don't delete when focused on an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (selectedNodeId) {
        e.preventDefault();
        deleteNode(selectedNodeId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, editingNodeId, deleteNode]);

  // Undo/redo handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;

      // Don't intercept when editing text
      if (editingNodeId) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingNodeId, undo, redo]);

  return (
    <div className={isAnimating ? 'layout-animating h-full w-full' : 'h-full w-full'}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        deleteKeyCode={null}
        zoomOnDoubleClick={false}
        fitView
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="var(--text-secondary)"
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
    </div>
  );
}
