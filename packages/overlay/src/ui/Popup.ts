import {
  Annotation,
  AnnotationCategory,
  AnnotationSeverity,
  AnnotationState,
  AnnotationStore,
  SourceMappingResult,
} from '../types';
import {
  inspectComputedStyles,
  getElementLayout,
  getViewportInfo,
  getDOMBreadcrumbs,
  runUIDiagnostics,
} from '../styleInspector';
import { StyleDiffEngine, StyleDiffReport } from '../styleDiffEngine';
import { captureElementScreenshot } from '../screenshotCapture';

const CATEGORIES: { id: AnnotationCategory; label: string }[] = [
  { id: 'visual', label: 'Visual' },
  { id: 'bug', label: 'Bug' },
  { id: 'feature', label: 'Feature' },
  { id: 'responsive', label: 'Responsive' },
  { id: 'accessibility', label: 'A11y' },
  { id: 'performance', label: 'Perf' },
  { id: 'content', label: 'Content' },
  { id: 'refactor', label: 'Refactor' },
];

const SEVERITIES: { id: AnnotationSeverity; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Med' },
  { id: 'high', label: 'High' },
  { id: 'critical', label: 'Critical' },
];

export class Popup {
  private shadowRoot: ShadowRoot;
  private store: AnnotationStore;
  private popupEl: HTMLDivElement | null = null;
  private diffModalEl: HTMLDivElement | null = null;
  private onClosed: () => void;
  private onRetarget?: (el: HTMLElement) => void;

  constructor(
    shadowRoot: ShadowRoot,
    store: AnnotationStore,
    onClosed: () => void,
    onRetarget?: (el: HTMLElement) => void
  ) {
    this.shadowRoot = shadowRoot;
    this.store = store;
    this.onClosed = onClosed;
    this.onRetarget = onRetarget;
  }

