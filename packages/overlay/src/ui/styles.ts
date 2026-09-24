export const CSS_STYLES = `
:host {
  --bg-main: #0B0C0E;
  --bg-surface: #13151A;
  --bg-surface-glass: rgba(19, 21, 26, 0.88);
  --bg-input: #1C1F26;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-subtle-bright: rgba(255, 255, 255, 0.14);
  --border-focus: #3ecf8e;
  
  --text-primary: #f4f4f5;
  --text-muted: #9ca3af;
  --text-dim: #6b7280;
  --text-error: #f87171;
  
  --accent: #3ecf8e;
  --accent-hover: #2ebd7d;
  --accent-light: rgba(62, 207, 142, 0.12);
  
  --shadow-popup: 0 16px 40px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
  --shadow-sidebar: -16px 0 48px rgba(0, 0, 0, 0.75), -1px 0 0 0 rgba(255, 255, 255, 0.08);
  --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
  height: 48px;
  background: rgba(14, 16, 21, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  cursor: grab;
  display: flex;
  align-items: center;
  padding: 4px;
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
  border-color: var(--accent);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 16px rgba(62, 207, 142, 0.25);
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
  background-color: rgba(255, 255, 255, 0.08);
}

.annoty-control-btn.active {
  background-color: var(--accent);
  color: #0b0c0e;
  box-shadow: 0 0 12px rgba(62, 207, 142, 0.4);
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
   Overlay Highlight & High-Tech Corner Brackets
   ========================================================================== */
.annoty-highlight {
  position: fixed;
  border: 1.5px solid var(--accent);
  background: rgba(62, 207, 142, 0.08);
  box-shadow: inset 0 0 0 1px rgba(62, 207, 142, 0.25), 0 0 16px rgba(62, 207, 142, 0.15);
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
  border-color: #3ecf8e;
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
  height: 26px;
  background: rgba(11, 12, 14, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.2);
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
  color: var(--accent);
}

.annoty-tooltip-comp {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.25);
  padding: 0 4px;
  border-radius: 3px;
}

.annoty-tooltip-dim {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.annoty-tooltip-hint {
  font-size: 9px;
  font-weight: 600;
  color: var(--text-dim);
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
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55), 0 0 0 1.5px rgba(255, 255, 255, 0.2);
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease;
  user-select: none;
  box-sizing: border-box;
}

.annoty-pin:hover {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7), 0 0 0 2px #ffffff;
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
  border-radius: 50%;
  opacity: 0.6;
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
.annoty-pin-state-pending .annoty-pin-pulse {
  border: 2px solid #10b981;
}

.annoty-pin-state-in_progress {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}
.annoty-pin-state-in_progress .annoty-pin-pulse {
  border: 2px solid #3b82f6;
}

.annoty-pin-state-resolved {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  opacity: 0.75;
}
.annoty-pin-state-resolved .annoty-pin-pulse {
  display: none;
}

.annoty-pin-state-ignored {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  opacity: 0.5;
}
.annoty-pin-state-ignored .annoty-pin-pulse {
  display: none;
}

/* Pin Severities */
.annoty-pin-sev-critical {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.6), 0 0 0 1.5px rgba(255, 255, 255, 0.3) !important;
}
.annoty-pin-sev-critical .annoty-pin-pulse {
  border: 2px solid #ef4444 !important;
}

.annoty-pin-sev-high {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.5), 0 0 0 1.5px rgba(255, 255, 255, 0.3) !important;
}
.annoty-pin-sev-high .annoty-pin-pulse {
  border: 2px solid #f59e0b !important;
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
  width: 380px;
  height: 100vh;
  background-color: var(--bg-surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-left: 1px solid var(--border-subtle);
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
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(11, 12, 14, 0.65);
}

.annoty-sidebar-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.annoty-sidebar-title svg {
  width: 18px;
  height: 18px;
  stroke: var(--accent);
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
  color: var(--accent);
  background: rgba(62, 207, 142, 0.1);
  border: 1px solid rgba(62, 207, 142, 0.2);
  padding: 2px 7px;
  border-radius: 9999px;
}

.annoty-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent);
  box-shadow: 0 0 6px var(--accent);
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
  background-color: var(--border-subtle-bright);
  border-radius: 3px;
}

.annoty-sidebar-list::-webkit-scrollbar-track,
.annoty-preview-area::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Annotation List Item Card */
.annoty-item {
  background: rgba(22, 25, 32, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  border-color: rgba(62, 207, 142, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
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
  background: linear-gradient(135deg, rgba(62, 207, 142, 0.2) 0%, rgba(62, 207, 142, 0.05) 100%);
  border: 1px solid rgba(62, 207, 142, 0.3);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.annoty-item-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background-color: rgba(11, 12, 14, 0.8);
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid var(--border-subtle);
  padding: 6px 16px;
  gap: 6px;
}

.annoty-tab-btn {
  flex: 1;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 6px 12px;
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  border-radius: 6px;
  text-align: center;
  transition: all 0.15s ease;
}

.annoty-tab-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
}

.annoty-tab-btn.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
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

/* ==========================================================================
   Advanced Inspector, Breadcrumbs, Chips & Diagnostics
   ========================================================================== */
.annoty-popup-advanced {
  width: 360px !important;
  max-width: 92vw !important;
}

.annoty-popup-title-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.annoty-specs-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.annoty-spec-pill {
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 1px 6px;
  border-radius: 4px;
}

.annoty-breadcrumbs-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  background: #111418;
  border-bottom: 1px solid var(--border-subtle);
  overflow-x: auto;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.annoty-crumb {
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background 0.15s, color 0.15s;
}

.annoty-crumb:hover {
  background: var(--bg-surface);
  color: var(--accent);
}

.annoty-crumb.is-target {
  color: var(--accent);
  font-weight: 600;
  background: rgba(62, 207, 142, 0.1);
}

.annoty-crumb-sep {
  color: #484f58;
  font-size: 10px;
}

.annoty-diagnostics-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.annoty-diag-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.4;
}

.annoty-diag-warning {
  background: rgba(210, 153, 34, 0.15);
  border: 1px solid rgba(210, 153, 34, 0.4);
  color: #e3b341;
}

.annoty-diag-info {
  background: rgba(88, 166, 255, 0.15);
  border: 1px solid rgba(88, 166, 255, 0.4);
  color: #79c0ff;
}

.annoty-diag-icon {
  font-weight: 700;
  font-family: ui-monospace, monospace;
}

.annoty-chips-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.annoty-chips-label {
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.annoty-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.annoty-chip {
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.annoty-chip:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.annoty-chip.is-active {
  background: var(--accent);
  color: #121214;
  border-color: var(--accent);
  font-weight: 600;
}

.annoty-chip-sev-critical.is-active {
  background: #da3633;
  color: #ffffff;
  border-color: #da3633;
}

.annoty-chip-sev-high.is-active {
  background: #d29922;
  color: #ffffff;
  border-color: #d29922;
}

/* ==========================================================================
   Multi-Format Selector & Enhanced Item Card Styles
   ========================================================================== */
.annoty-preview-format-tabs {
  display: flex;
  background: var(--bg-main);
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
  border: 1px solid var(--border-subtle);
}

.annoty-format-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.annoty-format-btn:hover {
  color: var(--text-primary);
}

.annoty-format-btn.active {
  background: var(--bg-surface);
  color: var(--accent);
  font-weight: 600;
}

.annoty-item-dim {
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--text-muted);
  background: var(--bg-main);
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid var(--border-subtle);
}

.annoty-item-status-pill {
  font-size: 9px;
  font-weight: 700;
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
  background: rgba(210, 153, 34, 0.15);
  color: #e3b341;
  border-color: rgba(210, 153, 34, 0.3);
}

.annoty-item-status-pending:hover {
  background: rgba(210, 153, 34, 0.25);
}

.annoty-item-status-resolved {
  background: rgba(62, 207, 142, 0.15);
  color: var(--accent);
  border-color: rgba(62, 207, 142, 0.3);
}

.annoty-item-status-resolved:hover {
  background: rgba(62, 207, 142, 0.25);
}

.annoty-item-diag-badge {
  font-size: 9px;
  font-weight: 600;
  background: rgba(248, 113, 113, 0.15);
  color: var(--text-error);
  border: 1px solid rgba(248, 113, 113, 0.3);
  padding: 1px 5px;
  border-radius: 3px;
}

.annoty-item-thumb {
  max-width: 100%;
  max-height: 90px;
  border-radius: 4px;
  border: 1px solid var(--border-subtle);
  margin-top: 6px;
  cursor: pointer;
  object-fit: cover;
  display: block;
}

.annoty-diff-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  max-width: 90vw;
  max-height: 85vh;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  box-shadow: var(--shadow-popup);
  z-index: 1000001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.annoty-diff-header {
  padding: 12px 16px;
  background: var(--bg-main);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.annoty-diff-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.annoty-diff-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.annoty-diff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.annoty-diff-table th {
  text-align: left;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 11px;
}

.annoty-diff-table td {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.annoty-diff-before {
  color: #f87171;
  text-decoration: line-through;
}

.annoty-diff-after {
  color: var(--accent);
  font-weight: 600;
}

.annoty-diff-delta {
  background: rgba(62, 207, 142, 0.15);
  color: var(--accent);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
}
`;
