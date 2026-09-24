# Annoty 

**Annoty** is a 100% on-device, zero-cost, zero-backend, zero-AI visual inspector and context capture tool for developers.

Click any element on your locally-running website to inspect computed styles, detect deterministic UI issues, attach structured change instructions, track with numbered visual pins, compare before/after style diffs, and export consolidated prompts formatted for any AI assistant (Claude Code, Cursor, Codex, ChatGPT) or team review.

```
┌────────────────────────────────────────────────────────┐
│                        Annoty                          │
│                                                        │
│  Browser DOM                                           │
│       ↓                                                │
│  Element Inspector (Box, Typography, Layout, CSS)      │
│       ↓                                                │
│  DOM Breadcrumbs (Click to retarget parent)            │
│       ↓                                                │
│  Visual Pins (① ② ③ anchored to elements)              │
│       ↓                                                │
│  Deterministic UI Diagnostics (Overflow, Contrast)     │
│       ↓                                                │
│  Style Diff Engine (Snapshot A vs B with deltas)       │
│       ↓                                                │
│  Local Context Compiler                                │
│       ↓                                                │
│  Clipboard / JSON / Markdown / Plain Text / File       │
└────────────────────────────────────────────────────────┘

        NO SERVER  •  NO DATABASE  •  NO API  •  NO AI  •  NO COST
```

---

## Key Features

### 1. Advanced Element Inspector
Click any element to inspect its exact metrics:
- **Element Tag & Selector:** CSS path and clean DOM tag.
- **Component & Source:** React fiber, Vue VNode, Svelte meta, or Astro source mapping down to exact file and line (`src/components/HeroCTA.tsx:42`).
- **Layout & Coordinates:** Exact pixel dimensions and viewport coordinates (`160 × 44px`, `x: 428, y: 312`).
- **Computed Styles Snapshot:** Box model (margin, padding, border), Typography (font, size, weight, line-height), Layout (display, position, flex/grid, gap), Appearance (color, background, radius, shadow, opacity), Behavior (overflow, cursor, pointer-events, z-index).
- **Viewport Presets:** Live dimensions with responsive presets (Mobile 375px, Tablet 768px, Desktop 1440px).

### 2. DOM Hierarchy Breadcrumbs
Select small icons or inner spans without frustration:
- Interactive breadcrumb bar displays the ancestor chain up to `<body>`:
  `main > section.hero > div.hero-content > button.hero-cta`
- Click any parent in the breadcrumb chain to instantly retarget the selection.

### 3. Visual Pins System
- Numbered floating pins (`①`, `②`, `③`) automatically anchored to annotated elements.
- Resilient to scrolling, resizing, and client-side page layout reflows via `ResizeObserver` and `MutationObserver`.
- Hover a pin to highlight the target element; click to open the annotation editor.
- Press `P` or use the command palette to toggle pin visibility.

### 4. Deterministic UI Diagnostics (No AI Needed)
Runs instantaneous, deterministic browser computations on inspected elements:
- **Horizontal Overflow Detection:** Flags elements whose `scrollWidth` exceeds their `clientWidth`.
- **WCAG Contrast Ratios:** Computes luminance contrast between text and background color, warning when below 4.5:1.
- **Offscreen Elements:** Detects elements extending outside the visible viewport boundaries.
- **Un-wrapped Flex Overflow:** Warns when child flex items exceed available parent container width.

### 5. Local Style Diff Engine
Measure real style changes between edits:
- **Snapshot Baseline (Snapshot A):** Take a snapshot of an element's computed styles before making code edits.
- **Compare Current (Snapshot B):** Re-inspect the element to compute a BEFORE → AFTER delta:
  - `Height: 40px → 48px (+8px)`
  - `Width: 160px → 172px (+12px)`
  - `Padding: 8px 16px → 12px 20px`
  - `Background: #000000 → #3ecf8e`
- Interactive comparison table modal and structured Markdown export.

### 6. Zero-Dependency Screenshot Capture
- Capture element bounding boxes, element + parent context, or viewport to PNG data URLs using browser-native SVG `<foreignObject>` and canvas rasterization.
- Persisted locally with annotations and downloadable directly with one click.

