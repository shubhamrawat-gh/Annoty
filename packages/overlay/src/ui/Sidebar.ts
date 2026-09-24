import {
  Annotation,
  AnnotationStore,
  GroupStore,
  PromptHistoryStore,
  PromptHistoryEntry,
  AnnotationState,
} from '../types';
import {
  compileToMarkdown,
  compileToJSON,
  compileToPlainText,
  downloadFile,
} from '../promptCompiler';
import { detectCategories } from '../categoryDetector';
import { downloadScreenshot } from '../screenshotCapture';

export class Sidebar {
  private shadowRoot: ShadowRoot;
  private store: AnnotationStore;
  private groupStore: GroupStore;
  private historyStore: PromptHistoryStore;

  // DOM Elements
  private sidebarEl!: HTMLDivElement;
  private listEl!: HTMLDivElement;
  private groupSelectorEl!: HTMLDivElement;
  private tabsEl!: HTMLDivElement;

  // Preview panel elements
  private previewPanelEl!: HTMLDivElement;
  private previewAreaEl!: HTMLDivElement;
  private toastEl!: HTMLDivElement;
  private copyBtnEl!: HTMLButtonElement;
  private downloadBtnEl!: HTMLButtonElement;
  private clearBtnEl!: HTMLButtonElement;
  private generateBtnEl!: HTMLButtonElement;
  private formatBtns!: NodeListOf<HTMLButtonElement>;

  private isOpen = false;
  private activeTab: 'annotations' | 'history' = 'annotations';
  private groupMode: 'normal' | 'create' | 'rename' = 'normal';
  private previewFormat: 'markdown' | 'json' | 'plain' = 'markdown';
  private activeGroupAnnotations: Annotation[] = [];
  private onEditAnnotation: (anno: Annotation) => void;

  constructor(
    shadowRoot: ShadowRoot,
    store: AnnotationStore,
    groupStore: GroupStore,
    historyStore: PromptHistoryStore,
    onEdit: (anno: Annotation) => void
  ) {
    this.shadowRoot = shadowRoot;
    this.store = store;
    this.groupStore = groupStore;
    this.historyStore = historyStore;
    this.onEditAnnotation = onEdit;

    this.createSidebarDOM();

    // Subscribe to stores to trigger reactive updates
    this.store.subscribe(() => this.render());
    this.groupStore.subscribe(() => this.render());
    this.historyStore.subscribe(() => this.render());

    // Restore last open/closed state
    this.restoreState();
  }

