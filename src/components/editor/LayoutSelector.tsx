'use client';

import { useMapStore } from '@/hooks/useMapStore';
import { LAYOUT_MODES } from '@/lib/constants';
import type { LayoutMode } from '@/types';

function LayoutIcon({ mode }: { mode: LayoutMode }) {
  if (mode === 'radial') {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="8" cy="8" r="2" />
        <circle cx="8" cy="8" r="6" fill="none" />
        <circle cx="8" cy="2" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="13" cy="5.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="13" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="3" cy="5.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="3" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (mode === 'tree') {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <rect x="5.5" y="1" width="5" height="3" rx="1" fill="currentColor" stroke="none" />
        <rect x="1" y="10" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
        <rect x="6" y="10" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
        <rect x="11" y="10" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
        <path d="M8 4v2.5M8 6.5H3M8 6.5h5M3 6.5V10M8 6.5V10M13 6.5V10" />
      </svg>
    );
  }

  // free
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <rect x="1" y="2" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
      <rect x="9" y="1" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
      <rect x="6" y="8" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
      <rect x="11" y="11" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LayoutSelector() {
  const layoutMode = useMapStore((s) => s.layoutMode);
  const setLayoutMode = useMapStore((s) => s.setLayoutMode);

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-[var(--bg-input)] p-0.5">
      {LAYOUT_MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => setLayoutMode(m.value)}
          className="flex h-7 cursor-pointer items-center gap-1 rounded-md border-none px-2 text-xs font-medium transition-colors"
          style={{
            backgroundColor:
              m.value === layoutMode ? 'var(--accent)' : 'transparent',
            color: m.value === layoutMode ? '#fff' : 'var(--text-secondary)',
          }}
          title={`${m.label} layout`}
        >
          <LayoutIcon mode={m.value} />
          {m.label}
        </button>
      ))}
    </div>
  );
}
