import { ElementComputedStyles, ElementLayout } from './types';

export interface StylePropertyDiff {
  category: 'box' | 'typography' | 'layout' | 'appearance' | 'behavior';
  property: string;
  before: string;
  after: string;
  delta?: string;
  changed: boolean;
}

export interface ElementSnapshotBaseline {
  selector: string;
  capturedAt: string;
  layout: ElementLayout;
  styles: ElementComputedStyles;
}

export interface StyleDiffReport {
  selector: string;
  baselineTime: string;
  currentTime: string;
  hasChanges: boolean;
  totalChanges: number;
  diffs: StylePropertyDiff[];
  summary: string[];
}

const STORAGE_KEY = 'annoty:style-baselines';

/**
 * Extracts a numeric value from a CSS pixel string (e.g. "48px" -> 48)
 */
function parsePx(val: string): number | null {
  if (!val) return null;
  const match = val.trim().match(/^(-?\d+(\.\d+)?)px$/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Computes a human-readable delta between two pixel values.
 */
function computePxDelta(beforeStr: string, afterStr: string): string | undefined {
  const b = parsePx(beforeStr);
  const a = parsePx(afterStr);
  if (b !== null && a !== null) {
    const diff = a - b;
    if (diff === 0) return '0px';
    const sign = diff > 0 ? '+' : '';
    return `${sign}${Math.round(diff * 10) / 10}px`;
  }
  return undefined;
}

/**
 * Local Style Diff Engine
 * Captures baselines (Snapshot A) and calculates BEFORE → AFTER style deltas without any AI or cloud backend.
 */
export class StyleDiffEngine {
  private static baselines: Map<string, ElementSnapshotBaseline> = new Map();
  private static loaded = false;

  private static loadFromStorage(): void {
    if (this.loaded) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.entries(parsed).forEach(([key, val]) => {
          this.baselines.set(key, val as ElementSnapshotBaseline);
        });
      }
    } catch (e) {
      console.warn('[Annoty] Failed to load style baselines from localStorage:', e);
    }
    this.loaded = true;
  }

  private static saveToStorage(): void {
    try {
      const obj: Record<string, ElementSnapshotBaseline> = {};
      this.baselines.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn('[Annoty] Failed to save style baselines to localStorage:', e);
    }
  }

  /**
   * Saves Snapshot A (Baseline) for an element by selector or unique key.
   */
  public static saveBaseline(
    selector: string,
    styles: ElementComputedStyles,
    layout: ElementLayout
  ): ElementSnapshotBaseline {
    this.loadFromStorage();
    const baseline: ElementSnapshotBaseline = {
      selector,
      capturedAt: new Date().toISOString(),
      layout,
      styles,
    };
    this.baselines.set(selector, baseline);
    this.saveToStorage();
    return baseline;
  }

  /**
   * Retrieves an existing baseline for an element.
   */
  public static getBaseline(selector: string): ElementSnapshotBaseline | null {
    this.loadFromStorage();
    return this.baselines.get(selector) || null;
  }

  /**
   * Deletes a stored baseline.
   */
  public static clearBaseline(selector: string): void {
    this.loadFromStorage();
    this.baselines.delete(selector);
    this.saveToStorage();
  }

  /**
   * Compares the current element styles & layout against a stored baseline.
   */
  public static compare(
    selector: string,
    currentStyles: ElementComputedStyles,
    currentLayout: ElementLayout
  ): StyleDiffReport | null {
    const baseline = this.getBaseline(selector);
    if (!baseline) return null;

    const diffs: StylePropertyDiff[] = [];
    const summary: string[] = [];

    // 1. Layout & Dimension Comparisons
    const wDelta = computePxDelta(`${baseline.layout.width}px`, `${currentLayout.width}px`);
    if (baseline.layout.width !== currentLayout.width) {
      diffs.push({
        category: 'layout',
        property: 'width',
        before: `${baseline.layout.width}px`,
        after: `${currentLayout.width}px`,
        delta: wDelta,
        changed: true,
      });
      summary.push(`Width: ${baseline.layout.width}px → ${currentLayout.width}px (${wDelta})`);
    }

    const hDelta = computePxDelta(`${baseline.layout.height}px`, `${currentLayout.height}px`);
    if (baseline.layout.height !== currentLayout.height) {
      diffs.push({
        category: 'layout',
        property: 'height',
        before: `${baseline.layout.height}px`,
        after: `${currentLayout.height}px`,
        delta: hDelta,
        changed: true,
      });
      summary.push(`Height: ${baseline.layout.height}px → ${currentLayout.height}px (${hDelta})`);
    }

    if (baseline.layout.x !== currentLayout.x || baseline.layout.y !== currentLayout.y) {
      diffs.push({
        category: 'layout',
        property: 'position (x, y)',
        before: `(${baseline.layout.x}, ${baseline.layout.y})`,
        after: `(${currentLayout.x}, ${currentLayout.y})`,
        changed: true,
      });
      summary.push(`Position: (${baseline.layout.x}, ${baseline.layout.y}) → (${currentLayout.x}, ${currentLayout.y})`);
    }

    // 2. Box Model Comparisons
    const compareField = (
      cat: StylePropertyDiff['category'],
      propName: string,
      beforeVal: string,
      afterVal: string
    ) => {
      const b = (beforeVal || '').trim();
      const a = (afterVal || '').trim();
      if (b !== a) {
        const delta = computePxDelta(b, a);
        diffs.push({
          category: cat,
          property: propName,
          before: b,
          after: a,
          delta,
          changed: true,
        });
        const deltaText = delta ? ` (${delta})` : '';
        summary.push(`${propName}: ${b} → ${a}${deltaText}`);
      }
    };

    // Box
    compareField('box', 'padding', baseline.styles.box.padding, currentStyles.box.padding);
    compareField('box', 'margin', baseline.styles.box.margin, currentStyles.box.margin);
    compareField('box', 'borderWidth', baseline.styles.box.borderWidth, currentStyles.box.borderWidth);

    // Typography
    compareField('typography', 'fontFamily', baseline.styles.typography.fontFamily, currentStyles.typography.fontFamily);
    compareField('typography', 'fontSize', baseline.styles.typography.fontSize, currentStyles.typography.fontSize);
    compareField('typography', 'fontWeight', baseline.styles.typography.fontWeight, currentStyles.typography.fontWeight);
    compareField('typography', 'lineHeight', baseline.styles.typography.lineHeight, currentStyles.typography.lineHeight);
    compareField('typography', 'letterSpacing', baseline.styles.typography.letterSpacing, currentStyles.typography.letterSpacing);
    compareField('typography', 'color', baseline.styles.appearance.color, currentStyles.appearance.color);

    // Layout
    compareField('layout', 'display', baseline.styles.layout.display, currentStyles.layout.display);
    compareField('layout', 'position', baseline.styles.layout.position, currentStyles.layout.position);
    compareField('layout', 'flexDirection', baseline.styles.layout.flexDirection, currentStyles.layout.flexDirection);
    compareField('layout', 'gap', baseline.styles.layout.gap, currentStyles.layout.gap);
    compareField('layout', 'justifyContent', baseline.styles.layout.justifyContent, currentStyles.layout.justifyContent);
    compareField('layout', 'alignItems', baseline.styles.layout.alignItems, currentStyles.layout.alignItems);

    // Appearance
    compareField('appearance', 'backgroundColor', baseline.styles.appearance.backgroundColor, currentStyles.appearance.backgroundColor);
    compareField('appearance', 'borderRadius', baseline.styles.appearance.borderRadius, currentStyles.appearance.borderRadius);
    compareField('appearance', 'boxShadow', baseline.styles.appearance.boxShadow, currentStyles.appearance.boxShadow);
    compareField('appearance', 'opacity', baseline.styles.appearance.opacity, currentStyles.appearance.opacity);
    compareField('appearance', 'border', baseline.styles.appearance.border, currentStyles.appearance.border);

    // Behavior
    compareField('behavior', 'overflow', baseline.styles.behavior.overflow, currentStyles.behavior.overflow);
    compareField('behavior', 'zIndex', baseline.styles.behavior.zIndex, currentStyles.behavior.zIndex);

    return {
      selector,
      baselineTime: baseline.capturedAt,
      currentTime: new Date().toISOString(),
      hasChanges: diffs.length > 0,
      totalChanges: diffs.length,
      diffs,
      summary,
    };
  }

  /**
   * Formats a diff report as Markdown table for context export.
   */
  public static formatAsMarkdown(report: StyleDiffReport): string {
    if (!report.hasChanges) {
      return `#### Style Diff: \`${report.selector}\`\n\nNo style changes detected since baseline (${new Date(report.baselineTime).toLocaleTimeString()}).\n`;
    }

    let md = `#### Style Diff: \`${report.selector}\`\n\n`;
    md += `*Baseline captured at: ${new Date(report.baselineTime).toLocaleTimeString()}*\n\n`;
    md += `| Property | Before | After | Delta |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    report.diffs.forEach((d) => {
      const deltaCol = d.delta ? `\`${d.delta}\`` : '-';
      md += `| **${d.property}** | \`${d.before}\` | \`${d.after}\` | ${deltaCol} |\n`;
    });

    md += `\n`;
    return md;
  }
}
