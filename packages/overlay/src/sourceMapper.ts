import { SourceMappingResult } from './types';

/**
 * Gets a clean, normalized CSS selector for the given element.
 * Prefers ID, then class combinations, then fallbacks to tag name and nth-child.
 */
function getCssSelector(el: HTMLElement): string {
  if (el.id) {
    return `#${el.id}`;
  }

  const path: string[] = [];
  let current: HTMLElement | null = el;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();
    
    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    }

    // Capture classes, ignoring any that belong to our Annoty UI
    if (current.className && typeof current.className === 'string') {
      const classes = current.className
        .trim()
        .split(/\s+/)
        .filter((c) => c && !c.startsWith('annoty-'));
      if (classes.length > 0) {
        selector += `.${classes.join('.')}`;
      }
    }

    // Determine position among siblings of the same tag name to disambiguate
    const parentElement: HTMLElement | null = current.parentElement;
    if (parentElement) {
      const children = Array.from(parentElement.children) as HTMLElement[];
      const siblings = children.filter(
        (c) => c.nodeName === current!.nodeName
      );
      if (siblings.length > 1) {
        const index = children.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    path.unshift(selector);
    current = parentElement;
  }

  return path.join(' > ');
}

/**
 * Traverses parent elements to find the nearest semantic landmark context.
 */
function getLandmarkContext(el: HTMLElement): string | undefined {
  const landmarks = ['header', 'nav', 'main', 'section', 'footer', 'article', 'aside'];
  let current = el.parentElement;
  
  while (current) {
    const tagName = current.tagName.toLowerCase();
    if (landmarks.includes(tagName)) {
      return `<${tagName}>`;
    }
    const role = current.getAttribute('role');
    if (role) {
      return `<${tagName} role="${role}">`;
    }
    current = current.parentElement;
  }
  
  return undefined;
}

/**
 * Normalizes absolute or system paths to cleaner relative paths starting with src/ (or from the project root).
 */
function normalizeFilePath(rawPath: string): string {
  let path = rawPath.replace(/\\/g, '/');
  
  // Look for common project subfolders to make the path more readable for LLMs
  const srcIndex = path.indexOf('/src/');
  if (srcIndex !== -1) {
    return path.substring(srcIndex + 1);
  }
  
  const nodeModulesIndex = path.indexOf('/node_modules/');
  if (nodeModulesIndex !== -1) {
    return path.substring(nodeModulesIndex + 1);
  }

  // If it's a localhost URL, grab the pathname
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      return new URL(path).pathname;
    } catch {
      // Fallback
    }
  }

  // Remove leading slashes/drive letters if they look like Windows absolute paths
  if (path.match(/^[A-Z]:\//i)) {
    return path.substring(3);
  }

  return path;
}

/**
 * Analyzes a clicked DOM element using a tiered strategy:
 * Tier 1: React Fiber walk
 * Tier 2: Vue vnode / component walk
 * Tier 3: data-annoty-source attribute
 * Tier 4: Universal CSS selector + context fallback
 */
