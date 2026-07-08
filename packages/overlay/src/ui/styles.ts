export const CSS_STYLES = `
:host {
  --bg-main: #121214;
  --bg-surface: #1a1a1e;
  --bg-input: #232329;
  --border-subtle: #2d2d34;
  --border-focus: #3ecf8e;
  
  --text-primary: #f4f4f5;
  --text-muted: #a1a1aa;
  --text-error: #f87171;
  
  --accent: #3ecf8e;
  --accent-hover: #2ebd7d;
  --accent-light: rgba(62, 207, 142, 0.15);
  
  --shadow-popup: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  --shadow-sidebar: -10px 0 30px -10px rgba(0, 0, 0, 0.5);
  
  --font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  
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
  height: 48px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  cursor: grab;
  display: flex;
  align-items: center;
  padding: 4px;
  gap: 4px;
  z-index: 999999;
  transition: border-color 0.2s, box-shadow 0.2s;
  user-select: none;
  box-sizing: border-box;
}

.annoty-toggle:active {
  cursor: grabbing;
}

.annoty-toggle:hover {
  border-color: var(--accent);
}

.annoty-control-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: background-color 0.2s, color 0.2s;
  position: relative;
  padding: 0;
}

.annoty-control-btn:hover {
  background-color: var(--bg-input);
}

.annoty-control-btn.active {
  background-color: var(--accent);
  color: var(--bg-main);
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
  background-color: var(--text-error);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  box-sizing: border-box;
}

/* ==========================================================================
   Overlay Highlight (drawn on host body, but positioned here)
   ========================================================================== */
.annoty-highlight {
  position: fixed;
  border: 2px solid var(--accent);
  background-color: rgba(62, 207, 142, 0.08);
  pointer-events: none;
  z-index: 999990;
  transition: all 0.08s ease-out;
  border-radius: 4px;
  box-sizing: border-box;
}

/* ==========================================================================
   Popup Dialog (Click annotation input)
   ========================================================================== */
.annoty-popup {
  position: fixed;
  width: 320px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  box-shadow: var(--shadow-popup);
  z-index: 999998;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: annoty-fade-in 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

.annoty-popup-header {
  padding: 12px 16px;
  background-color: var(--bg-main);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.annoty-popup-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
  margin: 0;
}

.annoty-popup-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.annoty-popup-close:hover {
  color: var(--text-primary);
}

.annoty-popup-close svg {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-width: 2;
}

.annoty-popup-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}

.annoty-element-preview {
  background-color: var(--bg-main);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 8px 10px;
  font-family: monospace;
  font-size: 11px;
  color: var(--accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.annoty-source-preview {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.annoty-source-preview svg {
  width: 12px;
  height: 12px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

.annoty-textarea {
  background-color: var(--bg-input);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  padding: 8px 10px;
  font-family: var(--font-family);
  font-size: 13px;
  resize: vertical;
  min-height: 80px;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.annoty-textarea:focus {
  border-color: var(--border-focus);
}

.annoty-popup-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background-color: var(--bg-main);
}

/* Common button styles */
.annoty-btn {
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, opacity 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.annoty-btn-primary {
  background-color: var(--accent);
  color: #0b0b0d;
}

.annoty-btn-primary:hover {
  background-color: var(--accent-hover);
}

.annoty-btn-secondary {
  background-color: transparent;
  border-color: var(--border-subtle);
  color: var(--text-primary);
}

.annoty-btn-secondary:hover {
  background-color: var(--bg-input);
  border-color: var(--text-muted);
}

.annoty-btn-danger {
  background-color: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.2);
  color: var(--text-error);
}

.annoty-btn-danger:hover {
  background-color: rgba(248, 113, 113, 0.2);
  border-color: var(--text-error);
}

.annoty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==========================================================================
   Sidebar Panel
   ========================================================================== */
.annoty-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 360px;
  height: 100vh;
  background-color: var(--bg-main);
  border-left: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sidebar);
  z-index: 999997;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

.annoty-sidebar.open {
  transform: translateX(0);
}

.annoty-sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-surface);
}

.annoty-sidebar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.annoty-sidebar-title svg {
  width: 18px;
  height: 18px;
  stroke: var(--accent);
  stroke-width: 2;
  fill: none;
}

.annoty-sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}

/* Custom Scrollbar for list and preview */
.annoty-sidebar-list::-webkit-scrollbar,
.annoty-preview-area::-webkit-scrollbar {
  width: 6px;
}

.annoty-sidebar-list::-webkit-scrollbar-thumb,
.annoty-preview-area::-webkit-scrollbar-thumb {
  background-color: var(--border-subtle);
  border-radius: 3px;
}

.annoty-sidebar-list::-webkit-scrollbar-track,
.annoty-preview-area::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Annotation List Item Row */
.annoty-item {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.annoty-item:hover {
  border-color: var(--text-muted);
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
  gap: 2px;
}

.annoty-item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.annoty-item-badge {
  background-color: var(--accent-light);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.annoty-item-tag {
  font-family: monospace;
  font-size: 11px;
  color: var(--accent);
  background-color: var(--bg-main);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--border-subtle);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.annoty-item-file {
  font-size: 11px;
  color: var(--text-muted);
  word-break: break-all;
  padding-left: 2px;
}

.annoty-item-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
  padding-left: 2px;
}

.annoty-chip {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
  background-color: var(--bg-input);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.annoty-chip-color {
  background-color: rgba(62, 207, 142, 0.1);
  border-color: rgba(62, 207, 142, 0.2);
  color: var(--accent);
}

.annoty-chip-typography {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.annoty-chip-size {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.annoty-chip-spacing {
  background-color: rgba(168, 85, 247, 0.1);
  border-color: rgba(168, 85, 247, 0.2);
  color: #c084fc;
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
  color: var(--text-muted);
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s, color 0.15s;
}

.annoty-icon-btn:hover {
  background-color: var(--bg-input);
  color: var(--text-primary);
}

.annoty-icon-btn-danger:hover {
  background-color: rgba(248, 113, 113, 0.15);
  color: var(--text-error);
}

.annoty-icon-btn svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

.annoty-item-instruction {
  font-size: 13px;
  color: var(--text-primary);
  margin: 0;
  word-break: break-word;
  white-space: pre-wrap;
}

.annoty-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  color: var(--text-muted);
  gap: 12px;
  padding: 32px;
}

.annoty-empty-state svg {
  width: 48px;
  height: 48px;
  stroke: var(--border-subtle);
  stroke-width: 1.5;
  fill: none;
}

.annoty-empty-text {
  font-size: 14px;
  margin: 0;
}

.annoty-empty-subtext {
  font-size: 12px;
  margin: 0;
  max-width: 200px;
}

.annoty-sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-subtle);
  background-color: var(--bg-surface);
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
  background-color: var(--bg-main);
  z-index: 10;
  display: flex;
  flex-direction: column;
  animation: annoty-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

.annoty-preview-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-subtle);
  background-color: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.annoty-preview-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
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
  background-color: var(--bg-input);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: auto;
  outline: none;
  box-sizing: border-box;
}

.annoty-preview-footer {
  padding: 16px;
  border-top: 1px solid var(--border-subtle);
  background-color: var(--bg-surface);
  display: flex;
  gap: 8px;
}

.annoty-preview-footer .annoty-btn {
  flex: 1;
  justify-content: center;
}

/* ==========================================================================
   Animations
   ========================================================================== */
@keyframes annoty-fade-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes annoty-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.annoty-toast {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--accent);
  color: #0b0b0d;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 100;
}

.annoty-toast.show {
  opacity: 1;
  transform: translate(-50%, -5px);
}

/* ==========================================================================
   Sidebar Tabs & Group Switcher
   ========================================================================== */
.annoty-sidebar-tabs {
  display: flex;
  background-color: var(--bg-main);
  border-bottom: 1px solid var(--border-subtle);
  padding: 4px;
}

.annoty-tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  border-radius: 4px;
  text-align: center;
  transition: background-color 0.2s, color 0.2s;
}

.annoty-tab-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-surface);
}

.annoty-tab-btn.active {
  color: var(--text-primary);
  background-color: var(--bg-input);
}

.annoty-group-selector {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  background-color: var(--bg-surface);
  display: flex;
  align-items: center;
  gap: 12px; /* Visual spacing separating '+' button from dropdown/edit/delete cluster */
  box-sizing: border-box;
}

.annoty-group-main-area {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.annoty-group-select {
  width: 100%;
  background-color: var(--bg-input);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  border-radius: 6px;
  padding: 6px 10px;
  font-family: var(--font-family);
  font-size: 13px;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
  height: 32px;
}

.annoty-group-select:focus {
  border-color: var(--accent);
}

.annoty-group-placeholder {
  width: 100%;
  background-color: var(--bg-input);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  border-radius: 6px;
  padding: 6px 10px;
  font-family: var(--font-family);
  font-size: 13px;
  height: 32px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  cursor: not-allowed;
}

.annoty-group-inline-input {
  width: 100%;
  background-color: var(--bg-input);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  border-radius: 6px;
  padding: 6px 10px;
  font-family: var(--font-family);
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  height: 32px;
  transition: border-color 0.15s;
}

.annoty-group-inline-input:focus {
  border-color: var(--accent);
}

.annoty-group-actions {
  display: flex;
  gap: 4px;
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
  color: var(--text-primary);
}

.annoty-history-time {
  font-size: 10px;
  color: var(--text-muted);
}

.annoty-history-actions {
  display: flex;
  gap: 4px;
}

.annoty-history-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--accent);
  background-color: var(--bg-main);
  border: 1px solid var(--border-subtle);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}
`;
