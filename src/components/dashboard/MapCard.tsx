'use client';

import { useRouter } from 'next/navigation';
import type { SavedMindMapData } from '@/types';

interface MapCardProps {
  map: SavedMindMapData;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MapCard({ map, onDuplicate, onDelete }: MapCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/map/${map.id}`)}
      className="group bg-surface border-theme relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:ring-2 hover:ring-[var(--accent)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-[var(--bg-input)]">
        {map.thumbnail ? (
          <img
            src={map.thumbnail}
            alt={map.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="text-secondary opacity-40"
            >
              <circle cx="24" cy="18" r="6" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="34" r="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="36" cy="34" r="4" stroke="currentColor" strokeWidth="2" />
              <line x1="24" y1="24" x2="12" y2="30" stroke="currentColor" strokeWidth="2" />
              <line x1="24" y1="24" x2="36" y2="30" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(map.id);
            }}
            className="cursor-pointer rounded-md bg-black/60 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            title="Duplicate"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="5" width="9" height="9" rx="1" />
              <path d="M2 11V2.5A.5.5 0 0 1 2.5 2H11" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(map.id);
            }}
            className="cursor-pointer rounded-md bg-black/60 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-600"
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4h12" />
              <path d="M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4" />
              <path d="M12.5 4l-.5 9.5a1 1 0 0 1-1 .5H5a1 1 0 0 1-1-.5L3.5 4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-primary truncate text-sm font-semibold">{map.name}</h3>
        <p className="text-secondary mt-1 text-xs">{formatDate(map.updatedAt)}</p>
      </div>
    </div>
  );
}