export function mapElementToSource(el: HTMLElement): SourceMappingResult {
  const selector = getCssSelector(el);
  const textPreview = el.textContent?.trim().replace(/\s+/g, ' ').substring(0, 80) || '';
  const elementSnapshot = el.outerHTML.substring(0, 200);
  const landmarkContext = getLandmarkContext(el);

  const baseResult: Omit<SourceMappingResult, 'sourceTier'> = {
    selector,
    elementSnapshot,
    textPreview,
    landmarkContext,
  };

  // --- Tier 1: Build-time / Manual data-annoty-source Attribute ---
  try {
    let current: HTMLElement | null = el;
    while (current) {
      const sourceAttr = current.getAttribute('data-annoty-source');
      if (sourceAttr) {
        // Expected format: "path/to/file.tsx:line:col", "path/to/file.tsx:line" or just "path/to/file.tsx"
        const parts = sourceAttr.split(':');
        const filePath = normalizeFilePath(parts[0]);
        const lineNumber = parts[1] ? parseInt(parts[1], 10) : undefined;
        const columnNumber = parts[2] ? parseInt(parts[2], 10) : undefined;

        return {
          ...baseResult,
          sourceTier: 1,
          filePath,
          lineNumber: isNaN(lineNumber as any) ? undefined : lineNumber,
          columnNumber: isNaN(columnNumber as any) ? undefined : columnNumber,
        };
      }
      current = current.parentElement;
    }
  } catch (err) {
    console.warn('[Annoty] Tier 1 data-annoty-source check failed:', err);
  }

  // --- Tier 2 & 3: React Fiber walk ---
  try {
    const fiberKey = Object.keys(el).find(
      (key) => key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
    );
    
    if (fiberKey) {
      let fiber = (el as any)[fiberKey];
      let currentFiber = fiber;
      let debugSource: any = null;
      let distance = 0;

      while (currentFiber) {
        if (currentFiber._debugSource) {
          debugSource = currentFiber._debugSource;
          break;
        }
        // Traverse up to the owner or parent fiber
        currentFiber = currentFiber._debugOwner || currentFiber.return;
        distance++;
      }

      if (debugSource && debugSource.fileName) {
        const path = normalizeFilePath(debugSource.fileName);
        if (distance === 0) {
          return {
            ...baseResult,
            sourceTier: 2,
            filePath: path,
            lineNumber: debugSource.lineNumber,
            columnNumber: debugSource.columnNumber,
          };
        } else {
          return {
            ...baseResult,
            sourceTier: 3,
            filePath: path,
            lineNumber: debugSource.lineNumber,
            columnNumber: debugSource.columnNumber,
            approximationDistance: distance,
          };
        }
      }
    }
  } catch (err) {
    console.warn('[Annoty] Tier 2/3 React fiber walk failed:', err);
  }

  // --- Tier 4: Vue Instance Walk (Component-level only) ---
  try {
    const vueKeys = Object.keys(el).filter(
      (key) => key.startsWith('__vue') || key === '__vueParentComponent'
    );
    
    for (const key of vueKeys) {
      const vueVal = (el as any)[key];
      
      let file: string | undefined;

      // Vue 3 Component Instance
      if (vueVal?.type?.__file) {
        file = vueVal.type.__file;
      } else if (vueVal?.proxy?.$options?.__file) {
        file = vueVal.proxy.$options.__file;
      } 
      // Vue 3 VNode
      else if (vueVal?.type?.__file) {
        file = vueVal.type.__file;
      }

      if (file) {
        return {
          ...baseResult,
          sourceTier: 4,
          filePath: normalizeFilePath(file),
          lineUnavailable: true,
        };
      }
    }
  } catch (err) {
    console.warn('[Annoty] Tier 4 Vue walk failed:', err);
  }

  // --- Tier 5: Svelte Walk ---
  try {
    const svelteMeta = (el as any).__svelte_meta;
    if (svelteMeta && svelteMeta.loc) {
      const file = svelteMeta.loc.file;
      const line = svelteMeta.loc.line;
      const column = svelteMeta.loc.column;
      if (file) {
        return {
          ...baseResult,
          sourceTier: 5,
          filePath: normalizeFilePath(file),
          lineNumber: line !== undefined ? line + 1 : undefined,
          columnNumber: column,
        };
      }
    }
  } catch (err) {
    console.warn('[Annoty] Tier 5 Svelte meta walk failed:', err);
  }

  // --- Tier 6: Astro Walk ---
  try {
    const astroFile = el.getAttribute('data-astro-source-file');
    const astroLoc = el.getAttribute('data-astro-source-loc');
    if (astroFile) {
      let line: number | undefined;
      let col: number | undefined;
      if (astroLoc) {
        const parts = astroLoc.split(':');
        line = parseInt(parts[0], 10);
        col = parseInt(parts[1], 10);
      }
      return {
        ...baseResult,
        sourceTier: 6,
        filePath: normalizeFilePath(astroFile),
        lineNumber: isNaN(line as any) ? undefined : line,
        columnNumber: isNaN(col as any) ? undefined : col,
      };
    }
  } catch (err) {
    console.warn('[Annoty] Tier 6 Astro attribute walk failed:', err);
  }

  // --- Tier 7: Preact Walk ---
  try {
    const vnodeKey = Object.keys(el).find(
      (key) => key.startsWith('__vnode') || key.startsWith('__preactattr_')
    );
    if (vnodeKey) {
      const vnode = (el as any)[vnodeKey];
      const debugSource = vnode?._source || vnode?.type?._source;
      if (debugSource && debugSource.fileName) {
        return {
          ...baseResult,
          sourceTier: 7,
          filePath: normalizeFilePath(debugSource.fileName),
          lineNumber: debugSource.lineNumber,
          columnNumber: debugSource.columnNumber,
        };
      }
    }
  } catch (err) {
    console.warn('[Annoty] Tier 7 Preact vnode walk failed:', err);
  }

  // --- Tier 8: General Compiler Injected Attributes ---
  try {
    const srcFile = el.getAttribute('data-source-file') || el.getAttribute('data-source-path') || el.getAttribute('__source-file');
    const srcLine = el.getAttribute('data-source-line') || el.getAttribute('__source-line');
    const srcCol = el.getAttribute('data-source-column') || el.getAttribute('__source-column');
    if (srcFile) {
      const lineNum = srcLine ? parseInt(srcLine, 10) : undefined;
      const colNum = srcCol ? parseInt(srcCol, 10) : undefined;
      return {
        ...baseResult,
        sourceTier: 8,
        filePath: normalizeFilePath(srcFile),
        lineNumber: isNaN(lineNum as any) ? undefined : lineNum,
        columnNumber: isNaN(colNum as any) ? undefined : colNum,
      };
    }
  } catch (err) {
    console.warn('[Annoty] Tier 8 Custom compiler attribute check failed:', err);
  }

  // --- Tier 9: Universal CSS Selector Fallback ---
  return {
    ...baseResult,
    sourceTier: 9,
  };
}
