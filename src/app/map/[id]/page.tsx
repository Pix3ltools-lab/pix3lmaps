'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import { useMapStore } from '@/hooks/useMapStore';
import { Toolbar } from '@/components/editor/Toolbar';
import { MindMapCanvas } from '@/components/editor/MindMapCanvas';

function EditorInner() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const loading = useMapStore((s) => s.loading);
  const error = useMapStore((s) => s.error);
  const loadMap = useMapStore((s) => s.loadMap);
  const reset = useMapStore((s) => s.reset);

  useEffect(() => {
    if (!isNaN(id)) loadMap(id);
    return () => reset();
  }, [id, loadMap, reset]);

  if (loading) {
    return (
      <div className="bg-body flex h-screen items-center justify-center">
        <div className="text-secondary text-sm">Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-body flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="cursor-pointer rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110"
          style={{ border: 'none' }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-body flex h-screen flex-col">
      <Toolbar />
      <div className="flex-1 overflow-hidden">
        <MindMapCanvas />
      </div>
    </div>
  );
}

export default function MapEditorPage() {
  return (
    <ReactFlowProvider>
      <EditorInner />
    </ReactFlowProvider>
  );
}
