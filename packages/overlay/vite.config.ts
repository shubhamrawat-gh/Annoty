import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Annoty',
      formats: ['iife'],
      fileName: () => 'overlay.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false, // Turn off minification in development if desired, or keep it true/false. Let's make it false or true. False makes it easier to inspect.
  },
});
