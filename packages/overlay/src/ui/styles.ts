export const CSS_STYLES = `
:host {
  /* MongoDB Design System Palette */
  --bg-main: #001e2b;
  --bg-surface: #092532;
  --bg-card: #092532;
  --bg-card-hover: #0c2f40;
  --bg-input: #041620;
  --border-subtle: #1c2d38;
  --border-subtle-bright: #2b4352;
  --border-interactive: #00ed64;
  --border-focus: #00ed64;
  
  --text-primary: #ffffff;
  --text-muted: #a8b3bc;
  --text-dim: #7c8c9a;
  --text-error: #ef4444;
  
  --accent: #00ed64;
  --accent-hover: #00b545;
  --accent-light: rgba(0, 237, 100, 0.12);
  --on-primary: #001e2b;
  
  --button-inset: 0 1px 2px rgba(0, 0, 0, 0.3);
  --focus-shadow: 0 0 0 2px rgba(0, 237, 100, 0.35);
  
  --shadow-popup: 0 16px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px #1c2d38;
  --shadow-sidebar: -16px 0 40px rgba(0, 0, 0, 0.45), -1px 0 0 0 #1c2d38;
  --shadow-card: 0 2px 6px rgba(0, 0, 0, 0.25);
  
  --font-family: 'Euclid Circular A', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ==========================================================================
   Floating Toggle Button
   ========================================================================== */
.annoty-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  height: 44px;
  background: rgba(0, 30, 43, 0.95);
  border: 1px solid #1c2d38;
  border-radius: 9999px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 237, 100, 0.15);
  backdrop-filter: blur(8px);
  cursor: grab;
  display: flex;
  align-items: center;
  padding: 3px 6px;
  gap: 4px;
  z-index: 2147483646;
  transition: border-color 0.2s, box-shadow 0.2s;
  user-select: none;
  box-sizing: border-box;
}

.annoty-toggle:active {
  cursor: grabbing;
}

.annoty-toggle:hover {
  border-color: #2b4352;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 237, 100, 0.3);
}

.annoty-toggle-grip {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c8c9a;
  cursor: grab;
  padding: 0 2px 0 4px;
}

.annoty-control-btn {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: all 0.15s ease;
  position: relative;
  padding: 0;
}

.annoty-control-btn:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.annoty-control-btn.active {
  background-color: #00ed64;
  color: #001e2b;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 237, 100, 0.35);
}

.annoty-control-btn svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

.annoty-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #ef4444;
  color: white;
  font-size: 9px;
  font-weight: 700;
  border-radius: 9999px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  box-sizing: border-box;
}

/* ==========================================================================
   Overlay Highlight & High-Tech Corner Brackets
   ========================================================================== */
.annoty-highlight {
  position: fixed;
  border: 2px solid #00ed64;
  background: rgba(0, 237, 100, 0.08);
  box-shadow: 0 0 16px rgba(0, 237, 100, 0.25), 0 0 0 1px rgba(0, 30, 43, 0.8);
  pointer-events: none;
  z-index: 2147483640;
  transition: all 0.06s ease-out;
  border-radius: 4px;
  box-sizing: border-box;
}

/* Corner accent brackets */
.annoty-corner-tl,
.annoty-corner-tr,
.annoty-corner-bl,
.annoty-corner-br {
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: #00ed64;
  border-style: solid;
  pointer-events: none;
}

.annoty-corner-tl {
  top: -2px;
  left: -2px;
  border-width: 2px 0 0 2px;
  border-top-left-radius: 2px;
}

.annoty-corner-tr {
  top: -2px;
  right: -2px;
  border-width: 2px 2px 0 0;
  border-top-right-radius: 2px;
}

.annoty-corner-bl {
  bottom: -2px;
  left: -2px;
  border-width: 0 0 2px 2px;
  border-bottom-left-radius: 2px;
}

.annoty-corner-br {
  bottom: -2px;
  right: -2px;
  border-width: 0 2px 2px 0;
  border-bottom-right-radius: 2px;
}

/* Floating Inspector Badge / Tooltip */
.annoty-picker-tooltip {
  position: fixed;
  height: 28px;
  background: #001e2b;
  border: 1px solid #1c2d38;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 237, 100, 0.2);
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  z-index: 2147483642;
  white-space: nowrap;
  animation: annoty-fade-in 0.1s ease-out;
  box-sizing: border-box;
}

.annoty-tooltip-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: #00ed64;
}

.annoty-tooltip-comp {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0 4px;
  border-radius: 3px;
}

.annoty-tooltip-dim {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #a8b3bc;
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 5px;
  border-radius: 3px;
}

.annoty-tooltip-hint {
  font-size: 9px;
  font-weight: 500;
  color: #7c8c9a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 2px;
}

/* ==========================================================================
   Visual Pins Layer & Floating Indicators
   ========================================================================== */
.annoty-pins-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 2147483645;
}

.annoty-pin {
  position: fixed;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  background: #00ed64;
  color: #001e2b;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 30, 43, 0.6);
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease;
  user-select: none;
  box-sizing: border-box;
}

.annoty-pin:hover {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 4px 16px rgba(0, 237, 100, 0.4), 0 0 0 2px #00ed64;
  z-index: 2147483647;
}

.annoty-pin-num {
  position: relative;
  z-index: 2;
  line-height: 1;
}

.annoty-pin-pulse {
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  opacity: 0.6;
  border: 2px solid rgba(0, 237, 100, 0.5);
  pointer-events: none;
  animation: annoty-pin-radar 2.5s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes annoty-pin-radar {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.7);
    opacity: 0;
  }
  100% {
    transform: scale(1.7);
    opacity: 0;
  }
}

/* Pin States */
.annoty-pin-state-pending {
  background: #00ed64;
  color: #001e2b;
}

.annoty-pin-state-in_progress {
  background: #38bdf8;
  color: #001e2b;
}

.annoty-pin-state-resolved {
  background: #5c6c7a;
  color: #ffffff;
  opacity: 0.75;
}
.annoty-pin-state-resolved .annoty-pin-pulse {
  display: none;
}

.annoty-pin-state-ignored {
  background: #3d4f5b;
  color: #a8b3bc;
  opacity: 0.5;
}
.annoty-pin-state-ignored .annoty-pin-pulse {
  display: none;
}

/* Pin Severities */
.annoty-pin-sev-critical {
  background: #ef4444 !important;
  color: #ffffff !important;
}
.annoty-pin-sev-critical .annoty-pin-pulse {
  border-color: #ef4444 !important;
}

/* ==========================================================================
   Popup Dialog (Draggable Annotation Tab)
   ========================================================================== */
.annoty-popup {
  position: fixed;
  width: 350px;
  max-width: 92vw;
  background-color: #001e2b;
  border: 1px solid #1c2d38;
  border-radius: 12px;
  box-shadow: var(--shadow-popup);
  z-index: 2147483645;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: annoty-fade-in 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

.annoty-popup-header {
  padding: 12px 16px;
  background-color: #001e2b;
  border-bottom: 1px solid #1c2d38;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: grab;
  user-select: none;
}

.annoty-popup-header:active {
  cursor: grabbing;
}

.annoty-popup-drag-handle {
  display: flex;
  align-items: center;
  color: #7c8c9a;
  margin-right: 8px;
  cursor: grab;
}

.annoty-popup-title-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.annoty-popup-title {
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
  margin: 0;
}

.annoty-specs-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.annoty-spec-pill {
  font-size: 10px;
  font-family: var(--font-mono);
  background: #092532;
  border: 1px solid #1c2d38;
  color: #a8b3bc;
  padding: 1px 6px;
  border-radius: 4px;
}

.annoty-popup-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #a8b3bc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.annoty-popup-close:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.annoty-breadcrumbs-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  background: #041620;
  border-bottom: 1px solid #1c2d38;
  overflow-x: auto;
  font-size: 11px;
  font-family: var(--font-mono);
}

.annoty-crumb {
  color: #a8b3bc;
  cursor: pointer;
  white-space: nowrap;
  padding: 2px 5px;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
}

.annoty-crumb:hover {
  background: #092532;
  color: #ffffff;
}

.annoty-crumb.is-target {
  color: #00ed64;
  font-weight: 600;
  background: rgba(0, 237, 100, 0.12);
}

.annoty-crumb-sep {
  color: #5c6c7a;
  font-size: 10px;
}

.annoty-popup-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
}

.annoty-element-preview {
  background-color: #041620;
  border: 1px solid #1c2d38;
  border-radius: 6px;
  padding: 8px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: #00ed64;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.annoty-source-preview {
  font-size: 11px;
  color: #a8b3bc;
  display: flex;
  align-items: center;
  gap: 6px;
}

.annoty-diagnostics-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.annoty-diag-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.4;
}

.annoty-diag-warning {
  background: rgba(250, 110, 57, 0.15);
  border: 1px solid rgba(250, 110, 57, 0.3);
  color: #fa6e39;
}

.annoty-diag-icon {
  font-weight: 700;
  font-family: var(--font-mono);
}

.annoty-textarea {
  background-color: #041620;
  border: 1px solid #1c2d38;
  border-radius: 6px;
  color: #ffffff;
  padding: 10px 12px;
  font-family: var(--font-family);
  font-size: 13px;
  resize: vertical;
  min-height: 85px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.annoty-textarea:focus {
  border-color: #00ed64;
  box-shadow: var(--focus-shadow);
}

.annoty-popup-footer {
  padding: 12px 16px;
  border-top: 1px solid #1c2d38;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background-color: #001e2b;
}

/* Common button styles */
.annoty-btn {
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 500;
  padding: 7px 16px;
  border-radius: 9999px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.annoty-btn-primary {
  background-color: #00ed64;
  color: #001e2b;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 237, 100, 0.3);
}

.annoty-btn-primary:hover {
  background-color: #00b545;
  box-shadow: 0 4px 12px rgba(0, 237, 100, 0.4);
}

.annoty-btn-primary:active {
  background-color: #008c34;
}

.annoty-btn-secondary {
  background-color: transparent;
  border-color: #1c2d38;
  color: #ffffff;
}

.annoty-btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: #2b4352;
}

.annoty-btn-danger {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.annoty-btn-danger:hover {
  background-color: rgba(239, 68, 68, 0.25);
}

.annoty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ==========================================================================
   Sidebar Panel
   ========================================================================== */
.annoty-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background-color: #001e2b;
  border-left: 1px solid #1c2d38;
  box-shadow: var(--shadow-sidebar);
  z-index: 2147483644;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

.annoty-sidebar.open {
  transform: translateX(0);
}

.annoty-sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #1c2d38;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #001e2b;
}

.annoty-sidebar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.annoty-sidebar-title svg {
  width: 18px;
  height: 18px;
  stroke: #00ed64;
  stroke-width: 2;
  fill: none;
}

.annoty-header-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #00ed64;
  background: rgba(0, 237, 100, 0.1);
  border: 1px solid rgba(0, 237, 100, 0.25);
  padding: 2px 8px;
  border-radius: 9999px;
}

.annoty-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: #00ed64;
  box-shadow: 0 0 6px #00ed64;
}

.annoty-sidebar-tabs {
  display: flex;
  background: #041620;
  border: 1px solid #1c2d38;
  border-radius: 9999px;
  margin: 12px 16px 4px 16px;
  padding: 3px;
  gap: 2px;
}

.annoty-tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 500;
  color: #a8b3bc;
  border-radius: 9999px;
  text-align: center;
  transition: all 0.15s ease;
}

.annoty-tab-btn:hover {
  color: #ffffff;
}

.annoty-tab-btn.active {
  color: #001e2b;
  background: #00ed64;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* ==========================================================================
   Smooth Group Bar & Collapsible Group Organizer Drawer
   ========================================================================== */
.annoty-group-bar {
  padding: 10px 16px;
  border-bottom: 1px solid #1c2d38;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: #001e2b;
}

.annoty-group-pill-btn {
  flex: 1;
  background: #092532;
  border: 1px solid #1c2d38;
  border-radius: 9999px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #ffffff;
  font-family: var(--font-family);
  font-size: 13px;
  transition: all 0.15s ease;
}

.annoty-group-pill-btn:hover {
  border-color: #2b4352;
  background: #0c2f40;
}

.annoty-group-pill-icon {
  display: flex;
  align-items: center;
  color: #00ed64;
}

.annoty-group-active-name {
  font-weight: 500;
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.annoty-group-badge-count {
  font-size: 10px;
  font-weight: 600;
  background: #041620;
  border: 1px solid #1c2d38;
  padding: 1px 6px;
  border-radius: 9999px;
  color: #a8b3bc;
}

.annoty-group-chevron {
  transition: transform 0.2s ease;
  color: #7c8c9a;
}

.annoty-group-chevron.is-open {
  transform: rotate(180deg);
}

.annoty-group-drawer {
  background-color: #041620;
  border-bottom: 1px solid #1c2d38;
  padding: 12px 16px;
  animation: annoty-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.annoty-group-drawer-inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.annoty-group-create-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.annoty-group-create-input {
  flex: 1;
  background: #092532;
  border: 1px solid #1c2d38;
  border-radius: 9999px;
  padding: 6px 14px;
  font-size: 12px;
  font-family: var(--font-family);
  color: #ffffff;
  outline: none;
  transition: border-color 0.15s;
}

.annoty-group-create-input:focus {
  border-color: #00ed64;
}

.annoty-group-drawer-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.annoty-group-drawer-item {
  background: #092532;
  border: 1px solid #1c2d38;
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: all 0.15s ease;
}

.annoty-group-drawer-item:hover {
  border-color: #2b4352;
}

.annoty-group-drawer-item.is-active {
  border-color: #00ed64;
  background: #0c2f40;
}

.annoty-group-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.annoty-group-item-radio {
  font-size: 11px;
  color: #00ed64;
}

.annoty-group-item-name {
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.annoty-group-item-count {
  font-size: 10px;
  color: #a8b3bc;
  background: #041620;
  padding: 1px 6px;
  border-radius: 4px;
}

.annoty-group-item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.annoty-group-rename-input {
  flex: 1;
  background: #041620;
  border: 1px solid #00ed64;
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 12px;
  color: #ffffff;
  outline: none;
}

.annoty-btn-confirm-delete {
  background: #ef4444;
  color: #ffffff;
  border: none;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 9999px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.annoty-btn-confirm-delete:hover {
  opacity: 0.9;
}

/* ==========================================================================
   Annotation Cards & Lists
   ========================================================================== */
.annoty-sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}

.annoty-sidebar-list::-webkit-scrollbar,
.annoty-preview-area::-webkit-scrollbar,
.annoty-group-drawer-list::-webkit-scrollbar {
  width: 6px;
}

.annoty-sidebar-list::-webkit-scrollbar-thumb,
.annoty-preview-area::-webkit-scrollbar-thumb,
.annoty-group-drawer-list::-webkit-scrollbar-thumb {
  background-color: #1c2d38;
  border-radius: 3px;
}

.annoty-sidebar-list::-webkit-scrollbar-track,
.annoty-preview-area::-webkit-scrollbar-track,
.annoty-group-drawer-list::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Annotation List Item Card */
.annoty-item {
  background: #092532;
  border: 1px solid #1c2d38;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-card);
  box-sizing: border-box;
}

.annoty-item:hover {
  border-color: #2b4352;
  background: #0c2f40;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.annoty-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.annoty-item-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.annoty-item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.annoty-item-badge {
  background: #00ed64;
  color: #001e2b;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 237, 100, 0.3);
}

.annoty-item-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: #00ed64;
  background-color: #041620;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid #1c2d38;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.annoty-item-dim {
  font-size: 10px;
  font-family: var(--font-mono);
  color: #a8b3bc;
  background: #041620;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid #1c2d38;
}

.annoty-item-status-pill {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 9999px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  user-select: none;
}

.annoty-item-status-pending {
  background: rgba(250, 110, 57, 0.15);
  color: #fa6e39;
  border-color: rgba(250, 110, 57, 0.3);
}

.annoty-item-status-resolved {
  background: rgba(0, 237, 100, 0.15);
  color: #00ed64;
  border-color: rgba(0, 237, 100, 0.3);
}

.annoty-item-file {
  font-size: 11px;
  color: #7c8c9a;
  word-break: break-all;
  padding-left: 2px;
}

.annoty-item-instruction {
  font-size: 13px;
  color: #ffffff;
  margin: 0;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.annoty-item-thumb {
  max-width: 100%;
  max-height: 90px;
  border-radius: 6px;
  border: 1px solid #1c2d38;
  margin-top: 6px;
  cursor: pointer;
  object-fit: cover;
  display: block;
}

.annoty-item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.annoty-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a8b3bc;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s, color 0.15s;
}

.annoty-icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.annoty-icon-btn-danger:hover {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.annoty-icon-btn svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

.annoty-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  color: #a8b3bc;
  gap: 10px;
  padding: 32px 16px;
}

.annoty-empty-state svg {
  width: 44px;
  height: 44px;
  stroke: #1c2d38;
  stroke-width: 1.5;
  fill: none;
}

.annoty-empty-text {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
}

.annoty-empty-subtext {
  font-size: 12px;
  margin: 0;
  max-width: 220px;
  line-height: 1.4;
  color: #a8b3bc;
}

.annoty-sidebar-footer {
  padding: 16px;
  border-top: 1px solid #1c2d38;
  background-color: #001e2b;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.annoty-footer-actions {
  display: flex;
  gap: 8px;
}

.annoty-footer-actions .annoty-btn {
  flex: 1;
  justify-content: center;
}

/* ==========================================================================
   Prompt Preview Modal/Overlay within Sidebar
   ========================================================================== */
.annoty-preview-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #001e2b;
  z-index: 10;
  display: flex;
  flex-direction: column;
  animation: annoty-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

.annoty-preview-header {
  padding: 14px 16px;
  border-bottom: 1px solid #1c2d38;
  background-color: #001e2b;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.annoty-preview-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.annoty-preview-format-tabs {
  display: flex;
  background: #041620;
  border: 1px solid #1c2d38;
  border-radius: 9999px;
  padding: 2px;
  gap: 2px;
}

.annoty-format-btn {
  background: transparent;
  border: none;
  color: #a8b3bc;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.annoty-format-btn:hover {
  color: #ffffff;
}

.annoty-format-btn.active {
  background: #00ed64;
  color: #001e2b;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.annoty-preview-body {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.annoty-preview-area {
  flex: 1;
  background-color: #041620;
  border: 1px solid #1c2d38;
  border-radius: 6px;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #ffffff;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: auto;
  outline: none;
  box-sizing: border-box;
}

.annoty-preview-footer {
  padding: 14px 16px;
  border-top: 1px solid #1c2d38;
  background-color: #001e2b;
  display: flex;
  gap: 8px;
}

.annoty-preview-footer .annoty-btn {
  flex: 1;
  justify-content: center;
}

/* History Row specific styling */
.annoty-history-item-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.annoty-history-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.annoty-history-title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.annoty-history-group-name {
  font-weight: 600;
  font-size: 13px;
  color: #ffffff;
}

.annoty-history-time {
  font-size: 11px;
  color: #a8b3bc;
}

.annoty-history-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #a8b3bc;
  background-color: #041620;
  border: 1px solid #1c2d38;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

/* ==========================================================================
   Animations & Toast
   ========================================================================== */
@keyframes annoty-fade-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes annoty-slide-up {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.annoty-toast {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #00ed64;
  color: #001e2b;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 9999px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 100;
}

.annoty-toast.show {
  opacity: 1;
  transform: translate(-50%, -5px);
}
`;
