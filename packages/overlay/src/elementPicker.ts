import { mapElementToSource } from './sourceMapper';
import { SourceMappingResult } from './types';

export class ElementPicker {
  private shadowRoot: ShadowRoot;
  private highlightEl: HTMLDivElement;
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
    this.shadowRoot.appendChild(this.highlightEl);

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
  }

  private isAnnotyElement(el: HTMLElement): boolean {
    // If element is the shadow host or inside it
    if (el.id === 'annoty-host') return true;
    
    // If the event target has been retargeted to host
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
    
    // Immediately clear highlight
    this.highlightEl.style.display = 'none';
    this.currentHovered = null;
  }

  private handleScrollResize(): void {
    if (this.currentHovered && this.active) {
      this.updateHighlightPosition(this.currentHovered);
    }
  }

  private updateHighlightPosition(el: HTMLElement): void {
    try {
      const rect = el.getBoundingClientRect();
      
      // Position the highlight overlay
      this.highlightEl.style.width = `${rect.width}px`;
      this.highlightEl.style.height = `${rect.height}px`;
      this.highlightEl.style.top = `${rect.top}px`;
      this.highlightEl.style.left = `${rect.left}px`;
      this.highlightEl.style.display = 'block';
    } catch (err) {
      this.highlightEl.style.display = 'none';
    }
  }
}
