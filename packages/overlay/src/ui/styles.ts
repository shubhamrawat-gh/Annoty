export const CSS_STYLES = `
:host {
  /* Lovable Design System Palette */
  --bg-main: #f7f4ed;
  --bg-surface: #fcfbf8;
  --bg-card: #ffffff;
  --bg-input: #ffffff;
  --border-subtle: #eceae4;
  --border-subtle-bright: #e2dfd7;
  --border-interactive: rgba(28, 28, 28, 0.4);
  --border-focus: #1c1c1c;
  
  --text-primary: #1c1c1c;
  --text-muted: #5f5f5d;
  --text-dim: #8a8880;
  --text-error: #dc2626;
  
  --accent: #1c1c1c;
  --accent-hover: rgba(28, 28, 28, 0.85);
  --accent-light: rgba(28, 28, 28, 0.05);
  
  --button-inset: rgba(255, 255, 255, 0.2) 0px 0.5px 0px 0px inset, rgba(0, 0, 0, 0.2) 0px 0px 0px 0.5px inset, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  --focus-shadow: rgba(0, 0, 0, 0.08) 0px 4px 12px;
  
  --shadow-popup: 0 12px 36px rgba(28, 28, 28, 0.12), 0 0 0 1px #eceae4;
  --shadow-sidebar: -12px 0 36px rgba(28, 28, 28, 0.08), -1px 0 0 0 #eceae4;
  --shadow-card: 0 1px 4px rgba(28, 28, 28, 0.04);
  
  --font-family: 'Camera Plain Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  
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
  background: #f7f4ed;
  border: 1px solid #eceae4;
  border-radius: 9999px;
  box-shadow: 0 4px 20px rgba(28, 28, 28, 0.12);
  cursor: grab;
  display: flex;
  align-items: center;
  padding: 3px 6px;
  gap: 3px;
  z-index: 2147483646;
  transition: border-color 0.2s, box-shadow 0.2s;
  user-select: none;
  box-sizing: border-box;
}

.annoty-toggle:active {
  cursor: grabbing;
}

.annoty-toggle:hover {
  border-color: rgba(28, 28, 28, 0.4);
}

.annoty-toggle-grip {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a8880;
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
  color: #1c1c1c;
  transition: all 0.15s ease;
  position: relative;
  padding: 0;
}

.annoty-control-btn:hover {
  background-color: rgba(28, 28, 28, 0.05);
}

.annoty-control-btn.active {
  background-color: #1c1c1c;
  color: #fcfbf8;
  box-shadow: var(--button-inset);
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
  background-color: #dc2626;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  box-sizing: border-box;
}

/* ==========================================================================
   Overlay Highlight & High-Tech Corner Brackets
   ========================================================================== */
.annoty-highlight {
  position: fixed;
  border: 2px solid #1c1c1c;
  background: rgba(28, 28, 28, 0.04);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6);
  pointer-events: none;
  z-index: 2147483640;
  transition: all 0.06s ease-out;
  border-radius: 3px;
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
  border-color: #1c1c1c;
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
  background: #1c1c1c;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
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
  color: #fcfbf8;
}

.annoty-tooltip-comp {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: #93c5fd;
  background: rgba(147, 197, 253, 0.15);
  border: 1px solid rgba(147, 197, 253, 0.25);
  padding: 0 4px;
  border-radius: 3px;
}

.annoty-tooltip-dim {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #d1d5db;
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 5px;
  border-radius: 3px;
}

.annoty-tooltip-hint {
  font-size: 9px;
  font-weight: 500;
  color: #9ca3af;
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
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  background: #1c1c1c;
  color: #fcfbf8;
  box-shadow: var(--button-inset);
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease;
  user-select: none;
  box-sizing: border-box;
}

.annoty-pin:hover {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 4px 14px rgba(28, 28, 28, 0.3), var(--button-inset);
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
  border: 2px solid rgba(28, 28, 28, 0.35);
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
  background: #1c1c1c;
}

.annoty-pin-state-in_progress {
  background: #2563eb;
}

.annoty-pin-state-resolved {
  background: #4b5563;
  opacity: 0.7;
}
.annoty-pin-state-resolved .annoty-pin-pulse {
  display: none;
}

.annoty-pin-state-ignored {
  background: #9ca3af;
  opacity: 0.5;
}
.annoty-pin-state-ignored .annoty-pin-pulse {
  display: none;
}

/* Pin Severities */
.annoty-pin-sev-critical {
  background: #dc2626 !important;
}
.annoty-pin-sev-critical .annoty-pin-pulse {
  border-color: #dc2626 !important;
}

/* ==========================================================================
   Popup Dialog (Draggable Annotation Tab)
   ========================================================================== */
.annoty-popup {
  position: fixed;
  width: 350px;
  max-width: 92vw;
  background-color: #f7f4ed;
  border: 1px solid #eceae4;
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
  background-color: #f7f4ed;
  border-bottom: 1px solid #eceae4;
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
  color: #8a8880;
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
  color: #1c1c1c;
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
  background: #ffffff;
  border: 1px solid #eceae4;
  color: #5f5f5d;
  padding: 1px 6px;
  border-radius: 4px;
}

.annoty-popup-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #5f5f5d;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.annoty-popup-close:hover {
  background-color: rgba(28, 28, 28, 0.05);
  color: #1c1c1c;
}

.annoty-breadcrumbs-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  background: #eceae4;
  border-bottom: 1px solid #e2dfd7;
  overflow-x: auto;
  font-size: 11px;
  font-family: var(--font-mono);
}

.annoty-crumb {
  color: #5f5f5d;
  cursor: pointer;
  white-space: nowrap;
  padding: 2px 5px;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
}

.annoty-crumb:hover {
  background: #ffffff;
  color: #1c1c1c;
}

.annoty-crumb.is-target {
  color: #1c1c1c;
  font-weight: 600;
  background: #ffffff;
}

.annoty-crumb-sep {
  color: #8a8880;
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
  background-color: #ffffff;
  border: 1px solid #eceae4;
  border-radius: 6px;
  padding: 8px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: #1c1c1c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.annoty-source-preview {
  font-size: 11px;
  color: #5f5f5d;
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
  background: rgba(217, 119, 6, 0.1);
  border: 1px solid rgba(217, 119, 6, 0.25);
  color: #b45309;
}

.annoty-diag-icon {
  font-weight: 700;
  font-family: var(--font-mono);
}

.annoty-textarea {
  background-color: #ffffff;
  border: 1px solid #eceae4;
  border-radius: 6px;
  color: #1c1c1c;
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
  border-color: rgba(28, 28, 28, 0.4);
  box-shadow: var(--focus-shadow);
}

.annoty-popup-footer {
  padding: 12px 16px;
  border-top: 1px solid #eceae4;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background-color: #f7f4ed;
}

/* Common button styles */
.annoty-btn {
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 400;
  padding: 7px 14px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.annoty-btn-primary {
  background-color: #1c1c1c;
  color: #fcfbf8;
  box-shadow: var(--button-inset);
}

.annoty-btn-primary:hover {
  opacity: 0.9;
}

.annoty-btn-primary:active {
  opacity: 0.8;
}

.annoty-btn-secondary {
  background-color: transparent;
  border-color: #eceae4;
  color: #1c1c1c;
}

.annoty-btn-secondary:hover {
  background-color: rgba(28, 28, 28, 0.04);
  border-color: rgba(28, 28, 28, 0.4);
}

.annoty-btn-danger {
  background-color: rgba(220, 38, 38, 0.08);
  border-color: rgba(220, 38, 38, 0.2);
  color: #dc2626;
}

.annoty-btn-danger:hover {
  background-color: rgba(220, 38, 38, 0.15);
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
  background-color: #f7f4ed;
  border-left: 1px solid #eceae4;
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
  border-bottom: 1px solid #eceae4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f7f4ed;
}

.annoty-sidebar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: #1c1c1c;
  display: flex;
  align-items: center;
  gap: 10px;
}

.annoty-sidebar-title svg {
  width: 18px;
  height: 18px;
  stroke: #1c1c1c;
  stroke-width: 2;
  fill: none;
}

.annoty-header-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #1c1c1c;
  background: rgba(28, 28, 28, 0.06);
  border: 1px solid #eceae4;
  padding: 2px 7px;
  border-radius: 9999px;
}

.annoty-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: #1c1c1c;
}

.annoty-sidebar-tabs {
  display: flex;
  background: #eceae4;
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
  font-weight: 400;
  color: #5f5f5d;
  border-radius: 9999px;
  text-align: center;
  transition: all 0.15s ease;
}

.annoty-tab-btn:hover {
  color: #1c1c1c;
}

.annoty-tab-btn.active {
  color: #1c1c1c;
  background: #ffffff;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(28, 28, 28, 0.08);
}

/* ==========================================================================
   Smooth Group Bar & Collapsible Group Organizer Drawer
   ========================================================================== */
.annoty-group-bar {
  padding: 10px 16px;
  border-bottom: 1px solid #eceae4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: #f7f4ed;
}

.annoty-group-pill-btn {
  flex: 1;
  background: #ffffff;
  border: 1px solid #eceae4;
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #1c1c1c;
  font-family: var(--font-family);
  font-size: 13px;
  transition: all 0.15s ease;
}

.annoty-group-pill-btn:hover {
  border-color: rgba(28, 28, 28, 0.35);
  background: #faf8f5;
}

.annoty-group-pill-icon {
  display: flex;
  align-items: center;
  color: #5f5f5d;
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
  background: #f7f4ed;
  border: 1px solid #eceae4;
  padding: 1px 6px;
  border-radius: 9999px;
  color: #5f5f5d;
}

.annoty-group-chevron {
  transition: transform 0.2s ease;
  color: #8a8880;
}

.annoty-group-chevron.is-open {
  transform: rotate(180deg);
}

.annoty-group-drawer {
  background-color: #faf8f5;
  border-bottom: 1px solid #eceae4;
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
  background: #ffffff;
  border: 1px solid #eceae4;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-family: var(--font-family);
  color: #1c1c1c;
  outline: none;
  transition: border-color 0.15s;
}

.annoty-group-create-input:focus {
  border-color: rgba(28, 28, 28, 0.4);
}

.annoty-group-drawer-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.annoty-group-drawer-item {
  background: #ffffff;
  border: 1px solid #eceae4;
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: all 0.15s ease;
}

.annoty-group-drawer-item:hover {
  border-color: rgba(28, 28, 28, 0.3);
}

.annoty-group-drawer-item.is-active {
  border-color: rgba(28, 28, 28, 0.6);
  background: #fdfcf9;
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
  color: #1c1c1c;
}

.annoty-group-item-name {
  font-size: 12px;
  font-weight: 500;
  color: #1c1c1c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.annoty-group-item-count {
  font-size: 10px;
  color: #8a8880;
  background: #f7f4ed;
  padding: 1px 5px;
  border-radius: 4px;
}

.annoty-group-item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.annoty-group-rename-input {
  flex: 1;
  background: #ffffff;
  border: 1px solid rgba(28, 28, 28, 0.4);
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 12px;
  color: #1c1c1c;
  outline: none;
}

.annoty-btn-confirm-delete {
  background: #dc2626;
  color: #ffffff;
  border: none;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 4px;
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
.annoty-preview-area::-webkit-scrollbar {
  width: 6px;
}

.annoty-sidebar-list::-webkit-scrollbar-thumb,
.annoty-preview-area::-webkit-scrollbar-thumb {
  background-color: #eceae4;
  border-radius: 3px;
}

.annoty-sidebar-list::-webkit-scrollbar-track,
.annoty-preview-area::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Annotation List Item Card */
.annoty-item {
  background: #ffffff;
  border: 1px solid #eceae4;
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
  border-color: rgba(28, 28, 28, 0.35);
  box-shadow: 0 4px 12px rgba(28, 28, 28, 0.06);
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
  background: #1c1c1c;
  color: #fcfbf8;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--button-inset);
}

.annoty-item-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: #1c1c1c;
  background-color: #f7f4ed;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid #eceae4;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.annoty-item-dim {
  font-size: 10px;
  font-family: var(--font-mono);
  color: #5f5f5d;
  background: #f7f4ed;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid #eceae4;
}

.annoty-item-status-pill {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  user-select: none;
}

.annoty-item-status-pending {
  background: rgba(217, 119, 6, 0.1);
  color: #b45309;
  border-color: rgba(217, 119, 6, 0.25);
}

.annoty-item-status-resolved {
  background: rgba(28, 28, 28, 0.08);
  color: #1c1c1c;
  border-color: rgba(28, 28, 28, 0.2);
}

.annoty-item-file {
  font-size: 11px;
  color: #5f5f5d;
  word-break: break-all;
  padding-left: 2px;
}

.annoty-item-instruction {
  font-size: 13px;
  color: #1c1c1c;
  margin: 0;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.annoty-item-thumb {
  max-width: 100%;
  max-height: 90px;
  border-radius: 6px;
  border: 1px solid #eceae4;
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
  color: #5f5f5d;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s, color 0.15s;
}

.annoty-icon-btn:hover {
  background-color: rgba(28, 28, 28, 0.05);
  color: #1c1c1c;
}

.annoty-icon-btn-danger:hover {
  background-color: rgba(220, 38, 38, 0.1);
  color: #dc2626;
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
  color: #5f5f5d;
  gap: 10px;
  padding: 32px 16px;
}

.annoty-empty-state svg {
  width: 44px;
  height: 44px;
  stroke: #eceae4;
  stroke-width: 1.5;
  fill: none;
}

.annoty-empty-text {
  font-size: 14px;
  font-weight: 500;
  color: #1c1c1c;
  margin: 0;
}

.annoty-empty-subtext {
  font-size: 12px;
  margin: 0;
  max-width: 220px;
  line-height: 1.4;
}

.annoty-sidebar-footer {
  padding: 16px;
  border-top: 1px solid #eceae4;
  background-color: #f7f4ed;
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
  background-color: #f7f4ed;
  z-index: 10;
  display: flex;
  flex-direction: column;
  animation: annoty-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

.annoty-preview-header {
  padding: 14px 16px;
  border-bottom: 1px solid #eceae4;
  background-color: #f7f4ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.annoty-preview-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1c1c1c;
}

.annoty-preview-format-tabs {
  display: flex;
  background: #eceae4;
  border-radius: 9999px;
  padding: 2px;
  gap: 2px;
}

.annoty-format-btn {
  background: transparent;
  border: none;
  color: #5f5f5d;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.annoty-format-btn:hover {
  color: #1c1c1c;
}

.annoty-format-btn.active {
  background: #ffffff;
  color: #1c1c1c;
  box-shadow: 0 1px 3px rgba(28, 28, 28, 0.08);
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
  background-color: #ffffff;
  border: 1px solid #eceae4;
  border-radius: 6px;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #1c1c1c;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: auto;
  outline: none;
  box-sizing: border-box;
}

.annoty-preview-footer {
  padding: 14px 16px;
  border-top: 1px solid #eceae4;
  background-color: #f7f4ed;
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
  color: #1c1c1c;
}

.annoty-history-time {
  font-size: 11px;
  color: #5f5f5d;
}

.annoty-history-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #5f5f5d;
  background-color: #f7f4ed;
  border: 1px solid #eceae4;
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
  background-color: #1c1c1c;
  color: #fcfbf8;
  font-size: 12px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 9999px;
  box-shadow: var(--button-inset);
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