  private createSidebarDOM(): void {
    this.sidebarEl = document.createElement('div');
    this.sidebarEl.className = 'annoty-sidebar';

    this.sidebarEl.innerHTML = `
      <div class="annoty-sidebar-header">
        <h2 class="annoty-sidebar-title">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span>Annoty</span>
        </h2>
        <button class="annoty-icon-btn annoty-sidebar-close" title="Close Panel">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Tabs Navigation -->
      <div class="annoty-sidebar-tabs">
        <button class="annoty-tab-btn active" data-tab="annotations">Annotations</button>
        <button class="annoty-tab-btn" data-tab="history">History</button>
      </div>

      <!-- Group Selection Container -->
      <div class="annoty-group-selector">
        <button class="annoty-icon-btn annoty-group-add-btn" title="Create New Group">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        
        <div class="annoty-group-main-area">
          <!-- Dynamically swapped: dropdown OR inert placeholder OR inline text input -->
        </div>

        <div class="annoty-group-actions">
          <button class="annoty-icon-btn annoty-group-rename-btn" title="Rename Group">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path></svg>
          </button>
          <button class="annoty-icon-btn annoty-icon-btn-danger annoty-group-delete-btn" title="Delete Group (cascade deletes annotations)">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
      
      <!-- List Container -->
      <div class="annoty-sidebar-list"></div>
      
      <!-- Footer Actions -->
      <div class="annoty-sidebar-footer">
        <div class="annoty-footer-actions">
          <button class="annoty-btn annoty-btn-secondary annoty-clear-btn" disabled>Clear All</button>
          <button class="annoty-btn annoty-btn-primary annoty-generate-btn" disabled>Generate Prompt</button>
        </div>
      </div>

      <!-- Preview overlay panel inside the sidebar -->
      <div class="annoty-preview-panel" style="display: none;">
        <div class="annoty-preview-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 class="annoty-preview-title" style="margin: 0; font-size: 13px;">Export Context</h3>
            <div class="annoty-preview-format-tabs">
              <button class="annoty-format-btn active" data-format="markdown">MD</button>
              <button class="annoty-format-btn" data-format="json">JSON</button>
              <button class="annoty-format-btn" data-format="plain">Text</button>
            </div>
          </div>
          <button class="annoty-icon-btn annoty-preview-close" title="Close Preview">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="annoty-preview-body">
          <div class="annoty-preview-area" contenteditable="true" spellcheck="false" title="Click to edit before copying"></div>
          <div class="annoty-toast">Copied to Clipboard!</div>
        </div>
        <div class="annoty-preview-footer">
          <button class="annoty-btn annoty-btn-secondary annoty-download-btn" title="Download as file">Download</button>
          <button class="annoty-btn annoty-btn-primary annoty-copy-btn">Copy to Clipboard</button>
        </div>
      </div>
    `;

    this.shadowRoot.appendChild(this.sidebarEl);

    // Bind DOM members
    this.listEl = this.sidebarEl.querySelector('.annoty-sidebar-list')!;
    this.groupSelectorEl = this.sidebarEl.querySelector('.annoty-group-selector')!;
    this.tabsEl = this.sidebarEl.querySelector('.annoty-sidebar-tabs')!;
    this.previewPanelEl = this.sidebarEl.querySelector('.annoty-preview-panel')!;
    this.previewAreaEl = this.sidebarEl.querySelector('.annoty-preview-area')!;
    this.toastEl = this.sidebarEl.querySelector('.annoty-toast')!;
    this.copyBtnEl = this.sidebarEl.querySelector('.annoty-copy-btn')!;
    this.downloadBtnEl = this.sidebarEl.querySelector('.annoty-download-btn')!;
    this.clearBtnEl = this.sidebarEl.querySelector('.annoty-clear-btn')!;
    this.generateBtnEl = this.sidebarEl.querySelector('.annoty-generate-btn')!;
    this.formatBtns = this.sidebarEl.querySelectorAll('.annoty-format-btn');

    // Format tabs listener
    this.formatBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.formatBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.previewFormat = btn.getAttribute('data-format') as 'markdown' | 'json' | 'plain';
        this.updatePreviewContent();
      });
    });

    // Setup tab clicks
    const tabButtons = this.tabsEl.querySelectorAll('.annoty-tab-btn');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        tabButtons.forEach((b) => b.classList.remove('active'));
        target.classList.add('active');
        this.activeTab = target.getAttribute('data-tab') as 'annotations' | 'history';
        this.groupMode = 'normal';
        this.render();
      });
    });

    // Wire group control actions
    this.sidebarEl.querySelector('.annoty-group-add-btn')!.addEventListener('click', () => {
      this.groupMode = 'create';
      this.renderGroupSelector();
    });

    this.sidebarEl.querySelector('.annoty-group-rename-btn')!.addEventListener('click', async () => {
      const active = await this.groupStore.getActive();
      if (active) {
        this.groupMode = 'rename';
        this.renderGroupSelector();
      }
    });

    this.sidebarEl.querySelector('.annoty-group-delete-btn')!.addEventListener('click', async () => {
      const active = await this.groupStore.getActive();
      if (active) {
        if (
          confirm(
            `Delete the group "${active.name}"? This will cascade-delete its annotations. Prompts already generated in History will remain safe.`
          )
        ) {
          await this.groupStore.delete(active.id);
        }
      }
    });

    // Global drawer actions
    this.sidebarEl.querySelector('.annoty-sidebar-close')!.addEventListener('click', () => this.toggle(false));
    this.generateBtnEl.addEventListener('click', () => this.generatePromptAction());
    this.previewPanelEl.querySelector('.annoty-preview-close')!.addEventListener('click', () => this.hidePreviewPanel());
    this.copyBtnEl.addEventListener('click', () => this.copyToClipboard());
    this.downloadBtnEl.addEventListener('click', () => this.handleDownload());
    this.clearBtnEl.addEventListener('click', () => this.handleClearAll());
  }

  private restoreState(): void {
    try {
      const wasOpen = localStorage.getItem('annoty:sidebar-open') === 'true';
      this.toggle(wasOpen);
    } catch {
      this.toggle(false);
    }
  }

  public toggle(open?: boolean): void {
    this.isOpen = open !== undefined ? open : !this.isOpen;
    if (this.isOpen) {
      this.sidebarEl.classList.add('open');
      this.render();
    } else {
      this.sidebarEl.classList.remove('open');
      this.hidePreviewPanel();
    }

    try {
      localStorage.setItem('annoty:sidebar-open', this.isOpen ? 'true' : 'false');
    } catch {
      // Ignored
    }
  }

  private async render(): Promise<void> {
    if (!this.isOpen) return;

    try {
      if (this.activeTab === 'annotations') {
        this.groupSelectorEl.style.display = 'flex';
        this.sidebarEl.querySelector('.annoty-sidebar-footer')!.setAttribute('style', 'display: flex;');

        await this.renderGroupSelector();
        await this.renderAnnotationsList();
      } else {
        this.groupSelectorEl.style.display = 'none';
        this.sidebarEl.querySelector('.annoty-sidebar-footer')!.setAttribute('style', 'display: none;');

        await this.renderHistoryList();
      }
    } catch (err: any) {
      console.error('[Annoty] Sidebar render failed:', err);
      this.renderEmptyState('Failed to load local annotations store.');
      this.clearBtnEl.disabled = true;
      this.generateBtnEl.disabled = true;
    }
  }

  private async renderGroupSelector(): Promise<void> {
    const mainArea = this.sidebarEl.querySelector('.annoty-group-main-area') as HTMLDivElement;
    const renameBtn = this.sidebarEl.querySelector('.annoty-group-rename-btn') as HTMLButtonElement;
    const deleteBtn = this.sidebarEl.querySelector('.annoty-group-delete-btn') as HTMLButtonElement;
    const addBtn = this.sidebarEl.querySelector('.annoty-group-add-btn') as HTMLButtonElement;

    const groups = await this.groupStore.list();
    const active = await this.groupStore.getActive();

    // Disable rename/delete if no active group
    renameBtn.disabled = !active;
    deleteBtn.disabled = !active || groups.length <= 1;

    if (this.groupMode === 'create') {
      mainArea.innerHTML = '';
      addBtn.disabled = true;
      renameBtn.disabled = true;
      deleteBtn.disabled = true;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'annoty-group-inline-input';
      input.placeholder = 'Group name…';
      mainArea.appendChild(input);
      input.focus();

      let resolved = false;
      const resolveInput = async () => {
        if (resolved) return;

        const val = input.value.trim();
        if (val) {
          try {
            const currentGroups = await this.groupStore.list();
            if (currentGroups.some((g) => g.name.toLowerCase() === val.toLowerCase())) {
              alert(`A group with the name "${val}" already exists.`);
              setTimeout(() => {
                input.focus();
              }, 50);
              return;
            }

            resolved = true;
            this.groupMode = 'normal';
            addBtn.disabled = false;

            const newGroup = await this.groupStore.create(val);
            await this.groupStore.setActive(newGroup.id);
          } catch (err: any) {
            alert(err.message || 'Failed to create group.');
            setTimeout(() => {
              input.focus();
            }, 50);
          }
        } else {
          resolved = true;
          this.groupMode = 'normal';
          addBtn.disabled = false;
          this.render();
        }
      };

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          input.blur();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          input.value = '';
          input.blur();
        }
      });

      input.addEventListener('blur', resolveInput);
    } else if (this.groupMode === 'rename' && active) {
      mainArea.innerHTML = '';
      addBtn.disabled = true;
      renameBtn.disabled = true;
      deleteBtn.disabled = true;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'annoty-group-inline-input';
      input.placeholder = 'Group name…';
      input.value = active.name;
      mainArea.appendChild(input);
      input.focus();
      input.select();

      let resolved = false;
      const resolveInput = async () => {
        if (resolved) return;

        const val = input.value.trim();
        if (val) {
          if (val === active.name) {
            resolved = true;
            this.groupMode = 'normal';
            addBtn.disabled = false;
            this.render();
            return;
          }

          try {
            const currentGroups = await this.groupStore.list();
            if (currentGroups.some((g) => g.id !== active.id && g.name.toLowerCase() === val.toLowerCase())) {
              alert(`A group with the name "${val}" already exists.`);
              setTimeout(() => {
                input.focus();
              }, 50);
              return;
            }

            resolved = true;
            this.groupMode = 'normal';
            addBtn.disabled = false;

            await this.groupStore.rename(active.id, val);
          } catch (err: any) {
            alert(err.message || 'Failed to rename group.');
            setTimeout(() => {
              input.focus();
            }, 50);
          }
        } else {
          resolved = true;
          this.groupMode = 'normal';
          addBtn.disabled = false;
          this.render();
        }
      };

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          input.blur();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          input.value = active.name;
          input.blur();
        }
      });

      input.addEventListener('blur', resolveInput);
    } else {
      // Normal Mode
      addBtn.disabled = false;

      if (groups.length === 0) {
        mainArea.innerHTML = '<div class="annoty-group-placeholder">No groups yet</div>';
        renameBtn.disabled = true;
        deleteBtn.disabled = true;
      } else {
        mainArea.innerHTML = '<select class="annoty-group-select"></select>';
        const select = mainArea.querySelector('.annoty-group-select') as HTMLSelectElement;

        const annotations = await this.store.list();

        groups.forEach((g) => {
          const opt = document.createElement('option');
          opt.value = g.id;
          opt.selected = active ? g.id === active.id : false;

          const count = annotations.filter((a) => a.groupId === g.id).length;
          opt.textContent = `${opt.selected ? '✓ ' : ''}${g.name} (${count})`;
          select.appendChild(opt);
        });

        select.addEventListener('change', async () => {
          await this.groupStore.setActive(select.value);
        });
      }
    }
  }

  private async renderAnnotationsList(): Promise<void> {
    const activeGroup = await this.groupStore.getActive();
    if (!activeGroup) {
      this.renderEmptyState('No active group');
      return;
    }

    const annotations = await this.store.list();
    const filtered = annotations.filter((a) => a.groupId === activeGroup.id);
    this.activeGroupAnnotations = filtered;

    this.listEl.innerHTML = '';

    if (filtered.length === 0) {
      this.renderEmptyState(
        'No annotations in this group yet. Click the inspect button (or press "I") to select any element on your page.'
      );
      this.clearBtnEl.disabled = true;
      this.generateBtnEl.disabled = true;
      return;
    }

    this.clearBtnEl.disabled = false;
    this.generateBtnEl.disabled = false;

    filtered.forEach((anno, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'annoty-item';

      const tagMatch = anno.elementSnapshot.match(/^<([a-zA-Z0-9-]+)/);
      const tagName = tagMatch ? tagMatch[1] : 'element';

      const fileLabel = anno.filePath
        ? `${anno.filePath}${anno.lineNumber ? ` : Line ${anno.lineNumber}` : ''}`
        : 'Unmapped element';

      const pinNumber = anno.pinNumber || index + 1;
      const state = (anno.state || 'pending') as AnnotationState;

      // Dimension specs badge
      const dimBadge = anno.layout
        ? `<span class="annoty-item-dim">${anno.layout.width}×${anno.layout.height}px</span>`
        : '';

      // Diagnostics warning badge
      const diagBadge =
        anno.diagnostics && anno.diagnostics.length > 0
          ? `<span class="annoty-item-diag-badge" title="${anno.diagnostics.map((d) => d.message).join(' | ')}">⚠ ${anno.diagnostics.length}</span>`
          : '';

      // Chips
      const categories = detectCategories(anno.instruction);
      let chipsHtml = '';
      if (anno.category) {
        chipsHtml += `<span class="annoty-chip annoty-chip-${anno.category} is-active" style="padding: 1px 6px; font-size: 10px;">${anno.category}</span>`;
      }
      categories.forEach((cat) => {
        if (cat !== anno.category) {
          chipsHtml += `<span class="annoty-chip" style="padding: 1px 6px; font-size: 10px;">${cat.replace(/-/g, ' ')}</span>`;
        }
      });

      // Thumbnail
      let thumbHtml = '';
      if (anno.screenshotBase64) {
        thumbHtml = `<img class="annoty-item-thumb" src="${anno.screenshotBase64}" title="Click to download element screenshot" />`;
      }

      itemEl.innerHTML = `
        <div class="annoty-item-header">
          <div class="annoty-item-meta">
            <div class="annoty-item-title-row" style="display: flex; align-items: center; gap: 6px;">
              <span class="annoty-item-badge">#${pinNumber}</span>
              <span class="annoty-item-tag" title="${this.escapeHtml(anno.elementSnapshot)}">&lt;${tagName}&gt;</span>
              ${dimBadge}
              ${diagBadge}
              <button class="annoty-item-status-pill annoty-item-status-${state}" data-anno-id="${anno.id}" title="Click to toggle status">
                ${state}
              </button>
            </div>
            <span class="annoty-item-file" title="${this.escapeHtml(fileLabel)}">${this.escapeHtml(fileLabel)}</span>
            <div class="annoty-item-chips" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
              ${chipsHtml}
            </div>
          </div>
          <div class="annoty-item-actions">
            <button class="annoty-icon-btn annoty-edit-btn" title="Edit instruction">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path></svg>
            </button>
            <button class="annoty-icon-btn annoty-icon-btn-danger annoty-delete-btn" title="Delete annotation">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
        <p class="annoty-item-instruction">${this.escapeHtml(anno.instruction)}</p>
        ${thumbHtml}
      `;

      // Status toggle handler
      const statusBtn = itemEl.querySelector('.annoty-item-status-pill');
      statusBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const nextState: AnnotationState = state === 'resolved' ? 'pending' : 'resolved';
        await this.store.update(anno.id, { state: nextState });
      });

      // Thumbnail download handler
      const thumbImg = itemEl.querySelector('.annoty-item-thumb');
      thumbImg?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (anno.screenshotBase64) {
          downloadScreenshot(anno.screenshotBase64, `annoty-element-${anno.pinNumber || index + 1}.png`);
        }
      });

      itemEl.querySelector('.annoty-edit-btn')!.addEventListener('click', () => {
        this.onEditAnnotation(anno);
      });

      itemEl.querySelector('.annoty-delete-btn')!.addEventListener('click', async () => {
        if (confirm('Delete this annotation?')) {
          await this.store.delete(anno.id);
        }
      });

      this.listEl.appendChild(itemEl);
    });
  }

  private async renderHistoryList(): Promise<void> {
    const history = await this.historyStore.list();
    this.listEl.innerHTML = '';

    if (history.length === 0) {
      this.renderEmptyState('No generated prompts in history yet.');
      return;
    }

    history.forEach((entry) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'annoty-item';

      const timeStr = this.getRelativeTimeString(entry.generatedAt);

      itemEl.innerHTML = `
        <div class="annoty-history-item-header">
          <div class="annoty-history-item-top">
            <div class="annoty-history-title-block">
              <span class="annoty-history-group-name">${this.escapeHtml(entry.groupName)}</span>
              <span class="annoty-history-time">${this.escapeHtml(timeStr)}</span>
            </div>
            <div class="annoty-history-actions">
              <button class="annoty-btn annoty-btn-secondary annoty-copy-again-btn" style="padding: 3px 8px; font-size: 10px;">
                Copy
              </button>
              <button class="annoty-icon-btn annoty-icon-btn-danger annoty-history-delete-btn" title="Delete from history">
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
          <div class="annoty-history-meta">
            <span>${entry.annotationCount} element${entry.annotationCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      `;

      itemEl.querySelector('.annoty-copy-again-btn')!.addEventListener('click', () => {
        this.copyTextToClipboard(entry.markdown);
      });

      itemEl.querySelector('.annoty-history-delete-btn')!.addEventListener('click', async () => {
        if (confirm('Delete this history entry?')) {
          await this.historyStore.delete(entry.id);
        }
      });

      this.listEl.appendChild(itemEl);
    });
  }

  private renderEmptyState(text: string): void {
    this.listEl.innerHTML = `
      <div class="annoty-empty-state">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <p class="annoty-empty-text" style="font-size: 13px; line-height: 1.4;">${this.escapeHtml(text)}</p>
      </div>
    `;
  }

  private async generatePromptAction(): Promise<void> {
    const activeGroup = await this.groupStore.getActive();
    if (!activeGroup) return;

    const annotations = await this.store.list();
    const filtered = annotations.filter((a) => a.groupId === activeGroup.id);

    if (filtered.length === 0) return;
    this.activeGroupAnnotations = filtered;

    const markdown = compileToMarkdown(filtered);

    // Save automatically to history
    const categoriesSet = new Set<string>();
    filtered.forEach((a) => {
      detectCategories(a.instruction).forEach((c) => categoriesSet.add(c));
    });

    const entry: PromptHistoryEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `hist_${Date.now()}`,
      groupName: activeGroup.name,
      generatedAt: new Date().toISOString(),
      markdown: markdown,
      annotationCount: filtered.length,
      categories: Array.from(categoriesSet),
    };

    await this.historyStore.add(entry);

    // Show preview panel and render content in selected format
    this.updatePreviewContent();
    this.previewPanelEl.style.display = 'flex';
  }

  private updatePreviewContent(): void {
    let content = '';
    if (this.previewFormat === 'markdown') {
      content = compileToMarkdown(this.activeGroupAnnotations);
    } else if (this.previewFormat === 'json') {
      content = compileToJSON(this.activeGroupAnnotations);
    } else {
      content = compileToPlainText(this.activeGroupAnnotations);
    }
    this.previewAreaEl.textContent = content;
  }

  private handleDownload(): void {
    const content = this.previewAreaEl.textContent || '';
    if (!content) return;

    const dateStr = new Date().toISOString().slice(0, 10);
    if (this.previewFormat === 'markdown') {
      downloadFile(content, `annoty-context-${dateStr}.md`, 'text/markdown');
    } else if (this.previewFormat === 'json') {
      downloadFile(content, `annoty-context-${dateStr}.json`, 'application/json');
    } else {
      downloadFile(content, `annoty-context-${dateStr}.txt`, 'text/plain');
    }
  }

  private hidePreviewPanel(): void {
    this.previewPanelEl.style.display = 'none';
  }

  private copyToClipboard(): void {
    const text = this.previewAreaEl.textContent || '';
    this.copyTextToClipboard(text);
  }

  private copyTextToClipboard(text: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => {
        this.toastEl.classList.add('show');
        setTimeout(() => {
          this.toastEl.classList.remove('show');
        }, 2000);
      },
      (err) => {
        console.error('[Annoty] Copy failed:', err);
        alert('Failed to copy to clipboard. Please copy manually.');
      }
    );
  }

  private async handleClearAll(): Promise<void> {
    if (
      confirm(
        'Clear all annotations? This will wipe all current annotations and groups, but your generated prompts in History remain safe.'
      )
    ) {
      await this.groupStore.clear();
      this.hidePreviewPanel();
      this.groupMode = 'normal';
      this.render();
    }
  }

  private getRelativeTimeString(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${diffDay}d ago`;
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
