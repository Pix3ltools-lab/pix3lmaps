'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useMapStore } from '@/hooks/useMapStore';
import { MAX_TEXT_LENGTH } from '@/lib/constants';
import type { MindMapNode as MindMapNodeType } from '@/types';

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function MindMapNodeInner({ id, data, selected }: NodeProps<MindMapNodeType>) {
  const editingNodeId = useMapStore((s) => s.editingNodeId);
  const addChildNode = useMapStore((s) => s.addChildNode);
  const updateNodeLabel = useMapStore((s) => s.updateNodeLabel);

  const isEditing = editingNodeId === id;
  const [hovered, setHovered] = useState(false);
  const [draft, setDraft] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const textColor = getLuminance(data.color) > 0.4 ? '#1a1a1a' : '#ECF0F1';

  useEffect(() => {
    if (isEditing) {
      setDraft(data.label);
      // Focus on next tick so textarea is rendered
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [isEditing, data.label]);

  const confirmEdit = useCallback(() => {
    updateNodeLabel(id, draft.trim() || data.label);
  }, [id, draft, data.label, updateNodeLabel]);

  const cancelEdit = useCallback(() => {
    updateNodeLabel(id, data.label);
  }, [id, data.label, updateNodeLabel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        confirmEdit();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    },
    [confirmEdit, cancelEdit],
  );

  const handleAddChild = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addChildNode(id);
    },
    [id, addChildNode],
  );

  return (
    <div
      className="relative px-4 py-3"
      style={{
        backgroundColor: data.color,
        borderRadius: 8,
        minWidth: 120,
        maxWidth: 240,
        boxShadow: selected
          ? '0 0 0 2px var(--accent)'
          : '0 1px 3px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 8,
          height: 8,
          background: 'rgba(150,150,150,0.5)',
        }}
      />

      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="nodrag nopan nowheel w-full resize-none border-none bg-transparent outline-none"
          style={{ color: textColor, font: 'inherit' }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={confirmEdit}
          maxLength={MAX_TEXT_LENGTH}
          rows={2}
        />
      ) : (
        <div
          className="select-none break-words text-sm font-medium"
          style={{ color: textColor }}
        >
          {data.label || 'Untitled'}
        </div>
      )}

      {/* Add child button */}
      {hovered && !isEditing && (
        <button
          className="nodrag nopan absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--accent)] text-xs font-bold text-white shadow"
          onClick={handleAddChild}
          title="Add child node"
        >
          +
        </button>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 8,
          height: 8,
          background: 'rgba(150,150,150,0.5)',
        }}
      />
    </div>
  );
}

export const MindMapNode = React.memo(MindMapNodeInner);
