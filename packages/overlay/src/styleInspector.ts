import {
  ElementComputedStyles,
  ElementLayout,
  ViewportInfo,
  DOMNodeBreadcrumb,
  UIDiagnostic,
} from './types';

/**
 * Extracts key computed styles grouped into Box, Typography, Layout, Appearance, and Behavior.
 */
export function inspectComputedStyles(el: HTMLElement): ElementComputedStyles {
  const s = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  return {
    box: {
      width: `${Math.round(rect.width)}px`,
      height: `${Math.round(rect.height)}px`,
      margin: `${s.marginTop} ${s.marginRight} ${s.marginBottom} ${s.marginLeft}`,
      padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
      borderWidth: `${s.borderTopWidth} ${s.borderRightWidth} ${s.borderBottomWidth} ${s.borderLeftWidth}`,
    },
    typography: {
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      textAlign: s.textAlign,
    },
    layout: {
      display: s.display,
      position: s.position,
      flexDirection: s.flexDirection,
      justifyContent: s.justifyContent,
      alignItems: s.alignItems,
      gap: s.gap || s.rowGap || 'normal',
      gridTemplateColumns: s.gridTemplateColumns,
    },
    appearance: {
      color: s.color,
      backgroundColor: s.backgroundColor,
      borderRadius: s.borderRadius,
      boxShadow: s.boxShadow,
      opacity: s.opacity,
      border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
    },
    behavior: {
      overflow: s.overflow,
      cursor: s.cursor,
      pointerEvents: s.pointerEvents,
      zIndex: s.zIndex,
    },
  };
}

/**
 * Returns exact element layout dimensions and document coordinates.
 */
export function getElementLayout(el: HTMLElement): ElementLayout {
  const rect = el.getBoundingClientRect();
  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    x: Math.round(rect.left + window.scrollX),
    y: Math.round(rect.top + window.scrollY),
  };
}

/**
 * Returns current viewport dimensions and standard responsive preset classification.
 */
export function getViewportInfo(): ViewportInfo {
  const w = window.innerWidth;
  const h = window.innerHeight;

  let preset: ViewportInfo['preset'] = 'custom';
  if (w <= 480) {
    preset = 'mobile-375';
  } else if (w <= 1024) {
    preset = 'tablet-768';
  } else if (w <= 1600) {
    preset = 'desktop-1440';
  }

  return { width: w, height: h, preset };
}

/**
 * Walks up the DOM tree from the target element to body, constructing a clickable breadcrumb chain.
 */
export function getDOMBreadcrumbs(el: HTMLElement): DOMNodeBreadcrumb[] {
  const chain: DOMNodeBreadcrumb[] = [];
  let current: HTMLElement | null = el;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    if (current.tagName.toLowerCase() === 'html') break;

    const classes = current.className && typeof current.className === 'string'
      ? current.className.trim().split(/\s+/).filter(c => c && !c.startsWith('annoty-'))
      : [];

    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
    } else if (classes.length > 0) {
      selector += `.${classes.slice(0, 2).join('.')}`;
    }

    chain.unshift({
      tagName: current.tagName.toLowerCase(),
      selector,
      id: current.id || undefined,
      classes,
      isTarget: current === el,
    });

    if (current.tagName.toLowerCase() === 'body') break;
    current = current.parentElement;
  }

  return chain;
}

/**
 * Parses RGBA string into [r, g, b, a] numbers.
 */
function parseRgba(colorStr: string): [number, number, number, number] {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      match[4] !== undefined ? parseFloat(match[4]) : 1,
    ];
  }
  return [0, 0, 0, 1];
}

/**
 * Computes luminance for WCAG contrast ratio calculations.
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Walks up the tree to find an opaque background color.
 */
function getEffectiveBackgroundColor(el: HTMLElement): [number, number, number] {
  let current: HTMLElement | null = el;
  while (current) {
    const bg = window.getComputedStyle(current).backgroundColor;
    const [r, g, b, a] = parseRgba(bg);
    if (a > 0.1) {
      return [r, g, b];
    }
    current = current.parentElement;
  }
  return [255, 255, 255]; // default white background
}

/**
 * Deterministic UI diagnostics:
 * - Horizontal overflow
 * - WCAG contrast ratio calculation
 * - Offscreen positioning
 * - Hidden visibility
 */
export function runUIDiagnostics(el: HTMLElement): UIDiagnostic[] {
  const diagnostics: UIDiagnostic[] = [];
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);

  // 1. Horizontal overflow
  if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && style.overflowX !== 'hidden') {
    diagnostics.push({
      type: 'overflow',
      level: 'warning',
      message: `Horizontal content overflow: content is ${el.scrollWidth}px inside a ${el.clientWidth}px container.`,
      details: 'May cause unexpected horizontal scrolling on mobile.',
    });
  }

  // 2. Offscreen check
  if (
    rect.width > 0 && rect.height > 0 &&
    (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight)
  ) {
    diagnostics.push({
      type: 'offscreen',
      level: 'info',
      message: 'Element is positioned outside the current visible viewport window.',
    });
  }

  // 3. WCAG contrast check (only for elements with text)
  const textContent = el.textContent?.trim() || '';
  if (textContent.length > 0 && el.children.length === 0) {
    const textColor = parseRgba(style.color);
    const bgColor = getEffectiveBackgroundColor(el);
    const textLum = getRelativeLuminance(textColor[0], textColor[1], textColor[2]);
    const bgLum = getRelativeLuminance(bgColor[0], bgColor[1], bgColor[2]);

    const l1 = Math.max(textLum, bgLum);
    const l2 = Math.min(textLum, bgLum);
    const contrastRatio = (l1 + 0.05) / (l2 + 0.05);

    const isLargeText = parseFloat(style.fontSize) >= 18 || (parseFloat(style.fontSize) >= 14 && parseInt(style.fontWeight, 10) >= 700);
    const minRatio = isLargeText ? 3.0 : 4.5;

    if (contrastRatio < minRatio) {
      diagnostics.push({
        type: 'contrast',
        level: 'warning',
        message: `Contrast ratio is ${contrastRatio.toFixed(2)}:1 (WCAG recommendation is ${minRatio}:1).`,
        details: `Foreground ${style.color} on background rgb(${bgColor.join(', ')}).`,
      });
    }
  }

  // 4. Flex/Grid child constraint check
  const parent = el.parentElement;
  if (parent) {
    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.display === 'flex' && parentStyle.flexWrap === 'nowrap' && rect.width > parent.clientWidth) {
      diagnostics.push({
        type: 'layout',
        level: 'warning',
        message: `Flex child width (${Math.round(rect.width)}px) exceeds flex container (${parent.clientWidth}px) without wrap.`,
      });
    }
  }

  return diagnostics;
}
