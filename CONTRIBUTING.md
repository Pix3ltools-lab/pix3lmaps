# Contributing to Pix3lMaps

Thank you for your interest in contributing to Pix3lMaps! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive in all interactions
- Provide constructive feedback
- Focus on the project goals and quality

## Reporting Bugs

1. Check [existing issues](https://github.com/pix3ltools/pix3lmaps/issues) to avoid duplicates
2. Open a new issue with:
   - A clear title and description
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Browser and OS information

## Suggesting Features

Open an issue with the **enhancement** label. Describe the feature, the use case, and how it fits with the existing editor workflow.

## Pull Request Process

1. **Fork** the repository
2. **Create a branch** from `main`: `git checkout -b feat/your-feature`
3. **Make your changes** and test locally
4. **Commit** using conventional commits (see below)
5. **Push** and open a Pull Request against `main`
6. Fill in the PR description with what changed and why

## Development Setup

### Prerequisites

- Node.js 18+
- Git

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/pix3lmaps.git
cd pix3lmaps
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

Ensure the build passes with no errors before submitting a PR.

## Code Style

### General

- **TypeScript** strict mode — no `any` unless absolutely necessary
- **Functional components** with hooks
- Keep files focused — one component per file
- Prefer editing existing files over creating new ones

### Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Components | PascalCase | `MindMapCanvas.tsx` |
| Hooks | camelCase with `use` prefix | `useMapStore.ts` |
| Utilities | camelCase | `layouts.ts` |
| Constants | UPPER_CASE | `DEFAULT_NODE_COLOR` |
| CSS | Tailwind utility classes | `className="flex gap-2"` |

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add batch export for saved maps
fix: correct node positioning after layout
docs: update README with new feature list
style: align toolbar buttons on mobile
refactor: extract layout logic into utility
chore: update dependencies
```

## Architecture Overview

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | Routing, SSR shell |
| State | Zustand | Global editor state |
| Storage | Dexie.js (IndexedDB) | Persistent map storage |
| Styling | Tailwind CSS 4 | UI components and theming |
| Canvas | React Flow (`@xyflow/react`) | Node/edge rendering and interaction |

### Key Files

| File | Purpose |
|---|---|
| `src/hooks/useMapStore.ts` | Zustand store with all editor state and actions |
| `src/lib/db.ts` | Dexie database schema (maps) |
| `src/lib/constants.ts` | Default colors, shapes, templates |
| `src/lib/layouts.ts` | Radial and tree layout algorithms |
| `src/components/editor/MindMapCanvas.tsx` | Main React Flow canvas |
| `src/components/editor/MindMapNode.tsx` | Custom node component |
| `src/components/editor/Toolbar.tsx` | Navigation, zoom, theme, layout controls |

## Testing Checklist

Before submitting a PR, verify:

- [ ] Nodes can be created, edited, and deleted
- [ ] Drag-and-drop positioning works
- [ ] Radial and tree layouts arrange nodes correctly
- [ ] Undo/redo restores previous states
- [ ] Export (PNG, JSON) and import (JSON) work
- [ ] Templates load into editor correctly
- [ ] Keyboard shortcuts (Tab, Enter, Escape, Ctrl+S) work
- [ ] Dashboard search, sort, duplicate, and delete work
- [ ] Dark and light themes render correctly
- [ ] `npm run build` passes with no errors
- [ ] No hydration warnings in the console

## Questions?

Reach out via [@pix3ltools](https://x.com/pix3ltools) on X or open a discussion on GitHub.
