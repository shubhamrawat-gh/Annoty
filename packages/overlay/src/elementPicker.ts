import { mapElementToSource } from './sourceMapper';
import { SourceMappingResult } from './types';

export class ElementPicker {
  private shadowRoot: ShadowRoot;
  private highlightEl: HTMLDivElement;
  private tooltipEl: HTMLDivElement;
  private active = false;
  private onElementSelected: (el: HTMLElement, result: SourceMappingResult) => void;
  private currentHovered: HTMLElement | null = null;

  constructor(
    shadowRoot: ShadowRoot,
    onElementSelected: (el: HTMLElement, result: SourceMappingResult) => void
  ) {
    this.shadowRoot = shadowRoot;
    this.onElementSelected = onElementSelected;

    // Create the highlight overlay inside our Shadow DOM
    this.highlightEl = document.createElement('div');
    this.highlightEl.className = 'annoty-highlight';
    this.highlightEl.style.display = 'none';

    // Corner brackets inside highlight
    this.highlightEl.innerHTML = `
      <div class="annoty-corner-tl"></div>
      <div class="annoty-corner-tr"></div>
      <div class="annoty-corner-bl"></div>
      <div class="annoty-corner-br"></div>
    `;
    this.shadowRoot.appendChild(this.highlightEl);

    // Floating inspector badge/tooltip
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'annoty-picker-tooltip';
    this.tooltipEl.style.display = 'none';
    this.shadowRoot.appendChild(this.tooltipEl);

    // Bind event handlers
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleScrollResize = this.handleScrollResize.bind(this);
  }

  public activate(): void {
    if (this.active) return;
    this.active = true;

    // Listen on document level with capture phase for click to block page events
    document.addEventListener('mouseover', this.handleMouseOver, true);
    document.addEventListener('mouseout', this.handleMouseOut, true);
    document.addEventListener('click', this.handleClick, true);

    // Reposition highlight on scroll or window resize
    window.addEventListener('scroll', this.handleScrollResize, true);
    window.addEventListener('resize', this.handleScrollResize, true);
  }

  public deactivate(): void {
    if (!this.active) return;
    this.active = false;

    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('mouseout', this.handleMouseOut, true);
    document.removeEventListener('click', this.handleClick, true);

    window.removeEventListener('scroll', this.handleScrollResize, true);
    window.removeEventListener('resize', this.handleScrollResize, true);

    this.currentHovered = null;
    this.highlightEl.style.display = 'none';
    this.tooltipEl.style.display = 'none';
  }

  private isAnnotyElement(el: HTMLElement): boolean {
    if (el.id === 'annoty-host') return true;

    try {
      const rootNode = el.getRootNode();
      if (rootNode === this.shadowRoot) return true;
    } catch {
      // Fallback
    }

    return false;
  }

  private handleMouseOver(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target || target.nodeType !== Node.ELEMENT_NODE || this.isAnnotyElement(target)) {
      return;
    }

    this.currentHovered = target;
    this.updateHighlightPosition(target);
  }

  private handleMouseOut(e: MouseEvent): void {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !this.currentHovered || !this.currentHovered.contains(relatedTarget)) {
      this.currentHovered = null;
      this.highlightEl.style.display = 'none';
      this.tooltipEl.style.display = 'none';
    }
  }

  private handleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target || target.nodeType !== Node.ELEMENT_NODE || this.isAnnotyElement(target)) {
      return;
    }

    // Crucial: stop propagation and prevent default click actions
    e.preventDefault();
    e.stopPropagation();

    // Map element to its source code
    const result = mapElementToSource(target);

    // Trigger selection callback
    this.onElementSelected(target, result);

    // Immediately clear highlight & tooltip
    this.clearHighlight();
  }

  private handleScrollResize(): void {
    if (this.currentHovered && this.active) {
      this.updateHighlightPosition(this.currentHovered);
    }
  }

  public highlightElement(el: HTMLElement): void {
    this.updateHighlightPosition(el);
  }

  public clearHighlight(): void {
    this.highlightEl.style.display = 'none';
    this.tooltipEl.style.display = 'none';
    this.currentHovered = null;
  }

  private updateHighlightPosition(el: HTMLElement): void {
    try {
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      this.highlightEl.style.width = `${w}px`;
      this.highlightEl.style.height = `${h}px`;
      this.highlightEl.style.top = `${Math.round(rect.top)}px`;
      this.highlightEl.style.left = `${Math.round(rect.left)}px`;
      this.highlightEl.style.display = 'block';

      // Update floating inspector tooltip
      const mapping = mapElementToSource(el);
      const tag = el.tagName.toLowerCase();
      const classes = el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
      const selectorText = `${tag}${classes}`;
      const compText = mapping.componentName ? ` &lt;${mapping.componentName} /&gt;` : '';
      const dimText = `${w} × ${h}`;

      this.tooltipEl.innerHTML = `
        <span class="annoty-tooltip-tag">${selectorText}</span>
        ${compText ? `<span class="annoty-tooltip-comp">${compText}</span>` : ''}
        <span class="annoty-tooltip-dim">${dimText}</span>
        <span class="annoty-tooltip-hint">Click to annotate</span>
      `;

      // Position tooltip above element, or below if near top of viewport
      const tooltipHeight = 26;
      let tooltipTop = Math.round(rect.top) - tooltipHeight - 6;
      if (tooltipTop < 6) {
        tooltipTop = Math.round(rect.bottom) + 6;
      }
      let tooltipLeft = Math.round(rect.left);
      if (tooltipLeft + 260 > window.innerWidth) {
        tooltipLeft = Math.max(6, window.innerWidth - 266);
      }

      this.tooltipEl.style.top = `${tooltipTop}px`;
      this.tooltipEl.style.left = `${tooltipLeft}px`;
      this.tooltipEl.style.display = 'flex';
    } catch {
      this.highlightEl.style.display = 'none';
      this.tooltipEl.style.display = 'none';
    }
  }
}
