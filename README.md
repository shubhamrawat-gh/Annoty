# Annoty ✏️

**Annoty** is an interactive browser overlay and developer utility designed to speed up your AI-assisted coding workflow. 

It allows you to click elements inside your locally running web application, attach notes/instructions directly to them, and compile those annotations into **one consolidated, structured Markdown prompt** to copy and paste into AI agents (like Claude Code, Cursor, ChatGPT, or the Antigravity CLI).

<p align="center">
  <img src="https://img.shields.io/badge/Local--First-Yes-success?style=flat-square" alt="Local First">
  <img src="https://img.shields.io/badge/Zero--Network-Free%20Mode-blue?style=flat-square" alt="Zero Network">
  <img src="https://img.shields.io/badge/Vite--Plugin-React-61dafb?style=flat-square" alt="Vite React Support">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License MIT">
</p>

---

## ✨ Features

- 🎯 **Visual Selection Mode:** Toggle visual overlay mode and select elements on your page safely without trigger actions or page redirections interrupting your workflow.
- 🔌 **Vite Build Plugin:** Walks the JSX AST at build-time to inject `data-annoty-source` attributes, enabling click-to-file-line mappings right from your browser DOM.
- 📂 **Multi-Tier Source Mapping:** Automatically resolves clicked DOM elements back to source code locations:
  - **Tier 1 (React & Preact):** Inspects internal fiber/vnode elements in dev mode to extract component paths, line, and column numbers.
  - **Tier 2 (Framework-Native):** Inspects Vue VNodes, Svelte metadata (`__svelte_meta`), or Astro source attributes.
  - **Tier 3 (Universal Data Attribute):** Reads manual `data-annoty-source="src/components/Header.tsx:12"` markers.
  - **Tier 4 (CSS Selector Fallback):** Generates resilient CSS selector paths wrapped in semantic HTML landmark contexts.
- 📦 **Encapsulated UI:** Renders toggle buttons, popups, and sidebar panels inside a **Shadow DOM** to prevent CSS styling leakage or collision with your application.
- 💾 **Local-First & Offline:** Run completely offline. No accounts or databases required; everything is stored securely in browser `LocalStorage`.
- 🔄 **Local Backups:** Export and import your annotations and histories locally as JSON files.
- ☁️ **Cloud-Sync Ready:** Easily links to a privately hosted cloud sync backend when you run `annoty login`.

---

## 🚀 Quick Start (Under 2 Minutes)

### 1. Initialize Annoty in your project
Run the initialization utility from the root of your frontend project folder:

```bash
npx annoty init
```

*This automatically copies the dev overlay script into your asset directory (e.g. `public/overlay.js`) and injects the following tag before the closing `</body>` tag of your main HTML file:*
```html
<script src="/overlay.js" data-annoty-mode="dev"></script>
```

### 2. Run your dev server
Start your local dev server (e.g. `npm run dev`). Annoty will detect localhost and bootstrap the floating toggle button.

### 3. Annotate & Compile
1. Click the **floating edit button** (or press `Alt + A` / `Alt + S`) to open the overlay.
2. Click any UI element you wish to modify.
3. Type your instructions (e.g. *"Change this button to emerald green with 12px vertical padding"*).
4. Click **Generate Prompt** in the sidebar to review the compiled Markdown and click **Copy to Clipboard**.
5. Paste the structured prompt directly into your AI coding tool!

---

## 🔌 Integrating the Build Plugin (Vite + React)

For precise compiler-level source-file mapping, install `@annoty/build-plugins` and configure it in your `vite.config.ts`. This injects file paths and line numbers onto elements automatically during local development.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { annotyReact } from '@annoty/build-plugins';

export default defineConfig({
  plugins: [
    react(),
    annotyReact() // Only transforms files during local development (Vite 'serve')
  ]
});
```

---

## 🧹 Codebase Hygiene & Cleanup

Before compiling production builds or committing code, run the cleanup tool to strip all Annoty tags and overlay assets from your project:

```bash
npx annoty clean
```

---

## 💡 Markdown Prompt Sample

Annoty compiles your changes into a structured prompt that AI tools can read and execute instantly:

```markdown
## UI Change Requests (2 elements)

### File: src/components/Hero.tsx

**1. Line 14** — `<button class="cta-primary">Get Started</button>`
Increase horizontal padding to 24px and add a subtle hover scale animation.

### File: src/components/Pricing.tsx

**2. Line 32** — `<div class="price-tag">$29/mo</div>`
Make the font weight bold and color dark slate gray (#1e293b).

---
### Guidance for this batch
- **spacing**: Add padding/margins using consistent units.
- **color**: Apply hex colors or Tailwind theme classes if configured.

Apply each change at its specified file/line. Do not modify unrelated code.
```

---

## 🛡️ Safety Guardrails

To prevent Annoty from leaking into production, the overlay script contains a strict safety guardrail:
- It **only activates** if served from `localhost` / `127.0.0.1` **OR** if the script tag has `data-annoty-mode="dev"` explicitly set.
- Otherwise, it behaves as a silent no-op.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
