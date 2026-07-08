import { Annotation, AnnotationStore, SourceMappingResult } from '../types';

export class Popup {
  private shadowRoot: ShadowRoot;
  private store: AnnotationStore;
  private popupEl: HTMLDivElement | null = null;
  private onClosed: () => void;

  constructor(shadowRoot: ShadowRoot, store: AnnotationStore, onClosed: () => void) {
    this.shadowRoot = shadowRoot;
    this.store = store;
    this.onClosed = onClosed;
  }

  /**
   * Opens the annotation popup.
   * If existingAnnotation is provided, we are in Edit mode.
   */
  public open(
    el: HTMLElement | null,
    mappingResult: SourceMappingResult,
    existingAnnotation?: Annotation,
    activeGroupId?: string
  ): void {
    // Close any open popups first
    this.close();

    this.popupEl = document.createElement('div');
    this.popupEl.className = 'annoty-popup';

    const cleanTagName = mappingResult.elementSnapshot
      ? mappingResult.elementSnapshot.match(/^<([a-zA-Z0-9-]+)/)?.[0] || 'element'
      : 'element';
    const textSnippet = mappingResult.textPreview 
      ? ` "${mappingResult.textPreview}"` 
      : '';
    const elementLabel = `${cleanTagName}${textSnippet}`;

    const hasSource = !!mappingResult.filePath;
    const sourceLabel = hasSource
      ? `${mappingResult.filePath}${mappingResult.lineNumber ? `:${mappingResult.lineNumber}` : ''}`
      : 'Unmapped element';

    const sourceIcon = hasSource
      ? `<svg viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`
      : `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

    const initialInstruction = existingAnnotation ? existingAnnotation.instruction : '';

    this.popupEl.innerHTML = `
      <div class="annoty-popup-header">
        <h3 class="annoty-popup-title">${existingAnnotation ? 'Edit Annotation' : 'Add Annotation'}</h3>
        <button class="annoty-popup-close" title="Cancel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="annoty-popup-body">
        <div class="annoty-element-preview" title="${this.escapeHtml(mappingResult.elementSnapshot)}">
          ${this.escapeHtml(elementLabel)}
        </div>
        <div class="annoty-source-preview">
          ${sourceIcon}
          <span>${this.escapeHtml(sourceLabel)}</span>
        </div>
        <textarea 
          class="annoty-textarea" 
          placeholder="What should change? (e.g., make this text green, increase spacing)"
          rows="3"
        >${this.escapeHtml(initialInstruction)}</textarea>
      </div>
      <div class="annoty-popup-footer">
        <button class="annoty-btn annoty-btn-secondary annoty-cancel-btn">Cancel</button>
        <button class="annoty-btn annoty-btn-primary annoty-save-btn">Save</button>
      </div>
    `;

    this.shadowRoot.appendChild(this.popupEl);

    // Setup event listeners
    const closeBtn = this.popupEl.querySelector('.annoty-popup-close');
    const cancelBtn = this.popupEl.querySelector('.annoty-cancel-btn');
    const saveBtn = this.popupEl.querySelector('.annoty-save-btn');
    const textarea = this.popupEl.querySelector('.annoty-textarea') as HTMLTextAreaElement;

    closeBtn?.addEventListener('click', () => this.close());
    cancelBtn?.addEventListener('click', () => this.close());
    
    // Save handler
    saveBtn?.addEventListener('click', async () => {
      const text = textarea.value.trim();
      if (!text) {
        textarea.focus();
        return;
      }

      const annotation: Annotation = {
        id: existingAnnotation ? existingAnnotation.id : crypto.randomUUID(),
        createdAt: existingAnnotation ? existingAnnotation.createdAt : new Date().toISOString(),
        instruction: text,
        sourceTier: mappingResult.sourceTier,
        elementSnapshot: mappingResult.elementSnapshot,
        textPreview: mappingResult.textPreview,
        selector: mappingResult.selector,
        filePath: mappingResult.filePath,
        lineNumber: mappingResult.lineNumber,
        columnNumber: mappingResult.columnNumber,
        landmarkContext: mappingResult.landmarkContext,
        groupId: existingAnnotation ? existingAnnotation.groupId : (activeGroupId || 'default'),
      };

      try {
        await this.store.save(annotation);
        this.close();
      } catch (err: any) {
        console.error('[Annoty] Failed to save annotation:', err);
        alert(`Failed to save annotation: ${err.message || err}`);
      }
    });

    // Auto focus textarea
    setTimeout(() => textarea.focus(), 50);

    // Position the popup near the element (or center if no element)
    this.positionPopup(el);
  }

  public close(): void {
    if (this.popupEl) {
      this.popupEl.remove();
      this.popupEl = null;
      this.onClosed();
    }
  }

  private positionPopup(el: HTMLElement | null): void {
    if (!this.popupEl) return;

    const popupWidth = this.popupEl.offsetWidth || 320;
    const popupHeight = this.popupEl.offsetHeight || 230;

    if (!el) {
      // Center in viewport if no reference element
      this.popupEl.style.top = `${(window.innerHeight - popupHeight) / 2}px`;
      this.popupEl.style.left = `${(window.innerWidth - popupWidth) / 2}px`;
      return;
    }

    const rect = el.getBoundingClientRect();
    
    let top = rect.bottom + 8;
    let left = rect.left;

    // Horizonal boundaries
    if (left + popupWidth > window.innerWidth) {
      left = window.innerWidth - popupWidth - 16;
    }
    left = Math.max(16, left);

    // Vertical boundaries
    if (top + popupHeight > window.innerHeight) {
      // Try to place above
      top = rect.top - popupHeight - 8;
    }

    // Top check
    if (top < 16) {
      top = 16;
    }

    this.popupEl.style.top = `${top}px`;
    this.popupEl.style.left = `${left}px`;
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
