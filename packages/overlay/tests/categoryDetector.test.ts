import test from 'node:test';
import assert from 'node:assert/strict';
import { detectCategories } from '../src/categoryDetector.ts';

test('detectCategories detects visual and styling categories accurately', () => {
  const colorCats = detectCategories('Change the background color to emerald green');
  assert.ok(colorCats.includes('color'));

  const typoCats = detectCategories('Increase font size and make headline bold');
  assert.ok(typoCats.includes('typography'));

  const spacingCats = detectCategories('Add more margin bottom and padding to this container');
  assert.ok(spacingCats.includes('spacing'));

  const responsiveCats = detectCategories('Fix mobile layout breakpoint overflow at 375px');
  assert.ok(responsiveCats.includes('responsive'));
});

test('detectCategories falls back to general-other when no keyword matches', () => {
  const genericCats = detectCategories('check something completely arbitrary');
  assert.deepEqual(genericCats, ['general-other']);
});