  public open(
    el: HTMLElement | null,
    mappingResult: SourceMappingResult,
    existingAnnotation?: Annotation,
    activeGroupId?: string
  ): void {
    this.close();

    this.popupEl = document.createElement('div');
    this.popupEl.className = 'annoty-popup annoty-popup-advanced';

    // Inspect element metrics locally
    const layout = el ? getElementLayout(el) : undefined;
    const viewport = getViewportInfo();
    const computedStyles = el ? inspectComputedStyles(el) : undefined;
    const breadcrumbs = el ? getDOMBreadcrumbs(el) : [];
    const diagnostics = el ? runUIDiagnostics(el) : [];

    let selectedCategory: AnnotationCategory = existingAnnotation?.category || 'visual';
    let selectedSeverity: AnnotationSeverity = existingAnnotation?.severity || 'medium';
    let selectedState: AnnotationState = existingAnnotation?.state || 'pending';
    let capturedScreenshot: string = existingAnnotation?.screenshotBase64 || '';

    // Check style baseline & diff
    let diffReport: StyleDiffReport | null = null;
    const hasBaseline = !!StyleDiffEngine.getBaseline(mappingResult.selector);
    if (hasBaseline && computedStyles && layout) {
      diffReport = StyleDiffEngine.compare(mappingResult.selector, computedStyles, layout);
    }

    const cleanTagName = mappingResult.elementSnapshot
      ? mappingResult.elementSnapshot.match(/^<([a-zA-Z0-9-]+)/)?.[0] || 'element'
      : 'element';
    const textSnippet = mappingResult.textPreview ? ` "${mappingResult.textPreview}"` : '';
    const elementLabel = `${cleanTagName}${textSnippet}`;

    const hasSource = !!mappingResult.filePath;
    const sourceLabel = hasSource
      ? `${mappingResult.filePath}${mappingResult.lineNumber ? `:${mappingResult.lineNumber}` : ''}`
      : 'Unmapped element';

    const sourceIcon = hasSource
      ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`
      : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

    // Build breadcrumbs HTML
    let breadcrumbsHtml = '';
    if (breadcrumbs.length > 0) {
      breadcrumbsHtml = `
        <div class="annoty-breadcrumbs-bar" title="Click any parent to change selection target">
          ${breadcrumbs
            .map(
              (b, idx) => `
            <span class="annoty-crumb ${b.isTarget ? 'is-target' : ''}" data-crumb-idx="${idx}">
              ${this.escapeHtml(b.selector)}
            </span>
            ${idx < breadcrumbs.length - 1 ? '<span class="annoty-crumb-sep">&gt;</span>' : ''}
          `
            )
            .join('')}
        </div>
      `;
    }

    // Diagnostics alert
    let diagnosticsHtml = '';
    if (diagnostics.length > 0) {
      diagnosticsHtml = `
        <div class="annoty-diagnostics-bar">
          ${diagnostics
            .map(
              (d) => `
            <div class="annoty-diag-item annoty-diag-${d.level}">
              <span class="annoty-diag-icon">!</span>
              <span>${this.escapeHtml(d.message)}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    // Layout badges
    const dimensionsBadge = layout
      ? `<span class="annoty-spec-pill" title="Element Dimensions">${layout.width} × ${layout.height}px</span>`
      : '';
    const viewportBadge = `<span class="annoty-spec-pill" title="Viewport Preset">${viewport.width} × ${viewport.height} (${viewport.preset})</span>`;

    // Baseline action label
    let baselineBtnLabel = '📸 Set Baseline';
    if (diffReport) {
      baselineBtnLabel = diffReport.hasChanges
        ? `⚡ Diff (${diffReport.totalChanges} changes)`
        : '✓ Matches Baseline';
    }

    this.popupEl.innerHTML = `
      <div class="annoty-popup-header">
        <div class="annoty-popup-title-row">
          <h3 class="annoty-popup-title">${existingAnnotation ? 'Edit Annotation' : 'Add Annotation'}</h3>
          <div class="annoty-specs-row">${dimensionsBadge}${viewportBadge}</div>
        </div>
        <button class="annoty-popup-close" title="Close (Esc)">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      ${breadcrumbsHtml}

      <div class="annoty-popup-body">
        <div class="annoty-element-preview" title="${this.escapeHtml(mappingResult.elementSnapshot)}">
          ${this.escapeHtml(elementLabel)}
        </div>
        <div class="annoty-source-preview">
          ${sourceIcon}
          <span>${this.escapeHtml(sourceLabel)}</span>
        </div>

        ${diagnosticsHtml}

        <!-- Element Action Toolbar: Screenshot & Baseline Diff -->
        <div style="display: flex; gap: 6px; margin-top: 8px;">
          <button type="button" class="annoty-spec-pill annoty-snap-btn" style="cursor: pointer; padding: 3px 8px; font-weight: 500;">
            📷 Snap
          </button>
          <button type="button" class="annoty-spec-pill annoty-baseline-btn" style="cursor: pointer; padding: 3px 8px; font-weight: 500;">
            ${baselineBtnLabel}
          </button>
        </div>

        <!-- Thumbnail preview if captured -->
        <div class="annoty-popup-thumb-container" style="display: ${capturedScreenshot ? 'block' : 'none'}; margin-top: 8px;">
          <img class="annoty-item-thumb annoty-popup-thumb" src="${capturedScreenshot}" style="max-height: 70px;" />
        </div>

        <!-- Categories -->
        <div class="annoty-chips-section">
          <div class="annoty-chips-label">CATEGORY</div>
          <div class="annoty-chips-list" id="annotyCategoryChips">
            ${CATEGORIES.map(
              (c) => `
              <button type="button" class="annoty-chip ${c.id === selectedCategory ? 'is-active' : ''}" data-cat="${c.id}">
                ${c.label}
              </button>
            `
            ).join('')}
          </div>
        </div>

        <!-- Severities -->
        <div class="annoty-chips-section">
          <div class="annoty-chips-label">SEVERITY</div>
          <div class="annoty-chips-list" id="annotySeverityChips">
            ${SEVERITIES.map(
              (s) => `
              <button type="button" class="annoty-chip annoty-chip-sev-${s.id} ${s.id === selectedSeverity ? 'is-active' : ''}" data-sev="${s.id}">
                ${s.label}
              </button>
            `
            ).join('')}
          </div>
        </div>

        <textarea 
          class="annoty-textarea" 
          placeholder="What should change? (e.g., increase padding to 12px, fix contrast on mobile)"
          rows="3"
        >${this.escapeHtml(existingAnnotation ? existingAnnotation.instruction : '')}</textarea>
      </div>

      <div class="annoty-popup-footer">
        <button class="annoty-btn annoty-btn-secondary annoty-cancel-btn">Cancel</button>
        <button class="annoty-btn annoty-btn-primary annoty-save-btn">Save Annotation</button>
      </div>
    `;

    this.shadowRoot.appendChild(this.popupEl);

    // Event listeners
    const closeBtn = this.popupEl.querySelector('.annoty-popup-close');
    const cancelBtn = this.popupEl.querySelector('.annoty-cancel-btn');
    const saveBtn = this.popupEl.querySelector('.annoty-save-btn');
    const textarea = this.popupEl.querySelector('.annoty-textarea') as HTMLTextAreaElement;
    const snapBtn = this.popupEl.querySelector('.annoty-snap-btn') as HTMLButtonElement;
    const baselineBtn = this.popupEl.querySelector('.annoty-baseline-btn') as HTMLButtonElement;
    const thumbContainer = this.popupEl.querySelector('.annoty-popup-thumb-container') as HTMLDivElement;
    const thumbImg = this.popupEl.querySelector('.annoty-popup-thumb') as HTMLImageElement;

    closeBtn?.addEventListener('click', () => this.close());
    cancelBtn?.addEventListener('click', () => this.close());

    // Screenshot capture button
    snapBtn?.addEventListener('click', async () => {
      if (!el) return;
      snapBtn.textContent = 'Snapping…';
      try {
        const dataUrl = await captureElementScreenshot(el);
        if (dataUrl) {
          capturedScreenshot = dataUrl;
          thumbImg.src = dataUrl;
          thumbContainer.style.display = 'block';
          snapBtn.textContent = '✓ Snapped';
        } else {
          snapBtn.textContent = '📷 Snap';
        }
      } catch {
        snapBtn.textContent = '📷 Snap';
      }
    });

    // Baseline / Diff button
    baselineBtn?.addEventListener('click', () => {
      if (!computedStyles || !layout) return;

      if (!hasBaseline) {
        StyleDiffEngine.saveBaseline(mappingResult.selector, computedStyles, layout);
        baselineBtn.textContent = '✓ Baseline Saved';
      } else if (diffReport && diffReport.hasChanges) {
        this.openDiffModal(diffReport);
      } else {
        // Allow updating baseline
        if (confirm('A baseline already exists for this element. Update baseline to current styles?')) {
          StyleDiffEngine.saveBaseline(mappingResult.selector, computedStyles, layout);
          baselineBtn.textContent = '✓ Updated Baseline';
        }
      }
    });

    // Category chips selection
    this.popupEl.querySelectorAll('#annotyCategoryChips .annoty-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.popupEl?.querySelectorAll('#annotyCategoryChips .annoty-chip').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        selectedCategory = btn.getAttribute('data-cat') as AnnotationCategory;
      });
    });

    // Severity chips selection
    this.popupEl.querySelectorAll('#annotySeverityChips .annoty-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.popupEl?.querySelectorAll('#annotySeverityChips .annoty-chip').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        selectedSeverity = btn.getAttribute('data-sev') as AnnotationSeverity;
      });
    });

    // Breadcrumb parent retargeting
    if (el && this.onRetarget) {
      this.popupEl.querySelectorAll('.annoty-crumb').forEach((crumb) => {
        crumb.addEventListener('click', () => {
          const idx = parseInt(crumb.getAttribute('data-crumb-idx') || '-1', 10);
          if (idx >= 0 && idx < breadcrumbs.length) {
            let ancestor: HTMLElement | null = el;
            let currentIdx = breadcrumbs.length - 1;
            while (ancestor && currentIdx > idx) {
              ancestor = ancestor.parentElement;
              currentIdx--;
            }
            if (ancestor) {
              this.onRetarget?.(ancestor);
            }
          }
        });
      });
    }

    // Save handler
    saveBtn?.addEventListener('click', async () => {
      const text = textarea.value.trim();
      if (!text) {
        textarea.focus();
        return;
      }

      const all = await this.store.list();
      const pinNumber = existingAnnotation?.pinNumber || all.length + 1;

      const annotation: Annotation = {
        id: existingAnnotation ? existingAnnotation.id : (crypto.randomUUID ? crypto.randomUUID() : `anno_${Date.now()}`),
        pinNumber,
        createdAt: existingAnnotation ? existingAnnotation.createdAt : new Date().toISOString(),
        instruction: text,
        sourceTier: mappingResult.sourceTier,
        elementSnapshot: mappingResult.elementSnapshot,
        textPreview: mappingResult.textPreview,
        selector: mappingResult.selector,
        filePath: mappingResult.filePath,
        lineNumber: mappingResult.lineNumber,
        columnNumber: mappingResult.columnNumber,
        componentName: mappingResult.componentName,
        landmarkContext: mappingResult.landmarkContext,
        groupId: existingAnnotation ? existingAnnotation.groupId : (activeGroupId || 'default'),
        category: selectedCategory,
        severity: selectedSeverity,
        state: selectedState,
        layout,
        viewport,
        computedStyles,
        domBreadcrumbs: breadcrumbs,
        diagnostics,
        screenshotBase64: capturedScreenshot || undefined,
      };

      try {
        await this.store.save(annotation);
        this.close();
      } catch (err: any) {
        console.error('[Annoty] Failed to save annotation:', err);
        alert(`Failed to save annotation: ${err.message || err}`);
      }
    });

    setTimeout(() => textarea.focus(), 50);
    this.positionPopup(el);
  }

  private openDiffModal(report: StyleDiffReport): void {
    this.closeDiffModal();

    this.diffModalEl = document.createElement('div');
    this.diffModalEl.className = 'annoty-diff-modal';

    const rows = report.diffs
      .map(
        (d) => `
      <tr>
        <td><strong>${this.escapeHtml(d.property)}</strong></td>
        <td><span class="annoty-diff-before">${this.escapeHtml(d.before)}</span></td>
        <td><span class="annoty-diff-after">${this.escapeHtml(d.after)}</span></td>
        <td>${d.delta ? `<span class="annoty-diff-delta">${this.escapeHtml(d.delta)}</span>` : '-'}</td>
      </tr>
    `
      )
      .join('');

    this.diffModalEl.innerHTML = `
      <div class="annoty-diff-header">
        <h3 class="annoty-diff-title">BEFORE → AFTER Style Diff</h3>
        <button class="annoty-icon-btn annoty-diff-close" title="Close">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="annoty-diff-body">
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
          Selector: <code>${this.escapeHtml(report.selector)}</code><br/>
          Total Property Changes: <strong>${report.totalChanges}</strong>
        </div>
        <table class="annoty-diff-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Before</th>
              <th>After</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    this.shadowRoot.appendChild(this.diffModalEl);
    this.diffModalEl.querySelector('.annoty-diff-close')?.addEventListener('click', () => {
      this.closeDiffModal();
    });
  }

  private closeDiffModal(): void {
    if (this.diffModalEl) {
      this.diffModalEl.remove();
      this.diffModalEl = null;
    }
  }

  public close(): void {
    this.closeDiffModal();
    if (this.popupEl) {
      this.popupEl.remove();
      this.popupEl = null;
      this.onClosed();
    }
  }

  private positionPopup(targetEl: HTMLElement | null): void {
    if (!this.popupEl) return;

    if (!targetEl) {
      this.popupEl.style.top = '50%';
      this.popupEl.style.left = '50%';
      this.popupEl.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const margin = 12;
    const popupWidth = 360;
    const popupHeight = 320;

    let top = rect.bottom + margin;
    let left = rect.left;

    if (top + popupHeight > window.innerHeight) {
      top = rect.top - popupHeight - margin;
    }
    if (top < margin) {
      top = margin;
    }
    if (left + popupWidth > window.innerWidth) {
      left = window.innerWidth - popupWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    this.popupEl.style.top = `${Math.round(top)}px`;
    this.popupEl.style.left = `${Math.round(left)}px`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
