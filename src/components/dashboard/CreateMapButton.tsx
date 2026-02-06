'use client';

import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_SHAPE,
  DEFAULT_TEXT_SIZE,
  DEFAULT_LAYOUT_MODE,
  DEFAULT_ROOT_LABEL,
} from '@/lib/constants';
import type { MindMapData } from '@/types';

interface CreateMapButtonProps {
  onCreated?: () => void;
  className?: string;
  label?: string;
}

export default function CreateMapButton({
  onCreated,
  className = '',
  label = 'New Map',
}: CreateMapButtonProps) {
  const router = useRouter();

  const handleCreate = async () => {
    const now = new Date();
    const newMap: MindMapData = {
      name: 'Untitled Map',
      nodes: [
        {
          id: 'root',
          type: 'mindmap',
          position: { x: 0, y: 0 },
          data: {
            label: DEFAULT_ROOT_LABEL,
            color: DEFAULT_NODE_COLOR,
            shape: DEFAULT_NODE_SHAPE,
            fontSize: DEFAULT_TEXT_SIZE,
          },
        },
      ],
      edges: [],
      layoutMode: DEFAULT_LAYOUT_MODE,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.maps.add(newMap);
    onCreated?.();
    router.push(`/map/${id}`);
  };

  return (
    <button
      onClick={handleCreate}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="8" y1="2" x2="8" y2="14" />
        <line x1="2" y1="8" x2="14" y2="8" />
      </svg>
      {label}
    </button>
  );
}
