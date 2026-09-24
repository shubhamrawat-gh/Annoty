import { Annotation } from '../types';

export class PinManager {
  private container: HTMLElement;
  private shadowRoot: ShadowRoot;
  private pins: Map<string, HTMLElement> = new Map();
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
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
    window.addEventListener('scroll', update, { passive: true });
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
    this.annotations = annotations;
    this.renderPins();
  }

  public toggleVisibility(force?: boolean): boolean {
    this.isVisible = force !== undefined ? force : !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
    if (this.isVisible) {
      this.repositionAll();
    }
    return this.isVisible;
  }

  public renderPins() {
    this.container.innerHTML = '';
    this.pins.clear();

    if (!this.isVisible) return;

    this.annotations.forEach((anno, index) => {
      const pinNumber = anno.pinNumber || index + 1;
      const el = document.querySelector(anno.selector) as HTMLElement | null;

      const pin = document.createElement('div');
      pin.className = `annoty-pin annoty-pin-state-${anno.state || 'pending'} annoty-pin-sev-${anno.severity || 'medium'}`;
      pin.setAttribute('data-annoty-pin-id', anno.id);
      pin.style.cssText = `
        position: absolute;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #1f6feb;
        color: #ffffff;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.9);
        pointer-events: auto;
        cursor: pointer;
        user-select: none;
        transition: transform 0.15s ease, background-color 0.15s ease;
        transform: translate(-50%, -50%);
      `;

      if (anno.severity === 'critical') {
        pin.style.background = '#da3633';
      } else if (anno.severity === 'high') {
        pin.style.background = '#d29922';
      } else if (anno.state === 'resolved') {
        pin.style.background = '#238636';
        pin.style.opacity = '0.75';
      }

      pin.textContent = String(pinNumber);

      // Tooltip preview
      pin.title = `[#${pinNumber}] ${anno.category ? `(${anno.category.toUpperCase()}) ` : ''}${anno.instruction}\nClick to view`;

      pin.addEventListener('mouseenter', () => {
        pin.style.transform = 'translate(-50%, -50%) scale(1.25)';
        if (el) {
          el.style.outline = '2px dashed #58a6ff';
          el.style.outlineOffset = '2px';
        }
      });

      pin.addEventListener('mouseleave', () => {
        pin.style.transform = 'translate(-50%, -50%) scale(1)';
        if (el) {
          el.style.outline = '';
          el.style.outlineOffset = '';
        }
      });

      pin.addEventListener('click', (e) => {
        e.stopPropagation();
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
        // Position pin at top-right corner of target element
        const top = rect.top + window.scrollY;
        const left = rect.right + window.scrollX;

        pin.style.top = `${top}px`;
        pin.style.left = `${left}px`;
        pin.style.display = 'flex';
      } else {
        // Fallback to recorded layout coordinates if DOM node is missing
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
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.container.remove();
  }
}
