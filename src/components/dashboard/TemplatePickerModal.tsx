'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { TEMPLATES } from '@/lib/templates';
import type { MindMapData } from '@/types';
import type { MapTemplate } from '@/lib/templates';

interface TemplatePickerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function TemplatePickerModal({
  open,
  onClose,
  onCreated,
}: TemplatePickerModalProps) {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  const handleSelect = async (template: MapTemplate) => {
    const now = new Date();
    const newMap: MindMapData = {
      name: template.id === 'blank' ? 'Untitled Map' : template.name,
      nodes: structuredClone(template.nodes),
      edges: structuredClone(template.edges),
      layoutMode: template.layoutMode,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.maps.add(newMap);
    onCreated?.();
    router.push(`/map/${id}`);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-surface border-theme mx-4 w-full max-w-2xl rounded-lg border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-primary mb-4 text-lg font-semibold">
          Choose a template
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className="border-theme flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all hover:ring-2 hover:ring-[var(--accent)]"
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-primary text-sm font-semibold">
                {t.name}
              </span>
              <span className="text-secondary text-xs leading-snug">
                {t.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
