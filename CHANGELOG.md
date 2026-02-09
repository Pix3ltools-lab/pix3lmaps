# Changelog

## v1.2.0 — 2026-02-09

### Added

- **Move branch** — reparent a node (and its entire subtree) to a new parent via right-click context menu ("Move branch...") or keyboard Ctrl+X / Ctrl+V
- **Toast notifications** — transient feedback messages (info / success / error) for move operations
- Visual feedback during move: cut node shown at 50% opacity, crosshair cursor in move-target mode
- Validation: prevents moving root node, moving to self, or moving under own descendant

## v1.1.0 — 2026-02-09

### Added

- **CONTRIBUTING.md** — contribution guidelines adapted for Pix3lMaps
- **LICENSE** — MIT license
- **Screenshot** in README.md

### Fixed

- **Dot grid** now visible in light theme (dedicated `--dot-grid` CSS variable)

### Changed

- **pix3lmaps.md** spec aligned with actual codebase (file structure, phase statuses, architecture)

## v1.0.1 — 2026-02-07

### Added

- **Privacy Policy** page at `/privacy` with GDPR info, adapted from Pix3lCover
- **Descriptive browser tab title** — "Pix3lMaps — Visual Mind Mapping for Content Creators"

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
