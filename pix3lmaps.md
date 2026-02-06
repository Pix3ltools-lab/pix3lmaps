# Claude Code Prompt — Pix3lMaps

## Goal

Build a **Next.js** (App Router) web app called **Pix3lMaps** for creating and managing graphic **mind maps**. The app must be ready to deploy on **Vercel** and must not use any backend or cloud database: all persistence happens in the browser via **IndexedDB** (using the **Dexie.js** library). All source code (variable names, comments, component names) and the entire user interface must be in **English**.

**Target audience**: AI-assisted content creators — people who produce **text, audio and video content with the help of AI tools**. Pix3lMaps helps them visually plan, structure and organize their content projects (e.g. brainstorming video topics, outlining blog posts, mapping podcast episode structures, planning social media content calendars, storyboarding AI-generated video scripts).

---

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Canvas/Rendering**: **React Flow** (`@xyflow/react`) for node rendering, connections and map interaction
- **Storage**: **Dexie.js** (IndexedDB wrapper) — no localStorage, no cloud
- **Image export**: `html-to-image` for PNG export
- **Data export/import**: native JSON
- **Fonts**: Montserrat + Roboto Condensed via Google Fonts (matching Pix3lCover)
- **Analytics**: `@vercel/analytics` (matching Pix3lCover)
- **Deploy target**: Vercel

---

## Required Features

### 1. Map Management

- The user can create, rename, duplicate and delete mind maps
- Each map is saved in IndexedDB with a unique ID, name, creation/modification date and node/edge data
- Landing page (dashboard) with a gallery of saved maps, sortable by date or name
  - **Search**: real-time text filter on map names
  - **Sort**: by date (newest first, default) or name (A-Z)
  - **Grid view**: cards showing a **thumbnail preview**, map name and last-modified date
  - **Actions on each card**: open (click), duplicate, delete (with confirmation)
