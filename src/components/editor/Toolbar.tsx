'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useReactFlow } from '@xyflow/react';
import { useMapStore } from '@/hooks/useMapStore';
import { useTheme } from '@/contexts/ThemeContext';
import { LayoutSelector } from './LayoutSelector';
import { exportPng, exportJson, importJson } from '@/lib/exportUtils';

const toolbarBtnClass =
  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]';

export function Toolbar() {
  const router = useRouter();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { theme, toggleTheme } = useTheme();

  const mapName = useMapStore((s) => s.mapName);
  const setMapName = useMapStore((s) => s.setMapName);
  const nodes = useMapStore((s) => s.nodes);
  const edges = useMapStore((s) => s.edges);
  const layoutMode = useMapStore((s) => s.layoutMode);
  const reset = useMapStore((s) => s.reset);
  const undo = useMapStore((s) => s.undo);
  const redo = useMapStore((s) => s.redo);
  const canUndo = useMapStore((s) => s.past.length > 0);
  const canRedo = useMapStore((s) => s.future.length > 0);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(mapName);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameDraft(mapName);
  }, [mapName]);

  useEffect(() => {
    if (isEditingName) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingName]);

  const confirmName = useCallback(() => {
    const trimmed = nameDraft.trim();
    if (trimmed) setMapName(trimmed);
    else setNameDraft(mapName);
    setIsEditingName(false);
  }, [nameDraft, mapName, setMapName]);

  const handleBack = useCallback(() => {
    reset();
    router.push('/');
  }, [reset, router]);

  const handleExportPng = useCallback(async () => {
    await fitView({ padding: 0.1, duration: 0 });
    // Wait for fitView to settle
    await new Promise((r) => setTimeout(r, 150));
    const el = document.querySelector('.react-flow') as HTMLElement | null;
    if (!el) return;
    try {
      await exportPng(el, mapName);
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  }, [fitView, mapName]);

  const handleExportJson = useCallback(() => {
    exportJson(mapName, nodes, edges, layoutMode);
  }, [mapName, nodes, edges, layoutMode]);

  const handleImportJson = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const newId = await importJson(file);
        router.push(`/map/${newId}`);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Import failed');
      }
      // Reset input so the same file can be re-imported
      e.target.value = '';
    },
    [router],
  );

  return (
    <header className="bg-surface border-theme flex items-center justify-between border-b px-4 py-2">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-transparent px-2 py-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          style={{ border: 'none' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 12L6 8l4-4" />
          </svg>
          Dashboard
        </button>

        <span className="text-[var(--border-color)]">|</span>

        {isEditingName ? (
          <input
            ref={inputRef}
            className="rounded border border-[var(--border-color)] bg-[var(--bg-input)] px-2 py-0.5 text-sm text-[var(--text-primary)] outline-none"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={confirmName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmName();
              if (e.key === 'Escape') {
                setNameDraft(mapName);
                setIsEditingName(false);
              }
            }}
            maxLength={100}
          />
        ) : (
          <span
            className="cursor-pointer text-sm font-semibold text-[var(--text-primary)] hover:underline"
            onClick={() => setIsEditingName(true)}
            title="Click to rename"
          >
            {mapName}
          </span>
        )}

        <span className="text-[var(--border-color)]">|</span>

        <LayoutSelector />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-secondary)]"
          title="Undo (Ctrl+Z)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7h7a3 3 0 0 1 0 6H9" />
            <path d="M6 4L3 7l3 3" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-secondary)]"
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 7H6a3 3 0 0 0 0 6h1" />
            <path d="M10 4l3 3-3 3" />
          </svg>
        </button>

        <span className="mx-1 text-[var(--border-color)]">|</span>

        <button
          onClick={() => zoomIn()}
          className={toolbarBtnClass}
          title="Zoom in"
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
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" />
            <path d="M5 7h4M7 5v4" />
          </svg>
        </button>
        <button
          onClick={() => zoomOut()}
          className={toolbarBtnClass}
          title="Zoom out"
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
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" />
            <path d="M5 7h4" />
          </svg>
        </button>
        <button
          onClick={() => fitView({ padding: 0.2 })}
          className={toolbarBtnClass}
          title="Fit view"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
          </svg>
        </button>

        <span className="mx-1 text-[var(--border-color)]">|</span>

        <button
          onClick={toggleTheme}
          className={toolbarBtnClass}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="8" r="3" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 10A6 6 0 016 2a6 6 0 108 8z" />
            </svg>
          )}
        </button>

        <span className="mx-1 text-[var(--border-color)]">|</span>

        {/* Export PNG */}
        <button
          onClick={handleExportPng}
          className={toolbarBtnClass}
          title="Export as PNG"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="12" height="12" rx="2" />
            <circle cx="5.5" cy="5.5" r="1.5" />
            <path d="M14 10l-3-3-7 7" />
          </svg>
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExportJson}
          className={toolbarBtnClass}
          title="Export as JSON"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 2v8M4 7l4 4 4-4" />
            <path d="M2 13h12" />
          </svg>
        </button>

        {/* Import JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={toolbarBtnClass}
          title="Import JSON"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 10V2M4 5l4-4 4 4" />
            <path d="M2 13h12" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJson}
          className="hidden"
        />
      </div>
    </header>
  );
}
