'use client';

import React, { useCallback } from 'react';
import { useMapStore } from '@/hooks/useMapStore';
import {
  NODE_COLORS,
  NODE_SHAPES,
  TEXT_SIZES,
  ICON_SET,
} from '@/lib/constants';
import type { MindMapNodeData, NodeShape, TextSize } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────

function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-theme border-b px-3 py-3">
      <div className="text-secondary mb-2 text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </div>
      {children}
    </div>
  );
}

function ShapePreview({ shape, active }: { shape: NodeShape; active: boolean }) {
  const size = 28;
  const stroke = active ? 'var(--accent)' : 'var(--text-secondary)';
  const fill = active ? 'var(--accent)' : 'none';
  const strokeW = active ? 2 : 1.5;

  switch (shape) {
    case 'pill':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <rect
            x="2"
            y="7"
            width="24"
            height="14"
            rx="7"
            fill={fill}
            fillOpacity={active ? 0.15 : 0}
            stroke={stroke}
            strokeWidth={strokeW}
          />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <rect
            x="6"
            y="6"
            width="16"
            height="16"
            rx="2"
            fill={fill}
            fillOpacity={active ? 0.15 : 0}
            stroke={stroke}
            strokeWidth={strokeW}
            transform="rotate(45 14 14)"
          />
        </svg>
      );
    default: // rectangle
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <rect
            x="2"
            y="7"
            width="24"
            height="14"
            rx="3"
            fill={fill}
            fillOpacity={active ? 0.15 : 0}
            stroke={stroke}
            strokeWidth={strokeW}
          />
        </svg>
      );
  }
}

// ── Main component ───────────────────────────────────────────────────

export function NodePropertiesSidebar() {
  const selectedNodeId = useMapStore((s) => s.selectedNodeId);
  const nodes = useMapStore((s) => s.nodes);
  const updateNodeData = useMapStore((s) => s.updateNodeData);

  const node = nodes.find((n) => n.id === selectedNodeId);

  const update = useCallback(
    (partial: Partial<MindMapNodeData>) => {
      if (selectedNodeId) updateNodeData(selectedNodeId, partial);
    },
    [selectedNodeId, updateNodeData],
  );

  if (!node) return null;

  const { color, shape, fontSize, icon, comment, url } = node.data;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-theme border-b px-3 py-2.5">
        <div className="text-primary text-xs font-semibold">Node Properties</div>
      </div>

      {/* Color */}
      <SidebarSection label="Color">
        <div className="grid grid-cols-7 gap-1.5">
          {NODE_COLORS.map((c) => (
            <button
              key={c.value}
              className="h-7 w-7 cursor-pointer rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c.value,
                borderColor:
                  c.value === color ? 'var(--accent)' : 'var(--border-color)',
              }}
              onClick={() => update({ color: c.value })}
              title={c.label}
            />
          ))}
        </div>
      </SidebarSection>

      {/* Shape */}
      <SidebarSection label="Shape">
        <div className="flex gap-2">
          {NODE_SHAPES.map((s) => (
            <button
              key={s.value}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors"
              style={{
                backgroundColor:
                  s.value === shape ? 'var(--bg-input)' : 'transparent',
                border:
                  s.value === shape
                    ? '1px solid var(--accent)'
                    : '1px solid transparent',
              }}
              onClick={() => update({ shape: s.value })}
              title={s.label}
            >
              <ShapePreview shape={s.value} active={s.value === shape} />
              <span
                className="text-[10px]"
                style={{
                  color:
                    s.value === shape
                      ? 'var(--accent)'
                      : 'var(--text-secondary)',
                }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </SidebarSection>

      {/* Font Size */}
      <SidebarSection label="Font Size">
        <div className="flex gap-1.5">
          {TEXT_SIZES.map((t) => (
            <button
              key={t.value}
              className="flex-1 cursor-pointer rounded-md py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor:
                  t.value === fontSize ? 'var(--bg-input)' : 'transparent',
                border:
                  t.value === fontSize
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border-color)',
                color:
                  t.value === fontSize
                    ? 'var(--accent)'
                    : 'var(--text-secondary)',
              }}
              onClick={() => update({ fontSize: t.value as TextSize })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </SidebarSection>

      {/* Icon */}
      <SidebarSection label="Icon">
        {icon && (
          <button
            className="text-secondary mb-2 cursor-pointer border-none bg-transparent text-[11px] underline"
            onClick={() => update({ icon: undefined })}
          >
            Remove icon
          </button>
        )}
        {ICON_SET.map((group) => (
          <div key={group.group} className="mb-2">
            <div className="text-secondary mb-1 text-[10px]">{group.group}</div>
            <div className="flex flex-wrap gap-1">
              {group.icons.map((ic) => (
                <button
                  key={ic.value}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-sm transition-colors"
                  style={{
                    backgroundColor:
                      ic.value === icon ? 'var(--bg-input)' : 'transparent',
                    border:
                      ic.value === icon
                        ? '1px solid var(--accent)'
                        : '1px solid transparent',
                  }}
                  onClick={() => update({ icon: ic.value })}
                  title={ic.label}
                >
                  {ic.value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </SidebarSection>

      {/* Comment */}
      <SidebarSection label="Comment">
        <textarea
          className="nodrag nopan nowheel text-primary w-full resize-none rounded-md px-2 py-1.5 text-xs outline-none"
          style={{
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
          }}
          placeholder="Add a comment..."
          rows={3}
          value={comment ?? ''}
          onChange={(e) => update({ comment: e.target.value || undefined })}
        />
      </SidebarSection>

      {/* URL */}
      <SidebarSection label="URL">
        <input
          type="url"
          className="nodrag nopan text-primary w-full rounded-md px-2 py-1.5 text-xs outline-none"
          style={{
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
          }}
          placeholder="https://..."
          value={url ?? ''}
          onChange={(e) => update({ url: e.target.value || undefined })}
        />
      </SidebarSection>
    </div>
  );
}
