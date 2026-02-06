'use client';

import { useParams, useRouter } from 'next/navigation';

export default function MapEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <main className="bg-body flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-primary text-2xl font-bold">
        Map Editor — Editing map #{id}
      </h1>
      <button
        onClick={() => router.push('/')}
        className="cursor-pointer rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110"
      >
        Back to Dashboard
      </button>
    </main>
  );
}
