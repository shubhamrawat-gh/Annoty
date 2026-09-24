export interface PaletteCommand {
  id: string;
  title: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

export class CommandPalette {
  private shadowRoot: ShadowRoot;
  private modal: HTMLElement;
  private input: HTMLInputElement;
  private listEl: HTMLElement;
  private commands: PaletteCommand[] = [];
  private filteredCommands: PaletteCommand[] = [];
  private selectedIndex: number = 0;
  private isOpen: boolean = false;

  constructor(shadowRoot: ShadowRoot, commands: PaletteCommand[]) {
    this.shadowRoot = shadowRoot;
    this.commands = commands;

    this.modal = document.createElement('div');
    this.modal.className = 'annoty-palette-backdrop';
    this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(2px);
      z-index: 2147483647;
      display: none;
      align-items: flex-start;
      justify-content: center;
      padding-top: 15vh;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    const container = document.createElement('div');
    container.className = 'annoty-palette-box';
    container.style.cssText = `
      width: 520px;
      max-width: 90vw;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Type a command or search actions... (ESC to close)';
    this.input.style.cssText = `
      width: 100%;
      box-sizing: border-box;
      background: #0d1117;
      border: none;
      border-bottom: 1px solid #30363d;
      padding: 14px 18px;
      font-size: 14px;
      color: #c9d1d9;
      outline: none;
      font-family: inherit;
    `;

    this.listEl = document.createElement('div');
    this.listEl.style.cssText = `
      max-height: 320px;
      overflow-y: auto;
      padding: 6px 0;
    `;

    container.appendChild(this.input);
    container.appendChild(this.listEl);
    this.modal.appendChild(container);
    this.shadowRoot.appendChild(this.modal);

    this.initEvents();
  }

  private initEvents() {
    this.input.addEventListener('input', () => {
      this.filter(this.input.value);
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % Math.max(1, this.filteredCommands.length);
        this.renderList();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % Math.max(1, this.filteredCommands.length);
        this.renderList();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = this.filteredCommands[this.selectedIndex];
        if (selected) {
          this.close();
          selected.action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  public open() {
    this.isOpen = true;
    this.modal.style.display = 'flex';
    this.input.value = '';
    this.selectedIndex = 0;
    this.filter('');
    setTimeout(() => this.input.focus(), 50);
  }

  public close() {
    this.isOpen = false;
    this.modal.style.display = 'none';
  }

  public toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public updateCommands(commands: PaletteCommand[]) {
    this.commands = commands;
    if (this.isOpen) {
      this.filter(this.input.value);
    }
  }

  private filter(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredCommands = [...this.commands];
    } else {
      this.filteredCommands = this.commands.filter(
        c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
      );
    }
    this.selectedIndex = 0;
    this.renderList();
  }

  private renderList() {
    this.listEl.innerHTML = '';
    if (this.filteredCommands.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding: 16px 20px; font-size: 13px; color: #8b949e; text-align: center;';
      empty.textContent = 'No matching commands found';
      this.listEl.appendChild(empty);
      return;
    }

    this.filteredCommands.forEach((cmd, idx) => {
      const item = document.createElement('div');
      const isSelected = idx === this.selectedIndex;
      item.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 18px;
        cursor: pointer;
        background: ${isSelected ? '#1f6feb22' : 'transparent'};
        border-left: 3px solid ${isSelected ? '#58a6ff' : 'transparent'};
        transition: background 0.1s ease;
      `;

      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '8px';

      const tag = document.createElement('span');
      tag.style.cssText = `
        font-size: 10px;
        text-transform: uppercase;
        color: #8b949e;
        font-family: ui-monospace, SFMono-Regular, monospace;
        letter-spacing: 0.5px;
      `;
      tag.textContent = cmd.category;

      const title = document.createElement('span');
      title.style.cssText = `
        font-size: 13px;
        color: ${isSelected ? '#58a6ff' : '#c9d1d9'};
        font-weight: 500;
      `;
      title.textContent = cmd.title;

      left.appendChild(tag);
      left.appendChild(title);

      item.appendChild(left);

      if (cmd.shortcut) {
        const kbd = document.createElement('kbd');
        kbd.style.cssText = `
          font-size: 11px;
          background: #21262d;
          border: 1px solid #30363d;
          border-radius: 4px;
          padding: 2px 6px;
          color: #8b949e;
          font-family: ui-monospace, SFMono-Regular, monospace;
        `;
        kbd.textContent = cmd.shortcut;
        item.appendChild(kbd);
      }

      item.addEventListener('mouseenter', () => {
        this.selectedIndex = idx;
        this.renderList();
      });

      item.addEventListener('click', () => {
        this.close();
        cmd.action();
      });

      this.listEl.appendChild(item);
    });
  }
}
