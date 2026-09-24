import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node test runner environment if needed
if (!globalThis.localStorage) {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

import { StyleDiffEngine } from '../src/styleDiffEngine.ts';
import { ElementComputedStyles, ElementLayout } from '../src/types.ts';

const baselineLayout: ElementLayout = {
  width: 160,
  height: 40,
  x: 100,
  y: 200,
};

const baselineStyles: ElementComputedStyles = {
  box: { width: '160px', height: '40px', margin: '0px', padding: '8px 16px', borderWidth: '1px' },
  typography: { fontFamily: 'Inter', fontSize: '14px', fontWeight: '500', lineHeight: '20px', letterSpacing: 'normal', textAlign: 'center' },
  layout: { display: 'inline-flex', position: 'relative', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '8px', gridTemplateColumns: 'none' },
  appearance: { color: '#ffffff', backgroundColor: '#000000', borderRadius: '4px', boxShadow: 'none', opacity: '1', border: '1px solid #000' },
  behavior: { overflow: 'hidden', cursor: 'pointer', pointerEvents: 'auto', zIndex: '1' },
};

test('StyleDiffEngine saves and retrieves baselines correctly', () => {
  const selector = 'button.hero-cta';
  StyleDiffEngine.saveBaseline(selector, baselineStyles, baselineLayout);

  const retrieved = StyleDiffEngine.getBaseline(selector);
  assert.ok(retrieved !== null);
  assert.equal(retrieved.selector, selector);
  assert.equal(retrieved.layout.width, 160);
  assert.equal(retrieved.styles.box.padding, '8px 16px');
});

test('StyleDiffEngine detects deltas and property changes between Snapshot A and B', () => {
  const selector = 'button.hero-cta';

  const updatedLayout: ElementLayout = {
    width: 172,
    height: 48,
    x: 100,
    y: 200,
  };

  const updatedStyles: ElementComputedStyles = {
    ...baselineStyles,
    box: { ...baselineStyles.box, width: '172px', height: '48px', padding: '12px 20px' },
    typography: { ...baselineStyles.typography, fontSize: '16px', fontWeight: '700' },
    appearance: { ...baselineStyles.appearance, backgroundColor: '#3ecf8e', borderRadius: '8px' },
  };

  const report = StyleDiffEngine.compare(selector, updatedStyles, updatedLayout);
  assert.ok(report !== null);
  assert.equal(report.hasChanges, true);
  assert.ok(report.totalChanges >= 5);

  // Check width delta (+12px)
  const widthDiff = report.diffs.find((d) => d.property === 'width');
  assert.ok(widthDiff);
  assert.equal(widthDiff.delta, '+12px');

  // Check height delta (+8px)
  const heightDiff = report.diffs.find((d) => d.property === 'height');
  assert.ok(heightDiff);
  assert.equal(heightDiff.delta, '+8px');

  // Check padding change
  const paddingDiff = report.diffs.find((d) => d.property === 'padding');
  assert.ok(paddingDiff);
  assert.equal(paddingDiff.before, '8px 16px');
  assert.equal(paddingDiff.after, '12px 20px');

  // Format as Markdown table
  const md = StyleDiffEngine.formatAsMarkdown(report);
  assert.ok(md.includes('Style Diff: `button.hero-cta`'));
  assert.ok(md.includes('`+8px`'));
  assert.ok(md.includes('`+12px`'));
});

test('StyleDiffEngine reports no changes when styles are identical', () => {
  const selector = 'button.identical';
  StyleDiffEngine.saveBaseline(selector, baselineStyles, baselineLayout);

  const report = StyleDiffEngine.compare(selector, baselineStyles, baselineLayout);
  assert.ok(report !== null);
  assert.equal(report.hasChanges, false);
  assert.equal(report.totalChanges, 0);
});
