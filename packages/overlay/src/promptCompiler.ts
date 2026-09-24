import { Annotation } from './types';
import { detectCategories, Category } from './categoryDetector';
import { instructionTemplates } from './instructionTemplates';

const CATEGORY_ORDER = [
  'color',
  'typography',
  'size',
  'spacing',
  'layout-position',
  'alignment',
  'responsive',
];

function compareCategories(a: Category, b: Category): number {
  const indexA = CATEGORY_ORDER.indexOf(a);
  const indexB = CATEGORY_ORDER.indexOf(b);

  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;

  if (a === 'general-other') return 1;
  if (b === 'general-other') return -1;

  return a.localeCompare(b);
}

/**
 * Transforms annotations into a rich, structured Markdown prompt.
 */
export function compileToMarkdown(annotations: Annotation[]): string {
  if (annotations.length === 0) {
    return '';
  }

  const fileGroups: Record<string, Annotation[]> = {};
  const unmapped: Annotation[] = [];
  const detectedCategoriesSet = new Set<Category>();

  annotations.forEach((anno) => {
    const categories = detectCategories(anno.instruction);
    categories.forEach((cat) => detectedCategoriesSet.add(cat));

    if (anno.filePath) {
      if (!fileGroups[anno.filePath]) {
        fileGroups[anno.filePath] = [];
      }
      fileGroups[anno.filePath].push(anno);
    } else {
      unmapped.push(anno);
    }
  });

  let markdown = `## UI Change Requests (${annotations.length} element${annotations.length === 1 ? '' : 's'})\n\n`;
  let globalIndex = 1;

  // Process mapped files
  Object.keys(fileGroups).forEach((filePath) => {
    markdown += `### File: ${filePath}\n\n`;

    const sorted = [...fileGroups[filePath]].sort((a, b) => {
      const lineA = a.lineNumber ?? 999999;
      const lineB = b.lineNumber ?? 999999;
      return lineA - lineB;
    });

    sorted.forEach((anno) => {
      const lineText = anno.lineNumber ? `Line ${anno.lineNumber}` : 'Approximate location';
      const cleanSnapshot = anno.elementSnapshot.trim().replace(/\r?\n/g, ' ');

      markdown += `**${globalIndex}. ${lineText}** — \`${cleanSnapshot}\`\n`;
      if (anno.componentName) {
        markdown += `- **Component:** \`<${anno.componentName} />\`\n`;
      }
      if (anno.category) {
        markdown += `- **Category:** \`${anno.category.toUpperCase()}\` | **Severity:** \`${(anno.severity || 'medium').toUpperCase()}\`\n`;
      }
      if (anno.layout) {
        markdown += `- **Dimensions:** ${anno.layout.width} × ${anno.layout.height}px (x: ${anno.layout.x}, y: ${anno.layout.y})\n`;
      }
      if (anno.viewport) {
        markdown += `- **Viewport:** ${anno.viewport.width} × ${anno.viewport.height} (${anno.viewport.preset})\n`;
      }
      if (anno.computedStyles) {
        const s = anno.computedStyles;
        markdown += `- **Computed Styles:**\n`;
        markdown += `  - Box: padding: \`${s.box.padding}\`, margin: \`${s.box.margin}\`\n`;
        markdown += `  - Typography: font: \`${s.typography.fontSize} ${s.typography.fontFamily}\`, weight: \`${s.typography.fontWeight}\`, color: \`${s.appearance.color}\`\n`;
        markdown += `  - Layout: display: \`${s.layout.display}\`, position: \`${s.layout.position}\`\n`;
      }
      if (anno.diagnostics && anno.diagnostics.length > 0) {
        markdown += `- **Diagnostics:**\n`;
        anno.diagnostics.forEach((d) => {
          markdown += `  - [${d.level.toUpperCase()}] ${d.message}\n`;
        });
      }

      markdown += `\n**Instruction:**\n${anno.instruction}\n\n`;
      globalIndex++;
    });
  });

  // Process unmapped elements (Tier 4 fallbacks)
  if (unmapped.length > 0) {
    markdown += `### Unmapped elements (no exact file location found)\n\n`;
    unmapped.forEach((anno) => {
      const landmarkText = anno.landmarkContext ? ` inside ${anno.landmarkContext}` : '';
      const cleanSnapshot = anno.elementSnapshot.trim().replace(/\r?\n/g, ' ');

      markdown += `**${globalIndex}.** Element \`${cleanSnapshot}\`${landmarkText}, selector: \`${anno.selector}\`\n`;
      if (anno.category) {
        markdown += `- **Category:** \`${anno.category.toUpperCase()}\` | **Severity:** \`${(anno.severity || 'medium').toUpperCase()}\`\n`;
      }
      if (anno.layout) {
        markdown += `- **Dimensions:** ${anno.layout.width} × ${anno.layout.height}px\n`;
      }
      if (anno.diagnostics && anno.diagnostics.length > 0) {
        markdown += `- **Diagnostics:**\n`;
        anno.diagnostics.forEach((d) => {
          markdown += `  - [${d.level.toUpperCase()}] ${d.message}\n`;
        });
      }
      markdown += `\n**Instruction:**\n${anno.instruction}\n\n`;
      globalIndex++;
    });
  }

  // Add the "### Guidance for this batch" section
  markdown += `---\n\n`;
  markdown += `### Guidance for this batch\n\n`;

  const sortedCategories = Array.from(detectedCategoriesSet).sort(compareCategories);
  sortedCategories.forEach((cat) => {
    const template = instructionTemplates[cat];
    if (template) {
      const displayName = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');
      markdown += `- **${displayName}**: ${template}\n`;
    }
  });

  markdown += `\nApply each change at its specified file/line. For unmapped elements, search the codebase using the provided text content and selector context. Don't modify unrelated code.\n`;

  return markdown;
}

