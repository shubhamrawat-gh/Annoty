import test from 'node:test';
import assert from 'node:assert/strict';
import { compileToMarkdown, compileToJSON, compileToPlainText } from '../src/promptCompiler.ts';
import { Annotation } from '../src/types.ts';

const mockAnnotations: Annotation[] = [
  {
    id: 'test-1',
    pinNumber: 1,
    createdAt: '2026-09-24T12:00:00.000Z',
    instruction: 'Increase CTA button padding to 12px 24px and make text bolder',
    sourceTier: 1,
    elementSnapshot: '<button class="hero-cta">Get Started</button>',
    textPreview: 'Get Started',
    selector: 'button.hero-cta',
    filePath: 'src/components/HeroCTA.tsx',
    lineNumber: 42,
    componentName: 'HeroCTA',
    groupId: 'default',
    category: 'visual',
    severity: 'high',
    state: 'pending',
    layout: { width: 140, height: 40, x: 200, y: 350 },
    viewport: { width: 1440, height: 900, preset: 'desktop-1440' },
    computedStyles: {
      box: { width: '140px', height: '40px', margin: '0px', padding: '8px 16px', borderWidth: '1px' },
      typography: { fontFamily: 'Inter', fontSize: '14px', fontWeight: '600', lineHeight: '20px', letterSpacing: 'normal', textAlign: 'center' },
      layout: { display: 'flex', position: 'static', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '8px', gridTemplateColumns: 'none' },
      appearance: { color: '#ffffff', backgroundColor: '#3ecf8e', borderRadius: '8px', boxShadow: 'none', opacity: '1', border: '1px solid #3ecf8e' },
      behavior: { overflow: 'visible', cursor: 'pointer', pointerEvents: 'auto', zIndex: 'auto' },
    },
    diagnostics: [],
  },
  {
    id: 'test-2',
    pinNumber: 2,
    createdAt: '2026-09-24T12:05:00.000Z',
    instruction: 'Fix text contrast ratio against dark background',
    sourceTier: 9,
    elementSnapshot: '<p class="subtext">Welcome to the future</p>',
    textPreview: 'Welcome to the future',
    selector: 'section.hero > p.subtext',
    landmarkContext: 'main hero section',
    groupId: 'default',
    category: 'accessibility',
    severity: 'critical',
    state: 'pending',
    layout: { width: 320, height: 24, x: 200, y: 400 },
    diagnostics: [
      { type: 'contrast', level: 'warning', message: 'Contrast ratio 3.2:1 fails WCAG AA (4.5:1 recommended)' },
    ],
  },
];

test('compileToMarkdown generates structured markdown with components and line numbers', () => {
  const md = compileToMarkdown(mockAnnotations);

  assert.ok(md.includes('## UI Change Requests (2 elements)'));
  assert.ok(md.includes('### File: src/components/HeroCTA.tsx'));
  assert.ok(md.includes('**1. Line 42**'));
  assert.ok(md.includes('<HeroCTA />'));
  assert.ok(md.includes('140 × 40px'));
  assert.ok(md.includes('- **Category:** `VISUAL`'));
  assert.ok(md.includes('**Severity:** `HIGH`'));
  assert.ok(md.includes('### Unmapped elements'));
  assert.ok(md.includes('Contrast ratio 3.2:1 fails WCAG AA'));
});

test('compileToJSON produces valid JSON with correct counts and schema', () => {
  const jsonStr = compileToJSON(mockAnnotations);
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed.annotyVersion, '2.0.0');
  assert.equal(parsed.totalAnnotations, 2);
  assert.equal(parsed.annotations[0].target.component, 'HeroCTA');
  assert.equal(parsed.annotations[0].target.filePath, 'src/components/HeroCTA.tsx');
  assert.equal(parsed.annotations[1].category, 'accessibility');
  assert.equal(parsed.annotations[1].severity, 'critical');
});

test('compileToPlainText outputs clean bullet points', () => {
  const txt = compileToPlainText(mockAnnotations);

  assert.ok(txt.includes('ANNOTY UI CHANGE REQUESTS (2 items):'));
  assert.ok(txt.includes('[1] src/components/HeroCTA.tsx:42'));
  assert.ok(txt.includes('Component: <HeroCTA />'));
  assert.ok(txt.includes('[2] section.hero > p.subtext'));
});

test('compiler handles empty annotation lists gracefully', () => {
  assert.equal(compileToMarkdown([]), '');
  assert.equal(compileToPlainText([]), '');
  const emptyJson = JSON.parse(compileToJSON([]));
  assert.equal(emptyJson.totalAnnotations, 0);
  assert.equal(emptyJson.annotations.length, 0);
});