- **Thumbnail preview** (same pattern as Pix3lCover's ProjectGallery):
  - Generated automatically on every save using `html-to-image` (`toJpeg`) on the React Flow container
  - Stored as **base64 JPEG** at **60% quality**, scaled down to **320×180 px**
  - Saved alongside the map data in IndexedDB (Dexie.js)
  - If generation fails, show a placeholder icon as fallback
  - Thumbnails are included in JSON export/import
- **Empty state**: when no maps exist, the dashboard shows a centered message (e.g. "No maps yet — create your first mind map and start planning your next content project!") with the "New Map" button
- When a new map is created, it starts with a single **root node** pre-filled with the text "Central Idea"
- Auto-save on every change with a 500ms debounce (thumbnail is regenerated on each auto-save)

### 2. Mind Map Editor

- Interactive canvas powered by React Flow with:
  - **Drag & drop** nodes (free repositioning)
  - **Zoom and pan** (scroll to zoom, click+drag on background to pan)
  - Optional **minimap** in the bottom-right corner
  - **Dot-grid background** with light opacity

### 3. Node Layouts — The user can choose between 3 modes

- **Radial**: central node with branches expanding in a 360° radial pattern. Uses a concentric-circles layout algorithm
- **Tree**: top-down hierarchical layout with vertical levels
- **Free**: no automatic layout, nodes stay where the user places them
- A selector in the toolbar lets the user switch layouts on the fly. Switching layout repositions nodes with an animated transition (300ms ease)
- In free mode, manual positions are saved. In radial/tree mode, the layout is recalculated on every node addition/removal

### 4. Node Operations

- **Add** a child node: click on a "+" button that appears on hover on each node
- **Edit text**: double-click on a node to enter inline edit mode
- **Delete** a node: Delete/Backspace key when selected, or context menu (right-click). Deleting a node also deletes all its children (with confirmation). **The root node cannot be deleted**
- **Node text**: supports **multiline** (Shift+Enter for new line inside a node). Maximum length **150 characters** per node — enough for a short sentence while keeping the map readable
- **Connect** nodes: drag from an output handle to an input handle to create manual connections (in addition to hierarchical parent-child ones)
- **Node image**: each node can optionally contain an image
  - Add/replace via the properties sidebar (file picker, accepts PNG/JPG/GIF/WebP)
  - The image is stored as a base64 data-URL inside IndexedDB (max **2 MB** per image; larger files are rejected with a toast warning)
  - The image is displayed above the text inside the node, scaled to fit the node width
  - A "Remove image" button in the sidebar allows clearing the image
- **Node comments**: each node can have a text-only comment (no character limit)
  - A small **comment icon** (e.g. chat bubble) appears on the node when a comment exists
  - Clicking the icon — or using a "Comments" button in the properties sidebar — opens a **modal dialog** to view and edit the comment
  - The modal contains a textarea and Save / Cancel buttons
  - Comments are saved along with the rest of the node data in IndexedDB and included in JSON export/import
- **Node link/URL**: each node can optionally have an attached URL
  - Editable from the properties sidebar (text input with URL validation)
  - When a URL is set, a small **link icon** appears on the node
  - Clicking the icon opens the URL in a new browser tab
  - Saved in IndexedDB and included in JSON export/import
- **Node emoji/icon**: each node can display an optional emoji or icon next to the text
  - Selectable from a **predefined icon set** in the properties sidebar, tailored for content creators:
    - **General**: star, flag, checkmark, warning, lightbulb, pin
    - **Content types**: video (camera/clapperboard), audio (microphone), text (document), image (picture)
    - **Workflow**: idea (lightbulb), draft (pencil), review (eye), done (checkmark), publish (rocket)
    - **AI**: sparkles/magic wand (AI-generated content marker)
  - The icon is displayed to the left of the node text
  - A "Remove icon" option clears the selection
  - Saved in IndexedDB and included in JSON export/import

### 5. Visual Customization (Colors and Styles)

- Each node has:
  - **Background color** selectable from a preset palette (inspired by Pix3lCover):
    `#FFFFFF` (White), `#ECF0F1` (Off-white), `#E67E22` (Orange), `#FF6B35` (Neon Orange),
    `#D4AF37` (Gold), `#E74C3C` (Red), `#3498DB` (Blue), `#2ECC71` (Green),
    `#9B59B6` (Purple), `#1ABC9C` (Teal), `#95A5A6` (Silver), `#2C3E50` (Dark Blue-Grey),
    `#F39C12` (Amber), `#000000` (Black)
  - **Shape**: rounded rectangle (default), pill, diamond
  - **Text size**: small / medium / large
- A properties panel (right sidebar) appears when a node is selected, with controls for color, shape and size
- Edges inherit the parent node's color with reduced opacity
- Edges use **curved bezier** style (React Flow default)

### 6. Export

- **Export as PNG**: use `html-to-image` to capture the entire canvas (not just the viewport) and download a .png file
- **Export as JSON**: download the map data (nodes, connections, layout, styles) as a .json file
- **Import from JSON**: load a .json file to recreate a map
- Export/import buttons in the toolbar

### 7. Keyboard Shortcuts

- `Ctrl/Cmd + S`: explicit save
- `Ctrl/Cmd + Z`: undo
- `Ctrl/Cmd + Shift + Z`: redo
- `Delete/Backspace`: delete selected node
- `Tab`: add child node to selected node
- `Enter`: add sibling node
- `Escape`: deselect all / close sidebar

---

## Design and UI

### General Aesthetics

> **Visual identity must be consistent with the sister app Pix3lCover** (`../pix3lcover`). Reuse the same dark palette, accent color and UI patterns.

- **Dark theme** as default with light theme toggle
- Modern and clean style, inspired by tools like Miro/Figma
- Font: **Montserrat** for the UI, **Roboto Condensed** for any technical/secondary data (loaded via Google Fonts)
- Main color palette (matching Pix3lCover):
  - Body / canvas background: `#1a1a1a`
  - Surfaces (toolbar, sidebar, cards): `#2a2a2a`
  - Accent (primary actions, active states, section headers): `#E67E22` (warm orange)
  - Text primary: `#ECF0F1` (off-white)
  - Text secondary / muted: `#95A5A6` (silver)
  - Borders: `border-gray-700`
  - Inputs: `bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#E67E22]`
  - Scrollbar: track `#2a2a2a`, thumb `#E67E22`, thumb hover `#d35400`
- **Light theme** palette:
  - Body / canvas background: `#F5F5F5`
  - Surfaces (toolbar, sidebar, cards): `#FFFFFF`
  - Accent: `#E67E22` (same orange — stays consistent across themes)
  - Text primary: `#1a1a1a`
  - Text secondary / muted: `#6B7280` (gray-500)
  - Borders: `border-gray-300`
  - Inputs: `bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#E67E22]`
  - Scrollbar: track `#E5E7EB`, thumb `#E67E22`, thumb hover `#d35400`
- **Brand logo**: the "3" in Pix**3**lMaps is rendered in red (`#E74C3C`) and the "l" in blue (`#3498DB`), matching the Pix3lCover logo convention
- Button styles:
  - Primary: `bg-[#E67E22] text-white`
  - Secondary: `bg-gray-700 text-gray-300 hover:bg-gray-600`
  - Disabled: `opacity-30`
- Smooth animations and transitions (150–300ms) on hover, focus, panel opening
- Focus rings use the orange accent `focus:ring-[#E67E22]`

### App Layout

- **Top toolbar**: map name (editable), layout selector (radial/tree/free), undo/redo buttons, zoom controls, export/import buttons, theme toggle
- **Central canvas**: fills all available space
- **Right sidebar** (collapsible, 280px): appears when a node is selected, shows node properties (color, shape, font size)
- **Dashboard** (landing page): grid of cards with saved maps, prominent "New Map" button
- **Footer**: `bg-[#2a2a2a]` with links and version info (matching Pix3lCover footer)

### Responsive

- Desktop-first but functional on tablet
- On mobile, show a message recommending desktop usage

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts and providers
│   ├── page.tsx            # Dashboard (map listing)
│   └── map/
│       └── [id]/
│           └── page.tsx    # Map editor
├── components/
│   ├── dashboard/
│   │   ├── MapCard.tsx          # Card with thumbnail preview, name, date, actions
│   │   ├── MapGallery.tsx       # Grid of MapCards with search, sort controls
│   │   └── CreateMapButton.tsx
│   ├── editor/
│   │   ├── MindMapCanvas.tsx    # React Flow wrapper
│   │   ├── MindMapNode.tsx      # Custom node component
│   │   ├── Toolbar.tsx
│   │   ├── PropertiesSidebar.tsx
│   │   └── LayoutSelector.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── ColorPicker.tsx
│       ├── Modal.tsx            # Reusable modal dialog (used for comments, confirmations)
│       └── ThemeToggle.tsx
├── hooks/
│   ├── useMapStore.ts      # Zustand store for current map state
│   ├── useAutoSave.ts
│   ├── useUndoRedo.ts
│   └── useKeyboardShortcuts.ts
├── lib/
│   ├── db.ts               # Dexie.js setup (IndexedDB)
│   ├── layouts.ts           # Layout algorithms (radial, tree)
│   ├── exportUtils.ts       # PNG and JSON export/import
│   └── constants.ts
└── types/
    └── index.ts             # TypeScript types (MindMap, MindMapNode, etc.)
```

---

## Important Implementation Details

1. **Zustand** for editor state management (nodes, edges, selection, undo/redo stack)
2. React Flow **custom nodes** must display: optional image (top), optional emoji/icon (left of text), text, color, shape, "+" button on hover, and small icon badges for comment (chat bubble) and link (link icon) when present
3. The **radial layout** algorithm must distribute children in concentric circles with equidistant angles, avoiding overlaps
4. The **tree layout** algorithm must calculate subtree widths to avoid horizontal overlaps
5. **Undo/Redo**: maintain a state snapshot stack (max 50 steps)
6. For **PNG export**, use `toSvg` or `toPng` from `html-to-image` on the React Flow container, computing the bounding box of all nodes to capture the entire map
7. **Layout transitions** should animate node positions using `requestAnimationFrame` or CSS transitions

---

## Development Phases

### Phase 1 — Foundation [COMPLETE]
- Create the Next.js project with all dependencies
- Define TypeScript types (`types/index.ts`): MindMap, MindMapNode, MindMapEdge, NodeShape, LayoutMode, etc.
- Set up Dexie.js database schema (`lib/db.ts`)
- Define constants (`lib/constants.ts`): color palette, icon set, default values
- Set up theme provider (dark/light) with CSS variables
- Root layout (`app/layout.tsx`) with Google Fonts (Montserrat, Roboto Condensed) and global styles
- **Deliverable**: project runs with `npm run dev`, shows an empty page with correct fonts and dark theme

### Phase 2 — Dashboard [COMPLETE]
- Dashboard page (`app/page.tsx`) with header, footer and main content area
- `CreateMapButton` component — creates a new map with a root "Central Idea" node and navigates to the editor
- `MapCard` component — displays thumbnail preview, map name, last-modified date, duplicate/delete actions
- `MapGallery` component — grid of MapCards with search input and sort toggle (date / name)
- Empty state with message and "New Map" button
- CRUD operations wired to Dexie.js: create, rename, duplicate, delete (with confirmation modal)
- **Deliverable**: dashboard is fully functional, maps can be created/duplicated/deleted, clicking a card navigates to `/map/[id]`

### Phase 3 — Editor Core [COMPLETE]
- Editor page (`app/map/[id]/page.tsx`) — loads map data from IndexedDB
- Zustand store (`hooks/useMapStore.ts`) — nodes, edges, selected node, layout mode
- `MindMapCanvas` component — React Flow wrapper with dot-grid background, minimap, zoom/pan
- `MindMapNode` component — basic custom node (text only, default shape and color)
- `Toolbar` component — map name (editable), back-to-dashboard button, zoom controls
- Add child node via "+" button on hover
- Inline text editing (double-click)
- Delete node (Delete/Backspace key), root node protected
- **Deliverable**: user can create a map, add/edit/delete nodes, navigate back to dashboard

### Phase 4 — Node Features [COMPLETE]
- Extend `MindMapNode` with: image display (top), emoji/icon (left of text), link badge, comment badge, 3 shapes (rounded rectangle, pill, diamond)
- `PropertiesSidebar` component (right, collapsible, 280px) — all node properties:
  - Color picker (14-color palette)
  - Shape selector
  - Text size (small / medium / large)
  - Image upload (file picker, max 2 MB, base64) with remove button
  - URL input with validation, remove button
  - Icon/emoji selector grid with remove option
  - "Comments" button to open modal
- `Modal` component — reusable, used for comment editing (textarea + Save/Cancel) and delete confirmations
- Multiline text support (Shift+Enter), 150-char limit
- Edges inherit parent node color with reduced opacity
- **Deliverable**: nodes are fully featured, sidebar controls work, comments modal works

### Phase 5 — Layout Algorithms
- `LayoutSelector` component in toolbar (Radial / Tree / Free)
- `lib/layouts.ts` — radial algorithm (concentric circles, equidistant angles, overlap avoidance)
- `lib/layouts.ts` — tree algorithm (top-down, subtree width calculation, no horizontal overlap)
- Free mode: positions saved as-is, no recalculation
- Animated transitions (300ms ease) when switching layout
- Auto-recalculate radial/tree layout on node add/remove
- **Deliverable**: all 3 layouts work, transitions are smooth, switching is seamless

### Phase 6 — Advanced Features [PARTIAL — undo/redo done, see notes]
- ~~`hooks/useUndoRedo.ts` — snapshot stack (max 50), wired to Zustand store~~ **DONE** — implemented directly in `useMapStore.ts` (snapshot-based, 50-step limit, 300ms batching for rapid changes, drag-aware)
- ~~Undo/redo buttons in toolbar~~ **DONE** — with disabled state when stack is empty
- ~~`hooks/useKeyboardShortcuts.ts` — all shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Shift+Z, Delete, Tab, Enter, Escape)~~ **PARTIAL** — Ctrl+Z/Ctrl+Shift+Z/Ctrl+Y and Delete/Backspace done inline in `MindMapCanvas.tsx`; Tab, Enter, Escape, Ctrl+S still TODO
- ~~`hooks/useAutoSave.ts` — debounced save (500ms) to IndexedDB, thumbnail regeneration on each save~~ **DONE** — auto-save implemented in `useMapStore.ts` via `debouncedPersist`; thumbnail regeneration still TODO
- Thumbnail generation using `html-to-image` (`toJpeg`, 320×180, 60% quality)
- `lib/exportUtils.ts`:
  - Export as PNG (full canvas bounding box)
  - Export as JSON (all map data including thumbnails, images, comments)
  - Import from JSON (file picker, validate, create map in IndexedDB)
- Export/import buttons in toolbar
- Manual connect nodes (drag output handle → input handle)
- Context menu (right-click) on nodes: add child, edit, delete
- **Deliverable**: undo/redo works, shortcuts work, auto-save works, export/import works, thumbnails appear on dashboard

### Phase 7 — Polish & Deploy [PARTIAL — theme toggle done]
- ~~Light theme implementation (CSS variables swap), ThemeToggle component in toolbar~~ **DONE** — dark/light theme via `data-theme` attribute + CSS custom properties, toggle in Toolbar
- Responsive adjustments for tablet
- Mobile detection with "Use desktop for best experience" message
- Footer with links and version info
- `vercel.json` configuration
- `@vercel/analytics` integration
- Final `npm run build` — fix any errors
- End-to-end manual testing of all features
- **Deliverable**: app is production-ready, builds clean, deploys to Vercel

---

## Vercel Configuration

Use a `vercel.json` aligned with the Pix3lCover project (adapt `framework` and `outputDirectory` for Next.js):

```json
{
  "framework": "nextjs"
}
```

Include `@vercel/analytics` for tracking (as in Pix3lCover).

---

## Commands to Run

```bash
npx create-next-app@latest pix3lmaps --typescript --tailwind --app --src-dir --eslint
cd pix3lmaps
npm install @xyflow/react dexie zustand html-to-image @vercel/analytics
npm install -D @types/node
```

After creating all files, verify that:
- `npm run build` compiles without errors
- `npm run dev` shows the dashboard and allows creating/editing a map
- Deploying to Vercel works without additional configuration
