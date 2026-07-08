# Annoty ✏️

**Annoty** is a developer tool that lets you click on elements inside your own locally-running website, attach short plain-English instructions ("make this green", "increase font size"), batch up multiple annotations, and then generate **one consolidated, structured Markdown prompt** to copy and paste directly into your AI coding tool (Claude Code, Cursor, ChatGPT, etc.) to make all the changes at once.

This is a local-only, single-user, no-backend tool. No servers, no accounts, and no LLM API calls. Everything is stored locally in your browser.

---

## Features

- 🎯 **Visual Selection Mode:** Hover and click to select any element on your page without page navigation or side-effects interfering.
- 📂 **Multi-Tier Source Mapping:** Automatically resolves clicked DOM elements back to source code locations:
  - **Tier 1 (React & Preact):** Inspects internal fiber/vnode elements in development mode to extract component file paths, line, and column numbers.
  - **Tier 2 (Framework-Native & Compiler-Injected):** 
    - **Vue:** Walks component instances/VNodes for file paths.
    - **Svelte:** Inspects Svelte's development meta context (`__svelte_meta`) to map files and lines.
    - **Astro:** Reads compiler-injected `data-astro-source-file` and `data-astro-source-loc` properties.
    - **Generic Build Tools (Vite, Webpack, etc.):** Automatically matches standard tool-injected attributes (like `data-source-file` and `data-source-line`), enabling custom plugins for SolidJS, Lit, Angular, and more.
  - **Tier 3 (Universal Data Attribute):** Match manual `data-annoty-source` markers (works with any framework or static HTML, e.g. `data-annoty-source="src/components/Header.php:12"`).
  - **Tier 4 (CSS Selector):** Resilient CSS selectors + surrounding semantic landmark context fallback.
- 📦 **Encapsulated UI:** All overlay UI components (toggle button, popups, and session sidebar) run inside a **Shadow DOM** to prevent CSS leakage to or from your website.
- 🗂️ **Local Storage Persistence:** Annotations survive page reloads and can be cleared in a single click.
- ⌨️ **Keyboard Shortcut:** Toggle selection mode instantly using `Ctrl + Shift + A`.

---

## Installation & CLI Workflow

Annoty features a robust, professional command line interface to manage configurations, test setups, and perform workspace cleanups.

### 🔑 Authentication
* `npx annoty-cli login` — Authenticates your local machine via browser redirection.
* `npx annoty-cli logout` — Safely signs out of the active session and clears local credentials from your system.

### 🚀 Setup & Initialization
* `npx annoty-cli init` — Automatically copies the compiled local `overlay.js` script to your project's `public/` directory and injects the matching script tag into `index.html`.

### 🩺 Status & Diagnostics
* `npx annoty-cli status` — Displays your active session (logged-in user) and scans the current directory's HTML injection status.
* `npx annoty-cli doctor` — Runs validation diagnostics for environment compatibility (Node.js version, credential states, and port loops).
* `npx annoty-cli groups` — Lists your synced annotation groups directly from the console.

### 🧹 Cleaning, Removal & Updates
* `npx annoty-cli clean` — Codebase hygiene command. Removes all injected Annoty tags and deletes the local `public/overlay.js` asset from the workspace (run this before git commits or production builds).
* `npx annoty-cli uninstall` — Completely deletes all global Annoty credentials and configuration folders from your computer.
* `npx annoty-cli update` — Checks for updates from npm and installs the latest version globally.

---

## Security & Safety Guardrails

To prevent Annoty from being accidentally shipped to production, the overlay script contains a strict safety guardrail:
- It **will only activate** if served from `localhost` / `127.0.0.1` **OR** if the `<script>` tag has the `data-annoty-mode="dev"` attribute explicitly set.
- If neither condition is met, the script halts and outputs a clear warning in the browser console.

---

## 🔌 Build Plugins for Accurate Source Mapping (Vite/React)

To automatically inject accurate component file names, line, and column numbers onto your elements in development, install the build plugin package and configure it in your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { annotyReact } from '@annoty/build-plugins';

export default defineConfig({
  plugins: [
    react(),
    annotyReact() // Walks the JSX AST to attach source file/line location. Runs in dev serve mode only.
  ]
});
```

---

## Direct Manual Mapping (Tier 3)


For maximum precision or for non-React/Vue projects, you can annotate elements in your source code directly using the `data-annoty-source` attribute:

```html
<span class="price-tag" data-annoty-source="src/components/Pricing.tsx:32">$29/mo</span>
```

---

## Compiled Prompt Sample

Below is an example of the structured Markdown prompt generated by Annoty:

```markdown
## UI Change Requests (3 elements)

### File: src/components/Hero.tsx

**1. Line 10** — `<h1 class="hero-title">Build faster with AI</h1>`
Change text color to emerald green (#3ecf8e) and make font-weight bold.

**2. Line 16** — `<button class="cta-button">Get Started</button>`
Increase padding to 12px vertical and 24px horizontal.

### File: src/components/Pricing.tsx

**3. Line 11** — `<div class="price" data-annoty-source="src/components/Pricing.tsx:11">$29/mo</div>`
Make the font size 2.5rem and change color to light gray.

---
Please apply these changes directly in the referenced files where a file/line is given. For unmapped elements, search the codebase for the described element using its text content and selector context. Preserve existing styling conventions in the codebase (Tailwind, CSS modules, styled-components — detect from context) and don't modify unrelated code.
```

---

## Monorepo Layout

```
annoty/
├── packages/
│   └── overlay/                # Core injectable overlay codebase
│       ├── src/
│       │   ├── index.ts        # Coordinator entry point
│       │   ├── inject.ts       # Shadow DOM builder
│       │   ├── elementPicker.ts# Mouse hover outline & click blocker
│       │   ├── sourceMapper.ts # React/Vue/data-attribute mapping
│       │   ├── annotationStore.ts # LocalStorage store wrapper
│       │   ├── promptCompiler.ts # Markdown compiling engine
│       │   └── ui/             # Toggle button, Popup, Sidebar UI
│       └── vite.config.ts      # IIFE single-file library packager
├── demo-site/                  # Sandboxed React+Vite app for dogfooding
└── README.md                   # Project documentation
```

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the overlay package:
   ```bash
   npm run build:overlay
   ```
3. Run the demo site:
   ```bash
   npm run dev:demo
   ```
   Open `http://localhost:3000` to preview and test the overlay.
