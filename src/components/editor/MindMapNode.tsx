'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useMapStore } from '@/hooks/useMapStore';
import { MAX_TEXT_LENGTH } from '@/lib/constants';
import type { MindMapNode as MindMapNodeType, TextSize } from '@/types';

const FONT_SIZE_MAP: Record<TextSize, number> = {
  small: 12,
  medium: 14,
  large: 18,
};

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getShapeStyles(shape: string, selected: boolean) {
  const baseShadow = selected
    ? '0 0 0 2px var(--accent)'
    : '0 1px 3px rgba(0,0,0,0.2)';

  switch (shape) {
    case 'pill':
      return {
        borderRadius: 9999,
        boxShadow: baseShadow,
      };
    case 'diamond':
      return {
        borderRadius: 8,
        boxShadow: baseShadow,
        transform: 'rotate(45deg)',
        width: 100,
        height: 100,
      };
    default: // rectangle
      return {
        borderRadius: 8,
        boxShadow: baseShadow,
      };
  }
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
  const isDiamond = data.shape === 'diamond';
  const fontSize = FONT_SIZE_MAP[data.fontSize] ?? 14;

  useEffect(() => {
    if (isEditing) {
      setDraft(data.label);
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

  const shapeStyles = getShapeStyles(data.shape, !!selected);

  return (
    <div
      className="relative"
      style={{
        backgroundColor: data.color,
        ...shapeStyles,
        ...(isDiamond
          ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
          : { padding: '12px 16px', minWidth: 120, maxWidth: 240 }),
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

      {/* Icon badge */}
      {data.icon && (
        <span
          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs"
          style={{
            backgroundColor: 'var(--bg-surface)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            ...(isDiamond ? { transform: 'rotate(-45deg)' } : {}),
          }}
        >
          {data.icon}
        </span>
      )}

      {/* Content wrapper — counter-rotate for diamond */}
      <div
        style={
          isDiamond
            ? {
                transform: 'rotate(-45deg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 70,
                overflow: 'hidden',
                textAlign: 'center',
              }
            : {}
        }
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="nodrag nopan nowheel w-full resize-none border-none bg-transparent outline-none"
            style={{ color: textColor, fontSize, fontWeight: 500 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={confirmEdit}
            maxLength={MAX_TEXT_LENGTH}
            rows={2}
          />
        ) : (
          <div
            className="select-none break-words font-medium"
            style={{ color: textColor, fontSize }}
          >
            {data.label || 'Untitled'}
          </div>
        )}

        {/* Comment / URL indicators (hidden for diamond — not enough space) */}
        {!isDiamond && (data.comment || data.url) && (
          <div className="mt-1 flex gap-1.5">
            {data.comment && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={textColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.6 }}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
            {data.url && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={textColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.6 }}
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Add child button */}
      {hovered && !isEditing && (
        <button
          className="nodrag nopan absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--accent)] text-xs font-bold text-white shadow"
          onClick={handleAddChild}
          title="Add child node"
          style={isDiamond ? { transform: 'rotate(-45deg) translateY(-50%)' } : {}}
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