/**
 * Compiles annotations into structured, machine-readable JSON.
 */
export function compileToJSON(annotations: Annotation[]): string {
  const payload = {
    annotyVersion: '2.0.0',
    generatedAt: new Date().toISOString(),
    totalAnnotations: annotations.length,
    viewport: {
      width: typeof window !== 'undefined' ? window.innerWidth : 1440,
      height: typeof window !== 'undefined' ? window.innerHeight : 900,
    },
    annotations: annotations.map((a, idx) => ({
      index: idx + 1,
      id: a.id,
      pinNumber: a.pinNumber || idx + 1,
      instruction: a.instruction,
      category: a.category || 'visual',
      severity: a.severity || 'medium',
      state: a.state || 'pending',
      target: {
        selector: a.selector,
        snapshot: a.elementSnapshot,
        component: a.componentName,
        filePath: a.filePath,
        lineNumber: a.lineNumber,
        columnNumber: a.columnNumber,
      },
      layout: a.layout,
      computedStyles: a.computedStyles,
      diagnostics: a.diagnostics,
    })),
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Compiles annotations into a concise plain-text bullet list.
 */
export function compileToPlainText(annotations: Annotation[]): string {
  if (annotations.length === 0) return '';

  let out = `ANNOTY UI CHANGE REQUESTS (${annotations.length} items):\n\n`;

  annotations.forEach((a, idx) => {
    const loc = a.filePath ? `${a.filePath}${a.lineNumber ? `:${a.lineNumber}` : ''}` : a.selector;
    out += `[${idx + 1}] ${loc}\n`;
    if (a.componentName) out += `    Component: <${a.componentName} />\n`;
    if (a.category) out += `    Category: ${a.category.toUpperCase()} | Severity: ${(a.severity || 'medium').toUpperCase()}\n`;
    out += `    Instruction: ${a.instruction}\n\n`;
  });

  return out;
}

/**
 * Browser-native client-side file download helper.
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Writes text directly to user clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn('[Annoty] Clipboard API write failed, attempting fallback:', e);
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('[Annoty] Fallback copy failed:', err);
    return false;
  }
}
