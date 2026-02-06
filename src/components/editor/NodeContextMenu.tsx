'use client';

import { useEffect, useRef } from 'react';

export interface ContextMenuAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface NodeContextMenuProps {
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export function NodeContextMenu({ x, y, actions, onClose }: NodeContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleContextMenu = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="bg-surface border-theme fixed z-50 min-w-[160px] overflow-hidden rounded-lg border shadow-lg"
      style={{ left: x, top: y }}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => {
            if (!action.disabled) {
              action.onClick();
              onClose();
            }
          }}
          disabled={action.disabled}
          className={`flex w-full cursor-pointer items-center gap-2 border-none px-3 py-2 text-left text-sm transition-colors ${
            action.danger
              ? 'text-red-500 hover:bg-red-500/10'
              : 'text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
          } disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent`}
          style={{ background: 'transparent' }}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}
