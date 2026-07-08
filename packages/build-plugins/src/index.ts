import { Plugin } from 'vite';
import { annotyReact, AnnotyPluginOptions } from './react.js';
import { annotyVue } from './vue.js';
import { annotySvelte } from './svelte.js';

export * from './react.js';
export * from './vue.js';
export * from './svelte.js';

export function annoty(options: AnnotyPluginOptions = {}): Plugin[] {
  return [
    annotyReact(options),
    annotyVue(options),
    annotySvelte(options),
  ];
}
