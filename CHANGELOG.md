# Changelog

## v1.0.0 — 2026-02-07

First public release.

### Features

- **Dashboard** — gallery of saved maps with search, sort (date / name), duplicate, and delete
- **Map templates** — 7 pre-built starting structures (Blank, SWOT Analysis, Pros & Cons, Project Plan, Weekly Planner, Brainstorm, Meeting Notes)
- **Editor** — interactive React Flow canvas with zoom, pan, minimap, and dot-grid background
- **Node properties** — background color (14-color palette), shape (rectangle / pill / diamond), font size (small / medium / large), emoji icon, image, comment, and URL
- **Layouts** — radial, tree, and free positioning with animated transitions (300ms ease)
- **Undo / Redo** — snapshot-based history (max 50 steps, 300ms batching) with Ctrl+Z / Ctrl+Shift+Z
- **Keyboard shortcuts** — Tab (add child), Enter (add sibling), Delete/Backspace (delete node), Escape (deselect), Ctrl+S (save)
- **Export / Import** — PNG image export, JSON export and import
- **Thumbnails** — auto-generated on save (320x180, JPEG 60%), displayed on dashboard cards
- **Manual connections** — drag from output handle to input handle
- **Context menu** — right-click on nodes for quick actions (add child, edit, delete)
- **Themes** — dark (default) and light mode with CSS custom properties
- **Storage warning banner** — dismissible notice about local-only data persistence
- **Offline-first** — all data in IndexedDB via Dexie.js, no server required
- **Auto-save** — debounced (500ms) save to IndexedDB on every change
