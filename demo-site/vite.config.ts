import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-annoty-overlay',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/annoty/overlay.js')) {
            const overlayPath = resolve(__dirname, '../packages/overlay/dist/overlay.js');
            if (fs.existsSync(overlayPath)) {
              res.setHeader('Content-Type', 'application/javascript');
              res.end(fs.readFileSync(overlayPath));
              return;
            } else {
              res.statusCode = 404;
              res.end('/* [Annoty] overlay.js not built yet. Please run build:overlay first. */');
              return;
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3000,
  },
});
