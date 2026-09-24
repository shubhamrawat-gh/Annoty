import { Annotation } from '../types';

export class PinManager {
  private container: HTMLElement;
  private shadowRoot: ShadowRoot;
  private pins: Map<string, HTMLElement> = new Map();
  private highlightedElements: Set<HTMLElement> = new Set();
  private annotations: Annotation[] = [];
  private isVisible: boolean = true;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private onPinClick?: (annotation: Annotation) => void;

  constructor(shadowRoot: ShadowRoot, onPinClick?: (annotation: Annotation) => void) {
    this.shadowRoot = shadowRoot;
    this.onPinClick = onPinClick;

    this.container = document.createElement('div');
    this.container.className = 'annoty-pins-layer';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 2147483645;
    `;
    this.shadowRoot.appendChild(this.container);

    this.initObservers();
  }

  private initObservers() {
    // Window scroll and resize
    const update = () => {
      if (this.isVisible) {
        requestAnimationFrame(() => this.repositionAll());
      }
    };
    window.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update, { passive: true });

    // ResizeObserver for element resizing
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => update());
    }

    // MutationObserver for DOM alterations
    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => update());
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }
  }

  public setAnnotations(annotations: Annotation[]) {
    this.clearOutlines();
    this.annotations = annotations;
    this.renderPins();
  }

  public clearOutlines() {
    this.highlightedElements.forEach((el) => {
      if (el && el.style) {
        el.style.outline = '';
        el.style.outlineOffset = '';
      }
    });
    this.highlightedElements.clear();
  }

  public toggleVisibility(force?: boolean): boolean {
    this.isVisible = force !== undefined ? force : !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
    if (this.isVisible) {
      this.repositionAll();
    } else {
      this.clearOutlines();
    }
    return this.isVisible;
  }

  public renderPins() {
    this.clearOutlines();
    this.container.innerHTML = '';
    this.pins.clear();

    if (!this.isVisible) return;

    this.annotations.forEach((anno, index) => {
      const pinNumber = anno.pinNumber || index + 1;
      const el = document.querySelector(anno.selector) as HTMLElement | null;

      const pin = document.createElement('div');
      const state = anno.state || 'pending';
      const severity = anno.severity || 'medium';
      pin.className = `annoty-pin annoty-pin-state-${state} annoty-pin-sev-${severity}`;
      pin.setAttribute('data-annoty-pin-id', anno.id);
      pin.setAttribute('data-pin-num', String(pinNumber));

      pin.innerHTML = `
        <span class="annoty-pin-num">${pinNumber}</span>
        <span class="annoty-pin-pulse"></span>
      `;

      // Tooltip preview
      pin.title = `[#${pinNumber}] ${anno.category ? `(${anno.category.toUpperCase()}) ` : ''}${anno.instruction}\nClick to view/edit`;

      pin.addEventListener('mouseenter', () => {
        pin.classList.add('annoty-pin-hover');
        if (el) {
          el.style.outline = '2px dashed #1c1c1c';
          el.style.outlineOffset = '2px';
          this.highlightedElements.add(el);
        }
      });

      pin.addEventListener('mouseleave', () => {
        pin.classList.remove('annoty-pin-hover');
        if (el) {
          el.style.outline = '';
          el.style.outlineOffset = '';
          this.highlightedElements.delete(el);
        }
      });

      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearOutlines();
        if (this.onPinClick) {
          this.onPinClick(anno);
        }
      });

      this.container.appendChild(pin);
      this.pins.set(anno.id, pin);

      if (el && this.resizeObserver) {
        this.resizeObserver.observe(el);
      }
    });

    this.repositionAll();
  }

  public repositionAll() {
    this.annotations.forEach((anno) => {
      const pin = this.pins.get(anno.id);
      if (!pin) return;

      const el = document.querySelector(anno.selector) as HTMLElement | null;
      if (el && el.isConnected) {
        const rect = el.getBoundingClientRect();

        // Check if element is completely off-screen
        const isOffscreen =
          rect.bottom < 0 ||
          rect.top > window.innerHeight ||
          rect.right < 0 ||
          rect.left > window.innerWidth;

        if (isOffscreen) {
          pin.style.display = 'none';
          return;
        }

        // Pin attaches to top-right corner of element (fixed viewport coordinates)
        const top = Math.round(rect.top);
        const left = Math.round(rect.right);

        pin.style.top = `${top}px`;
        pin.style.left = `${left}px`;
        pin.style.display = 'flex';
      } else {
        // Fallback to recorded layout coordinates if DOM node is missing or unmounted
        if (anno.layout) {
          pin.style.top = `${anno.layout.y}px`;
          pin.style.left = `${anno.layout.x + anno.layout.width}px`;
          pin.style.display = 'flex';
        } else {
          pin.style.display = 'none';
        }
      }
    });
  }

  public destroy() {
    this.clearOutlines();
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.container.remove();
  }
}
