import { toPng } from 'html-to-image';
import { db } from '@/lib/db';
import type { MindMapNode, MindMapEdge, LayoutMode } from '@/types';

const FILTER_SELECTORS = ['.react-flow__minimap', '.react-flow__panel'];

function filterNode(node: HTMLElement): boolean {
  return !FILTER_SELECTORS.some((sel) => node.matches?.(sel));
}

// ── Export PNG ──────────────────────────────────────────────────────

export async function exportPng(
  containerEl: HTMLElement,
  fileName: string,
): Promise<void> {
  const dataUrl = await toPng(containerEl, {
    pixelRatio: 2,
    filter: filterNode,
  });
  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = dataUrl;
  link.click();
}

// ── Export JSON ─────────────────────────────────────────────────────

interface ExportedMap {
  version: number;
  name: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  layoutMode: LayoutMode;
  thumbnail?: string;
  exportedAt: string;
}

export function exportJson(
  name: string,
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  layoutMode: LayoutMode,
  thumbnail?: string,
): void {
  const data: ExportedMap = {
    version: 1,
    name,
    nodes,
    edges,
    layoutMode,
    thumbnail,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${name}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Import JSON ────────────────────────────────────────────────────

function isValidExportedMap(obj: unknown): obj is ExportedMap {
  if (typeof obj !== 'object' || obj === null) return false;
  const m = obj as Record<string, unknown>;
  return (
    typeof m.version === 'number' &&
    typeof m.name === 'string' &&
    Array.isArray(m.nodes) &&
    Array.isArray(m.edges) &&
    typeof m.layoutMode === 'string'
  );
}

export async function importJson(file: File): Promise<number> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);

  if (!isValidExportedMap(parsed)) {
    throw new Error('Invalid mind map file format');
  }

  const now = new Date();
  const id = await db.maps.add({
    name: parsed.name,
    nodes: parsed.nodes,
    edges: parsed.edges,
    layoutMode: parsed.layoutMode as LayoutMode,
    thumbnail: parsed.thumbnail,
    createdAt: now,
    updatedAt: now,
  });

  return id as number;
}
