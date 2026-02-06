import type { NodeShape, LayoutMode, TextSize } from '@/types';

// ── Node colors (matching Pix3lCover palette) ──────────────────────────
export const NODE_COLORS = [
  { value: '#FFFFFF', label: 'White' },
  { value: '#ECF0F1', label: 'Off-white' },
  { value: '#E67E22', label: 'Orange' },
  { value: '#FF6B35', label: 'Neon Orange' },
  { value: '#D4AF37', label: 'Gold' },
  { value: '#E74C3C', label: 'Red' },
  { value: '#3498DB', label: 'Blue' },
  { value: '#2ECC71', label: 'Green' },
  { value: '#9B59B6', label: 'Purple' },
  { value: '#1ABC9C', label: 'Teal' },
  { value: '#95A5A6', label: 'Silver' },
  { value: '#2C3E50', label: 'Dark Blue-Grey' },
  { value: '#F39C12', label: 'Amber' },
  { value: '#000000', label: 'Black' },
] as const;

export const NODE_SHAPES: { value: NodeShape; label: string }[] = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'pill', label: 'Pill' },
  { value: 'diamond', label: 'Diamond' },
];

export const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export const LAYOUT_MODES: { value: LayoutMode; label: string }[] = [
  { value: 'radial', label: 'Radial' },
  { value: 'tree', label: 'Tree' },
  { value: 'free', label: 'Free' },
];

// ── Defaults ───────────────────────────────────────────────────────────
export const DEFAULT_NODE_COLOR = '#3498DB';
export const DEFAULT_NODE_SHAPE: NodeShape = 'rectangle';
export const DEFAULT_TEXT_SIZE: TextSize = 'medium';
export const DEFAULT_LAYOUT_MODE: LayoutMode = 'free';
export const DEFAULT_ROOT_LABEL = 'Central Idea';

// ── Limits ─────────────────────────────────────────────────────────────
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_TEXT_LENGTH = 150;
export const MAX_UNDO_STEPS = 50;
export const UNDO_BATCH_MS = 300;
export const AUTO_SAVE_DEBOUNCE_MS = 500;
export const THUMBNAIL_WIDTH = 320;
export const THUMBNAIL_HEIGHT = 180;
export const THUMBNAIL_QUALITY = 0.6;

// ── Icon set (native emoji) ───────────────────────────────────────────
export const ICON_SET = [
  {
    group: 'General',
    icons: [
      { value: '⭐', label: 'Star' },
      { value: '🚩', label: 'Flag' },
      { value: '✅', label: 'Checkmark' },
      { value: '⚠️', label: 'Warning' },
      { value: '💡', label: 'Lightbulb' },
      { value: '📌', label: 'Pin' },
    ],
  },
  {
    group: 'Content Types',
    icons: [
      { value: '🎬', label: 'Video' },
      { value: '🎙️', label: 'Audio' },
      { value: '📄', label: 'Text' },
      { value: '🖼️', label: 'Image' },
    ],
  },
  {
    group: 'Workflow',
    icons: [
      { value: '💡', label: 'Idea' },
      { value: '✏️', label: 'Draft' },
      { value: '👁️', label: 'Review' },
      { value: '✔️', label: 'Done' },
      { value: '🚀', label: 'Publish' },
    ],
  },
  {
    group: 'AI',
    icons: [
      { value: '✨', label: 'AI / Sparkles' },
    ],
  },
] as const;
