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
import { detectCategories } from '../categoryDetector';

export class Popup {
  private shadowRoot: ShadowRoot;
  private store: AnnotationStore;
  private popupEl: HTMLDivElement | null = null;
  private onClosed: () => void;
  private onRetarget?: (el: HTMLElement) => void;

  // Dragging event cleanup handlers
  private activeDragMoveHandler: ((e: MouseEvent) => void) | null = null;
  private activeDragUpHandler: (() => void) | null = null;
  private activeTouchMoveHandler: ((e: TouchEvent) => void) | null = null;
  private activeTouchEndHandler: (() => void) | null = null;

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

    const selectedCategory: AnnotationCategory = existingAnnotation?.category || 'visual';
    const selectedSeverity: AnnotationSeverity = existingAnnotation?.severity || 'medium';
    const selectedState: AnnotationState = existingAnnotation?.state || 'pending';

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
      ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`
      : `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

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
    const viewportBadge = `<span class="annoty-spec-pill" title="Viewport Preset">${viewport.width} × ${viewport.height}</span>`;

    this.popupEl.innerHTML = `
      <div class="annoty-popup-header" title="Drag to move anywhere">
        <div class="annoty-popup-drag-handle" title="Drag to move anywhere">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="6" r="1.5"></circle>
            <circle cx="15" cy="6" r="1.5"></circle>
            <circle cx="9" cy="12" r="1.5"></circle>
            <circle cx="15" cy="12" r="1.5"></circle>
            <circle cx="9" cy="18" r="1.5"></circle>
            <circle cx="15" cy="18" r="1.5"></circle>
          </svg>
        </div>
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

        <textarea 
          class="annoty-textarea" 
          placeholder="What should change? (e.g., increase padding, adjust alignment, fix copy)"
          rows="4"
        >${this.escapeHtml(existingAnnotation ? existingAnnotation.instruction : '')}</textarea>
      </div>

      <div class="annoty-popup-footer">
        <button class="annoty-btn annoty-btn-secondary annoty-cancel-btn">Cancel</button>
        <button class="annoty-btn annoty-btn-primary annoty-save-btn">Save Annotation</button>
      </div>
    `;

    this.shadowRoot.appendChild(this.popupEl);

    // Initial position
    this.positionPopup(el);

    // Setup dragging handlers so the user can move the popup anywhere
    this.initDraggable();

    // Event listeners
    const closeBtn = this.popupEl.querySelector('.annoty-popup-close');
    const cancelBtn = this.popupEl.querySelector('.annoty-cancel-btn');
    const saveBtn = this.popupEl.querySelector('.annoty-save-btn');
    const textarea = this.popupEl.querySelector('.annoty-textarea') as HTMLTextAreaElement;

    closeBtn?.addEventListener('click', () => this.close());
    cancelBtn?.addEventListener('click', () => this.close());

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
      const autoCategories = detectCategories(text);
      const categoryToSave = existingAnnotation?.category || (autoCategories.length > 0 ? (autoCategories[0] as AnnotationCategory) : selectedCategory);

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
        category: categoryToSave,
        severity: selectedSeverity,
        state: selectedState,
        layout,
        viewport,
        computedStyles,
        domBreadcrumbs: breadcrumbs,
        diagnostics,
      };

      try {
        await this.store.save(annotation);
        this.close();
      } catch (err: any) {
        console.error('[Annoty] Failed to save annotation:', err);
        alert(`Failed to save annotation: ${err.message || err}`);
      }
    });

    setTimeout(() => textarea.focus(), 60);
  }

  private initDraggable(): void {
    if (!this.popupEl) return;

    const header = this.popupEl.querySelector('.annoty-popup-header') as HTMLElement | null;
    if (!header) return;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('.annoty-popup-close')) return;

      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const rect = this.popupEl!.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      header.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !this.popupEl) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

      const rect = this.popupEl.getBoundingClientRect();
      const margin = 8;
      const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
      const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);

      const newLeft = Math.min(Math.max(margin, initialLeft + dx), maxLeft);
      const newTop = Math.min(Math.max(margin, initialTop + dy), maxTop);

      this.popupEl.style.left = `${Math.round(newLeft)}px`;
      this.popupEl.style.top = `${Math.round(newTop)}px`;
      this.popupEl.style.transform = 'none';
    };

    const onMouseUp = () => {
      isDragging = false;
      if (header) header.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.annoty-popup-close')) return;
      if (e.touches.length !== 1) return;

      isDragging = true;
      const t = e.touches[0];
      dragStartX = t.clientX;
      dragStartY = t.clientY;

      const rect = this.popupEl!.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !this.popupEl) return;
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - dragStartX;
      const dy = t.clientY - dragStartY;

      const rect = this.popupEl.getBoundingClientRect();
      const margin = 8;
      const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
      const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);

      const newLeft = Math.min(Math.max(margin, initialLeft + dx), maxLeft);
      const newTop = Math.min(Math.max(margin, initialTop + dy), maxTop);

      this.popupEl.style.left = `${Math.round(newLeft)}px`;
      this.popupEl.style.top = `${Math.round(newTop)}px`;
      this.popupEl.style.transform = 'none';
    };

    const onTouchEnd = () => {
      isDragging = false;
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    header.addEventListener('mousedown', onMouseDown);
    header.addEventListener('touchstart', onTouchStart, { passive: true });

    this.activeDragMoveHandler = onMouseMove;
    this.activeDragUpHandler = onMouseUp;
    this.activeTouchMoveHandler = onTouchMove;
    this.activeTouchEndHandler = onTouchEnd;
  }

  public close(): void {
    if (this.activeDragMoveHandler && this.activeDragUpHandler) {
      document.removeEventListener('mousemove', this.activeDragMoveHandler);
      document.removeEventListener('mouseup', this.activeDragUpHandler);
      this.activeDragMoveHandler = null;
      this.activeDragUpHandler = null;
    }
    if (this.activeTouchMoveHandler && this.activeTouchEndHandler) {
      document.removeEventListener('touchmove', this.activeTouchMoveHandler);
      document.removeEventListener('touchend', this.activeTouchEndHandler);
      this.activeTouchMoveHandler = null;
      this.activeTouchEndHandler = null;
    }

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
    const popupWidth = 340;
    const popupHeight = 260;

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
    this.popupEl.style.transform = 'none';
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
