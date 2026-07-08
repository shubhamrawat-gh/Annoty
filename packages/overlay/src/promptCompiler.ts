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
 * Pure compiler function that transforms a list of Annotations into a structured Markdown prompt.
 */
export function compileToMarkdown(annotations: Annotation[]): string {
  if (annotations.length === 0) {
    return '';
  }

  const fileGroups: Record<string, Annotation[]> = {};
  const unmapped: Annotation[] = [];
  const detectedCategoriesSet = new Set<Category>();

  // Group by file path or classify as unmapped, and collect categories
  annotations.forEach((anno) => {
    // Detect categories at compile time
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
    
    // Sort annotations within a file by line number if available
    const sorted = [...fileGroups[filePath]].sort((a, b) => {
      const lineA = a.lineNumber ?? 999999;
      const lineB = b.lineNumber ?? 999999;
      return lineA - lineB;
    });

    sorted.forEach((anno) => {
      const lineText = anno.lineNumber ? `Line ${anno.lineNumber}` : 'Approximate location';
      const cleanSnapshot = anno.elementSnapshot.trim().replace(/\r?\n/g, ' ');
      
      markdown += `**${globalIndex}. ${lineText}** — \`${cleanSnapshot}\`\n`;
      markdown += `${anno.instruction}\n\n`;
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
      markdown += `${anno.instruction}\n\n`;
      globalIndex++;
    });
  }

  // Add the new "### Guidance for this batch" section
  markdown += `---\n\n`;
  markdown += `### Guidance for this batch\n\n`;

  const sortedCategories = Array.from(detectedCategoriesSet).sort(compareCategories);
  sortedCategories.forEach((cat) => {
    const template = instructionTemplates[cat];
    if (template) {
      // Capitalize first letter and replace hyphens with spaces for display
      const displayName = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');
      markdown += `- **${displayName}**: ${template}\n`;
    }
  });

  markdown += `\nApply each change at its specified file/line. For unmapped elements, search the codebase using the provided text content and selector context. Don't modify unrelated code.\n`;

  return markdown;
}
