import { AnnotationStore } from '../types';

export class ToggleButton {
  private el: HTMLDivElement;
  private badge: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot;
  private store: AnnotationStore;
  private isActive = false; // Selection mode state
  
  private onToggleCallback: (active: boolean) => void;
  private onToggleSidebarCallback: () => void;

  // Dragging state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private elementStartX = 0;
  private elementStartY = 0;
  private totalDragDistance = 0;

  constructor(
    shadowRoot: ShadowRoot,
    store: AnnotationStore,
    onToggle: (active: boolean) => void,
    onToggleSidebar: () => void
  ) {
    this.shadowRoot = shadowRoot;
    this.store = store;
    this.onToggleCallback = onToggle;
    this.onToggleSidebarCallback = onToggleSidebar;

    this.el = document.createElement('div');
    this.el.className = 'annoty-toggle';
    
    this.render();
    this.initPosition();
    this.initDragEvents();
    this.initClickEvents();

    this.shadowRoot.appendChild(this.el);

    // Subscribe to store updates to update the badge count
    this.store.subscribe(() => this.updateBadge());
    this.updateBadge();
  }

  private render(): void {
    // Left button: Picker Toggle
    // Right button: Sidebar Toggle (with badge)
    this.el.innerHTML = `
      <button class="annoty-control-btn annoty-picker-toggle" title="Toggle Selection Mode (Alt+A)">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="22" y1="12" x2="18" y2="12"></line>
          <line x1="6" y1="12" x2="2" y2="12"></line>
          <line x1="12" y1="6" x2="12" y2="2"></line>
          <line x1="12" y1="22" x2="12" y2="18"></line>
        </svg>
      </button>
      <button class="annoty-control-btn annoty-sidebar-toggle" title="Toggle Session Sidebar (Alt+S)">
        <svg viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <div class="annoty-badge" style="display: none;">0</div>
      </button>
    `;
    this.badge = this.el.querySelector('.annoty-badge');
  }

  private initPosition(): void {
    try {
      const savedPos = localStorage.getItem('annoty:toggle-position');
      if (savedPos) {
        const { top, left } = JSON.parse(savedPos);
        this.el.style.top = `${top}px`;
        this.el.style.left = `${left}px`;
        this.el.style.bottom = 'auto';
        this.el.style.right = 'auto';
        return;
      }
    } catch (e) {
      console.warn('[Annoty] Failed to load toggle position:', e);
    }
    
    // Default position
    this.el.style.bottom = '24px';
    this.el.style.right = '24px';
  }

  private initDragEvents(): void {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      
      // If we clicked directly on buttons, let's still handle drag if they start moving,
      // but ensure dragging the whole container is supported.
      this.startDrag(e.clientX, e.clientY);
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      this.moveDrag(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      this.endDrag();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      this.startDrag(touch.clientX, touch.clientY);
      
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const touch = e.touches[0];
      this.moveDrag(touch.clientX, touch.clientY);
    };

    const onTouchEnd = () => {
      this.endDrag();
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    this.el.addEventListener('mousedown', onMouseDown);
    this.el.addEventListener('touchstart', onTouchStart, { passive: true });
  }

  private startDrag(clientX: number, clientY: number): void {
    this.isDragging = true;
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    
    const rect = this.el.getBoundingClientRect();
    this.elementStartX = rect.left;
    this.elementStartY = rect.top;
    
    this.totalDragDistance = 0;
  }

  private moveDrag(clientX: number, clientY: number): void {
    if (!this.isDragging) return;

    const dx = clientX - this.dragStartX;
    const dy = clientY - this.dragStartY;
    this.totalDragDistance = Math.sqrt(dx * dx + dy * dy);

    let newX = this.elementStartX + dx;
    let newY = this.elementStartY + dy;

    const rect = this.el.getBoundingClientRect();
    const margin = 10;
    
    newX = Math.max(margin, Math.min(window.innerWidth - rect.width - margin, newX));
    newY = Math.max(margin, Math.min(window.innerHeight - rect.height - margin, newY));

    this.el.style.left = `${newX}px`;
    this.el.style.top = `${newY}px`;
    this.el.style.bottom = 'auto';
    this.el.style.right = 'auto';
  }

  private endDrag(): void {
    this.isDragging = false;
    
    const rect = this.el.getBoundingClientRect();
    try {
      localStorage.setItem(
        'annoty:toggle-position',
        JSON.stringify({ top: rect.top, left: rect.left })
      );
    } catch (e) {
      // Ignored
    }
  }

  private initClickEvents(): void {
    const pickerBtn = this.el.querySelector('.annoty-picker-toggle')!;
    const sidebarBtn = this.el.querySelector('.annoty-sidebar-toggle')!;

    pickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.totalDragDistance > 5) return;
      this.toggleActiveState();
    });

    sidebarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.totalDragDistance > 5) return;
      this.onToggleSidebarCallback();
    });
  }

  public toggleActiveState(): void {
    this.isActive = !this.isActive;
    const pickerBtn = this.el.querySelector('.annoty-picker-toggle')!;
    if (this.isActive) {
      pickerBtn.classList.add('active');
    } else {
      pickerBtn.classList.remove('active');
    }
    this.onToggleCallback(this.isActive);
  }

  public setActive(active: boolean): void {
    if (this.isActive === active) return;
    this.isActive = active;
    const pickerBtn = this.el.querySelector('.annoty-picker-toggle')!;
    if (this.isActive) {
      pickerBtn.classList.add('active');
    } else {
      pickerBtn.classList.remove('active');
    }
  }

  private async updateBadge(): Promise<void> {
    if (!this.badge) return;
    
    // In our model, show the number of annotations in the active group (or total annotations? "count of current annotations in the store" makes sense as total session annotations).
    const list = await this.store.list();
    const count = list.length;
    
    if (count > 0) {
      this.badge.textContent = count.toString();
      this.badge.style.display = 'flex';
    } else {
      this.badge.style.display = 'none';
    }
  }
}
