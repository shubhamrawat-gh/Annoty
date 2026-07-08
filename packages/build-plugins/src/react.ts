import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
import path from 'path';
import { Plugin } from 'vite';

const traverse = (traverseModule as any).default || traverseModule;
const generate = (generateModule as any).default || generateModule;

export function transformReact(code: string, filepath: string, projectRoot: string): { code: string; map: any } | null {
  const ext = path.extname(filepath);
  const isTSX = ext === '.tsx';
  const isTS = ext === '.ts' || isTSX;
  const isJSX = ext === '.jsx' || isTSX || code.includes('</') || code.includes('/>');

  if (!isJSX) return null;

  try {
    const plugins: any[] = ['jsx'];
    if (isTS) {
      plugins.push('typescript');
    } else {
      plugins.push('flow');
    }

    const ast = parse(code, {
      sourceType: 'module',
      plugins,
      tokens: true,
    });

    const relativePath = path.relative(projectRoot, filepath).replace(/\\/g, '/');

    traverse(ast, {
      JSXOpeningElement(pathNode: any) {
        const node = pathNode.node;

        // Skip Fragment elements
        if (t.isJSXIdentifier(node.name) && node.name.name === 'Fragment') {
          return;
        }

        // Check if data-annoty-source is already present
        const hasAttr = node.attributes.some((attr: any) =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name) &&
          attr.name.name === 'data-annoty-source'
        );

        if (!hasAttr && node.loc) {
          const line = node.loc.start.line;
          const col = node.loc.start.column + 1; // 1-indexed column
          const val = `${relativePath}:${line}:${col}`;

          node.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier('data-annoty-source'),
              t.stringLiteral(val)
            )
          );
        }
      },
    });

    const output = generate(ast, {
      sourceMaps: true,
      sourceFileName: filepath,
    }, code);

    return {
      code: output.code,
      map: output.map,
    };
  } catch (err) {
    console.error(`[Annoty] Failed to transform React JSX in ${filepath}:`, err);
    return null;
  }
}

export interface AnnotyPluginOptions {
  enabled?: boolean;
}

export function annotyReact(options: AnnotyPluginOptions = {}): Plugin {
  const enabled = options.enabled !== false;
  let projectRoot = process.cwd();
  let isDev = false;

  return {
    name: 'vite-plugin-annoty-react',
    enforce: 'pre',
    configResolved(config) {
      projectRoot = config.root || process.cwd();
      isDev = config.command === 'serve';
    },
    transform(code, id) {
      if (!enabled || !isDev) return;
      const [cleanId] = id.split('?');
      if (cleanId.includes('node_modules')) return;
      if (!/\.[jt]sx?$/.test(cleanId)) return;

      const result = transformReact(code, cleanId, projectRoot);
      if (result) {
        return {
          code: result.code,
          map: result.map,
        };
      }
    },
  };
}

