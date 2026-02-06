'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/lib/db';
import type { SavedMindMapData } from '@/types';
import Modal from '@/components/ui/Modal';
import CreateMapButton from './CreateMapButton';
import MapCard from './MapCard';

type SortBy = 'date' | 'name';

export default function MapGallery() {
  const [maps, setMaps] = useState<SavedMindMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const loadMaps = useCallback(async () => {
    const all = (await db.maps.toArray()) as SavedMindMapData[];
    setMaps(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  const filteredMaps = useMemo(() => {
    let result = maps;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [maps, searchQuery, sortBy]);

  const handleDuplicate = async (id: number) => {
    const original = await db.maps.get(id);
    if (!original) return;

    const now = new Date();
    const { id: _id, ...rest } = original;
    await db.maps.add({
      ...rest,
      name: `${original.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    });
    loadMaps();
  };

  const handleDeleteRequest = (id: number) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget === null) return;
    await db.maps.delete(deleteTarget);
    setDeleteTarget(null);
    loadMaps();
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const deleteMapName = deleteTarget
    ? maps.find((m) => m.id === deleteTarget)?.name ?? 'this map'
    : '';

  // Loading skeletons
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border-theme animate-pulse overflow-hidden rounded-lg border"
          >
            <div className="aspect-video bg-[var(--bg-input)]" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 rounded bg-[var(--bg-input)]" />
              <div className="h-3 w-1/2 rounded bg-[var(--bg-input)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state — no maps at all
  if (maps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          className="text-secondary mb-4 opacity-40"
        >
          <circle cx="32" cy="22" r="8" stroke="currentColor" strokeWidth="2" />
          <circle cx="14" cy="46" r="6" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="46" r="6" stroke="currentColor" strokeWidth="2" />
          <circle cx="32" cy="54" r="5" stroke="currentColor" strokeWidth="2" />
          <line x1="32" y1="30" x2="14" y2="40" stroke="currentColor" strokeWidth="2" />
          <line x1="32" y1="30" x2="50" y2="40" stroke="currentColor" strokeWidth="2" />
          <line x1="32" y1="30" x2="32" y2="49" stroke="currentColor" strokeWidth="2" />
        </svg>
        <h2 className="text-primary mb-1 text-lg font-semibold">No maps yet</h2>
        <p className="text-secondary mb-6 text-sm">
          Create your first mind map to get started
        </p>
        <CreateMapButton />
      </div>
    );
  }

  return (
    <>
      {/* Controls bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-secondary absolute left-3 top-1/2 -translate-y-1/2"
          >
            <circle cx="7" cy="7" r="4.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search maps..."
            className="text-primary placeholder:text-secondary w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortBy(sortBy === 'date' ? 'name' : 'date')}
          className="text-secondary hover:text-primary inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-sm font-medium transition-colors"
          title={sortBy === 'date' ? 'Sort by name' : 'Sort by date'}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="2" y1="4" x2="14" y2="4" />
            <line x1="2" y1="8" x2="10" y2="8" />
            <line x1="2" y1="12" x2="6" y2="12" />
          </svg>
          {sortBy === 'date' ? 'Newest' : 'A–Z'}
        </button>

        <CreateMapButton />
      </div>

      {/* No results state */}
      {filteredMaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-secondary text-sm">No maps match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMaps.map((map) => (
            <MapCard
              key={map.id}
              map={map}
              onDuplicate={handleDuplicate}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={deleteTarget !== null}
        title="Delete Map"
        message={
          <>
            Are you sure you want to delete <strong>{deleteMapName}</strong>? This
            action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
