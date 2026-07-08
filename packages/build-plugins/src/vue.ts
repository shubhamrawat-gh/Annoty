import { parse as parseSFC } from '@vue/compiler-sfc';
import MagicString from 'magic-string';
import path from 'path';
import { Plugin } from 'vite';

export function transformVue(code: string, filepath: string, projectRoot: string): string | null {
  try {
    const { descriptor } = parseSFC(code, { filename: filepath });
    if (!descriptor.template || !descriptor.template.ast) {
      return null;
    }

    const s = new MagicString(code);
    const relativePath = path.relative(projectRoot, filepath).replace(/\\/g, '/');

    function walk(node: any) {
      if (node.type === 1) { // Element type
        // Check if data-annoty-source is already present
        const hasAttr = node.props.some((prop: any) =>
          prop.name === 'data-annoty-source' ||
          (prop.type === 7 && prop.arg?.content === 'data-annoty-source')
        );

        if (!hasAttr) {
          const line = node.loc.start.line;
          const col = node.loc.start.column;
          const val = ` data-annoty-source="${relativePath}:${line}:${col}"`;
          
          const insertOffset = node.loc.start.offset + 1 + node.tag.length;
          s.appendRight(insertOffset, val);
        }
      }

      if (node.children) {
        node.children.forEach(walk);
      }
    }

    walk(descriptor.template.ast);

    if (s.hasChanged()) {
      return s.toString();
    }
    return null;
  } catch (err) {
    console.error(`[Annoty] Failed to transform Vue SFC in ${filepath}:`, err);
    return null;
  }
}

export interface VuePluginOptions {
  enabled?: boolean;
}

export function annotyVue(options: VuePluginOptions = {}): Plugin {
  const enabled = options.enabled !== false;
  let projectRoot = process.cwd();
  let isDev = false;

  return {
    name: 'vite-plugin-annoty-vue',
    enforce: 'pre',
    configResolved(config) {
      projectRoot = config.root || process.cwd();
      isDev = config.command === 'serve';
    },
    transform(code, id) {
      if (!enabled || !isDev) return;
      const [cleanId] = id.split('?');
      if (cleanId.includes('node_modules')) return;
      if (!cleanId.endsWith('.vue')) return;

      const result = transformVue(code, cleanId, projectRoot);
      if (result) {
        return {
          code: result,
          map: null,
        };
      }
    },
  };
}

