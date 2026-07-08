import * as svelte from 'svelte/compiler';
import MagicString from 'magic-string';
import path from 'path';
import { Plugin } from 'vite';

export function transformSvelte(code: string, filepath: string, projectRoot: string): string | null {
  try {
    const ast = svelte.parse(code);
    const s = new MagicString(code);
    const relativePath = path.relative(projectRoot, filepath).replace(/\\/g, '/');

    function getLineCol(offset: number) {
      let line = 1;
      let col = 1;
      for (let i = 0; i < offset; i++) {
        if (code[i] === '\n') {
          line++;
          col = 1;
        } else {
          col++;
        }
      }
      return { line, col };
    }

    function walk(node: any) {
      if (!node) return;

      if (node.type === 'Element' || node.type === 'InlineComponent') {
        const hasAttr = node.attributes && node.attributes.some((attr: any) =>
          attr.name === 'data-annoty-source'
        );

        if (!hasAttr) {
          const { line, col } = getLineCol(node.start);
          const val = ` data-annoty-source="${relativePath}:${line}:${col}"`;
          
          const insertOffset = node.start + 1 + node.name.length;
          s.appendRight(insertOffset, val);
        }
      }

      if (node.children) {
        node.children.forEach(walk);
      }
      if (node.html) {
        walk(node.html);
      }
      if (node.fragment) {
        walk(node.fragment);
      }
    }

    walk(ast);

    if (s.hasChanged()) {
      return s.toString();
    }
    return null;
  } catch (err) {
    console.error(`[Annoty] Failed to transform Svelte in ${filepath}:`, err);
    return null;
  }
}

export interface SveltePluginOptions {
  enabled?: boolean;
}

export function annotySvelte(options: SveltePluginOptions = {}): Plugin {
  const enabled = options.enabled !== false;
  let projectRoot = process.cwd();
  let isDev = false;

  return {
    name: 'vite-plugin-annoty-svelte',
    enforce: 'pre',
    configResolved(config) {
      projectRoot = config.root || process.cwd();
      isDev = config.command === 'serve';
    },
    transform(code, id) {
      if (!enabled || !isDev) return;
      const [cleanId] = id.split('?');
      if (cleanId.includes('node_modules')) return;
      if (!cleanId.endsWith('.svelte')) return;

      const result = transformSvelte(code, cleanId, projectRoot);
      if (result) {
        return {
          code: result,
          map: null,
        };
      }
    },
  };
}


export function annotySveltePreprocessor(options: SveltePluginOptions = {}) {
  const enabled = options.enabled !== false;
  let projectRoot = process.cwd();

  return {
    markup({ content, filename }: { content: string; filename: string }) {
      if (!enabled) return;
      if (filename.includes('node_modules')) return;

      const code = transformSvelte(content, filename, projectRoot);
      if (code) {
        return { code };
      }
    },
  };
}
