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
  private groupBarEl!: HTMLDivElement;
  private groupDrawerEl!: HTMLDivElement;
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
  private isGroupDrawerOpen = false;
  private editingGroupId: string | null = null;
  private confirmDeleteGroupId: string | null = null;
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
          <span class="annoty-header-badge"><span class="annoty-status-dot"></span>Local</span>
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

      <!-- Group Selection Bar -->
      <div class="annoty-group-bar">
        <button class="annoty-group-pill-btn" title="Click to view & organize groups">
          <span class="annoty-group-pill-icon">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </span>
          <span class="annoty-group-active-name">Default</span>
          <span class="annoty-group-badge-count">0</span>
          <svg class="annoty-group-chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <button class="annoty-icon-btn annoty-group-quick-add-btn" title="Create New Group">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <!-- Collapsible Group Organizer Panel -->
      <div class="annoty-group-drawer" style="display: none;">
        <div class="annoty-group-drawer-inner">
          <div class="annoty-group-create-row">
            <input type="text" class="annoty-group-create-input" placeholder="New group name…" />
            <button class="annoty-btn annoty-btn-primary annoty-group-create-submit">+ Add</button>
          </div>
          <div class="annoty-group-drawer-list"></div>
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
    this.groupBarEl = this.sidebarEl.querySelector('.annoty-group-bar')!;
    this.groupDrawerEl = this.sidebarEl.querySelector('.annoty-group-drawer')!;
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
        this.isGroupDrawerOpen = false;
        this.render();
      });
    });

    // Group drawer toggle
    const groupPillBtn = this.sidebarEl.querySelector('.annoty-group-pill-btn') as HTMLButtonElement;
    const groupQuickAddBtn = this.sidebarEl.querySelector('.annoty-group-quick-add-btn') as HTMLButtonElement;
    const createInput = this.sidebarEl.querySelector('.annoty-group-create-input') as HTMLInputElement;
    const createSubmit = this.sidebarEl.querySelector('.annoty-group-create-submit') as HTMLButtonElement;

    groupPillBtn.addEventListener('click', () => {
      this.isGroupDrawerOpen = !this.isGroupDrawerOpen;
      this.renderGroupSection();
    });

    groupQuickAddBtn.addEventListener('click', () => {
      this.isGroupDrawerOpen = true;
      this.renderGroupSection();
      setTimeout(() => createInput.focus(), 60);
    });

    const submitNewGroup = async () => {
      const val = createInput.value.trim();
      if (!val) return;
      try {
        const groups = await this.groupStore.list();
        if (groups.some((g) => g.name.toLowerCase() === val.toLowerCase())) {
          createInput.style.borderColor = '#dc2626';
          return;
        }
        createInput.style.borderColor = '';
        const newGroup = await this.groupStore.create(val);
        await this.groupStore.setActive(newGroup.id);
        createInput.value = '';
        this.isGroupDrawerOpen = false;
        this.render();
      } catch (err: any) {
        console.error('[Annoty] Failed to create group:', err);
      }
    };

    createSubmit.addEventListener('click', submitNewGroup);
    createInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitNewGroup();
      }
      if (e.key === 'Escape') {
        this.isGroupDrawerOpen = false;
        this.renderGroupSection();
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
      // Ignored
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
        this.groupBarEl.style.display = 'flex';
        this.sidebarEl.querySelector('.annoty-sidebar-footer')!.setAttribute('style', 'display: flex;');

        await this.renderGroupSection();
        await this.renderAnnotationsList();
      } else {
        this.groupBarEl.style.display = 'none';
        this.groupDrawerEl.style.display = 'none';
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

  private async renderGroupSection(): Promise<void> {
    const activeNameEl = this.sidebarEl.querySelector('.annoty-group-active-name') as HTMLElement;
    const badgeCountEl = this.sidebarEl.querySelector('.annoty-group-badge-count') as HTMLElement;
    const chevronEl = this.sidebarEl.querySelector('.annoty-group-chevron') as HTMLElement;
    const listEl = this.sidebarEl.querySelector('.annoty-group-drawer-list') as HTMLElement;

    const groups = await this.groupStore.list();
    const active = await this.groupStore.getActive();
    const annotations = await this.store.list();

    const activeCount = active ? annotations.filter((a) => a.groupId === active.id).length : 0;
    activeNameEl.textContent = active ? active.name : 'Select Group';
    badgeCountEl.textContent = activeCount.toString();

    if (this.isGroupDrawerOpen) {
      this.groupDrawerEl.style.display = 'block';
      chevronEl.classList.add('is-open');
    } else {
      this.groupDrawerEl.style.display = 'none';
      chevronEl.classList.remove('is-open');
      this.editingGroupId = null;
      this.confirmDeleteGroupId = null;
      return;
    }

    listEl.innerHTML = '';

    groups.forEach((g) => {
      const isSelected = active ? g.id === active.id : false;
      const count = annotations.filter((a) => a.groupId === g.id).length;
      const itemEl = document.createElement('div');
      itemEl.className = `annoty-group-drawer-item ${isSelected ? 'is-active' : ''}`;

      if (this.editingGroupId === g.id) {
        // Inline Rename row
        itemEl.innerHTML = `
          <input type="text" class="annoty-group-rename-input" value="${this.escapeHtml(g.name)}" />
          <div class="annoty-group-item-actions">
            <button class="annoty-icon-btn annoty-group-rename-save" title="Save">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <button class="annoty-icon-btn annoty-group-rename-cancel" title="Cancel">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        `;

        const renameInput = itemEl.querySelector('.annoty-group-rename-input') as HTMLInputElement;
        const saveRename = async () => {
          const val = renameInput.value.trim();
          if (val && val !== g.name) {
            await this.groupStore.rename(g.id, val);
          }
          this.editingGroupId = null;
          this.renderGroupSection();
        };

        itemEl.querySelector('.annoty-group-rename-save')?.addEventListener('click', (e) => {
          e.stopPropagation();
          saveRename();
        });
        itemEl.querySelector('.annoty-group-rename-cancel')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.editingGroupId = null;
          this.renderGroupSection();
        });
        renameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            saveRename();
          }
          if (e.key === 'Escape') {
            this.editingGroupId = null;
            this.renderGroupSection();
          }
        });
        setTimeout(() => {
          renameInput.focus();
          renameInput.select();
        }, 30);
      } else {
        // Normal group row
        let deleteActionHtml = '';
        if (this.confirmDeleteGroupId === g.id) {
          deleteActionHtml = `
            <button class="annoty-btn-confirm-delete" title="Confirm deletion">Delete?</button>
            <button class="annoty-icon-btn annoty-cancel-delete" title="Cancel">✕</button>
          `;
        } else {
          const deleteDisabled = groups.length <= 1;
          deleteActionHtml = `
            <button class="annoty-icon-btn annoty-row-rename-btn" title="Rename Group">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path></svg>
            </button>
            ${
              !deleteDisabled
                ? `
              <button class="annoty-icon-btn annoty-icon-btn-danger annoty-row-delete-btn" title="Delete Group">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            `
                : ''
            }
          `;
        }

        itemEl.innerHTML = `
          <div class="annoty-group-item-left">
            <span class="annoty-group-item-radio">${isSelected ? '●' : '○'}</span>
            <span class="annoty-group-item-name">${this.escapeHtml(g.name)}</span>
            <span class="annoty-group-item-count">${count}</span>
          </div>
          <div class="annoty-group-item-actions">
            ${deleteActionHtml}
          </div>
        `;

        // Click row to activate
        itemEl.querySelector('.annoty-group-item-left')?.addEventListener('click', async () => {
          await this.groupStore.setActive(g.id);
          this.isGroupDrawerOpen = false;
          this.render();
        });

        // Rename button
        itemEl.querySelector('.annoty-row-rename-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.editingGroupId = g.id;
          this.confirmDeleteGroupId = null;
          this.renderGroupSection();
        });

        // Delete button
        itemEl.querySelector('.annoty-row-delete-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.confirmDeleteGroupId = g.id;
          this.renderGroupSection();
        });

        // Confirm delete button
        itemEl.querySelector('.annoty-btn-confirm-delete')?.addEventListener('click', async (e) => {
          e.stopPropagation();
          await this.groupStore.delete(g.id);
          this.confirmDeleteGroupId = null;
          this.render();
        });

        // Cancel delete button
        itemEl.querySelector('.annoty-cancel-delete')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.confirmDeleteGroupId = null;
          this.renderGroupSection();
        });
      }

      listEl.appendChild(itemEl);
    });
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
          downloadScreenshot(anno.screenshotBase64, `annoty-element-${anno.pinNumber || 'snap'}.png`);
        }
      });

      // Edit annotation handler
      const editBtn = itemEl.querySelector('.annoty-edit-btn');
      editBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onEditAnnotation(anno);
      });

      // Delete annotation handler
      const deleteBtn = itemEl.querySelector('.annoty-delete-btn');
      deleteBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.store.delete(anno.id);
      });

      this.listEl.appendChild(itemEl);
    });
  }

  private async renderHistoryList(): Promise<void> {
    const history = await this.historyStore.list();
    this.listEl.innerHTML = '';

    if (history.length === 0) {
      this.renderEmptyState('No prompt history yet. Generate a prompt to preserve a snapshot session here.');
      return;
    }

    history.forEach((entry) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'annoty-item annoty-history-item';

      const timeFormatted = this.getRelativeTimeString(entry.generatedAt);

      itemEl.innerHTML = `
        <div class="annoty-history-item-header">
          <div class="annoty-history-item-top">
            <div class="annoty-history-title-block">
              <span class="annoty-history-group-name">${this.escapeHtml(entry.groupName)}</span>
              <span class="annoty-history-time">${timeFormatted}</span>
            </div>
            <div class="annoty-history-actions">
              <button class="annoty-icon-btn annoty-history-copy-btn" title="Copy Snapshot Prompt">
                <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>
          <div class="annoty-history-meta">
            <span>${entry.annotationCount} annotations</span>
          </div>
        </div>
      `;

      itemEl.querySelector('.annoty-history-copy-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.copyTextToClipboard(entry.markdown);
      });

      itemEl.addEventListener('click', () => {
        this.previewAreaEl.textContent = entry.markdown;
        this.previewPanelEl.style.display = 'flex';
      });

      this.listEl.appendChild(itemEl);
    });
  }

  private renderEmptyState(message: string): void {
    this.listEl.innerHTML = `
      <div class="annoty-empty-state">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <p class="annoty-empty-text">No items found</p>
        <p class="annoty-empty-subtext">${this.escapeHtml(message)}</p>
      </div>
    `;
  }

  private async generatePromptAction(): Promise<void> {
    const activeGroup = await this.groupStore.getActive();
    if (!activeGroup) return;

    const annotations = await this.store.list();
    const filtered = annotations.filter((a) => a.groupId === activeGroup.id);
    if (filtered.length === 0) return;

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
      await this.store.clear();
      await this.groupStore.clear();
      this.hidePreviewPanel();
      this.isGroupDrawerOpen = false;
      await this.render();
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