### 7. Rich Context Compiler & Multi-Format Exporter
Compile individual or grouped annotations into structured outputs:
- **Markdown:** Formatted with file locations, components, computed styles, diagnostics, and batch guidance templates.
- **JSON:** Complete, schema-validated JSON payload for tooling integration.
- **Plain Text:** Lightweight bullet list for quick sharing.
- **One-Click Actions:** Copy to clipboard or direct client-side file downloads (`.md`, `.json`, `.txt`).

### 8. Command Palette & Keyboard Shortcuts
Press `Ctrl + K` (or `Cmd + K`) anywhere to open the searchable command palette:
| Key | Action |
| --- | --- |
| `Ctrl + K` / `Cmd + K` | Open Command Palette |
| `A` or `I` | Toggle Element Inspection Mode |
| `P` | Toggle Visual Pins |
| `Alt + S` | Toggle Sidebar |
| `C` | Copy Context Prompt (Markdown) to Clipboard |
| `S` | Capture Element / Screen Screenshot |
| `Esc` | Close Dialogs / Cancel Selection |

### 9. Local Project Configuration (`annoty.config.json`)
Configure project settings locally with zero cloud dependencies:
```json
{
  "framework": "react",
  "sourceRoot": "src",
  "devPort": 5173,
  "captureScreenshots": true,
  "includeComputedStyles": true,
  "responsivePresets": [
    { "name": "Mobile", "width": 375, "height": 667 },
    { "name": "Tablet", "width": 768, "height": 1024 },
    { "name": "Desktop", "width": 1440, "height": 900 }
  ]
}
```

### 10. Local-First Storage Architecture
- **IndexedDB:** Persistent storage for annotations, groups, prompt history, screenshots, and style snapshots.
- **LocalStorage:** User preferences, sidebar open state, and configuration overrides.
- **Zero Cloud:** No accounts, no external database, no telemetry.

---

## Quick Start

### 1. In Any HTML / Vite / React / Next.js Project

Add the single-file overlay script to your development template:

```html
<script src="/annoty/overlay.js" data-annoty-mode="dev"></script>
```

### 2. Using the CLI

```bash
# Initialize and copy overlay script to your project
npx annoty init

# Check environment & setup
npx annoty doctor

# Clean up before git commits or production builds
npx annoty clean
```

---

## Security & Safety Guardrails

To prevent Annoty from being accidentally shipped to production, the overlay script contains a strict safety guardrail:
- It **only activates** when served from `localhost`, `127.0.0.1`, or when the `<script>` tag has `data-annoty-mode="dev"` explicitly set.
- All styles and UI controls are encapsulated within a private **Shadow DOM** so Annoty never leaks CSS into your application or conflicts with host styles.

---

## Monorepo Layout

```
annoty/
├── packages/
│   ├── overlay/               # Core 100% on-device overlay
│   │   ├── src/
│   │   │   ├── index.ts       # Coordinator entry point & shortcut bindings
│   │   │   ├── styleInspector.ts # Box model, typography, diagnostics
│   │   │   ├── styleDiffEngine.ts# Before -> After delta calculator
│   │   │   ├── screenshotCapture.ts # Native SVG/canvas screenshot generator
│   │   │   ├── projectConfig.ts  # annoty.config.json loader
│   │   │   ├── indexedDbStore.ts # Local IndexedDB storage engine
│   │   │   ├── promptCompiler.ts # Markdown, JSON, and Text compiler
│   │   │   └── ui/            # Shadow DOM Popup, Sidebar, Pins, Palette
│   │   └── tests/             # Unit test suite
│   └── cli/                   # Workspace CLI tool
├── demo-site/                 # Sandboxed React+Vite app for dogfooding
└── README.md
```

---

## Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test --workspace=packages/overlay

# 3. Build the overlay bundle
npm run build:overlay

# 4. Start the demo application
npm run dev:demo
```

---

## License

MIT © Shubham Rawat
