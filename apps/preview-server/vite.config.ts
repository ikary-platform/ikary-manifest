import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin that:
 * 1. Serves GET /manifest.json — compiled manifest from IKARY_MANIFEST_PATH
 * 2. Serves GET /manifest-events — SSE stream; fires 'manifest:changed' on file change
 */
function manifestPlugin(): any {
  return {
    name: 'ikary-manifest',
    configureServer(server: any) {
      const manifestPath = process.env['IKARY_MANIFEST_PATH'];

      server.middlewares.use('/manifest.json', async (_req: any, res: any) => {
        if (!manifestPath) {
          res.statusCode = 503;
          res.end(JSON.stringify({ error: 'IKARY_MANIFEST_PATH not set' }));
          return;
        }
        try {
          const raw = fs.readFileSync(manifestPath, 'utf-8');
          // Dynamic import to avoid circular resolution at config time
          const { loadManifestFromFile } = await import('@ikary/loader');
          const { compileCellApp } = await import('@ikary/engine');
          const loaded = await loadManifestFromFile(manifestPath);
          if (!loaded.valid || !loaded.manifest) {
            res.statusCode = 422;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ valid: false, errors: loaded.errors }));
            return;
          }
          const compiled = compileCellApp(loaded.manifest);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(compiled));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      const sseClients = new Set<any>();

      server.middlewares.use('/manifest-events', (_req: any, res: any) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write('data: {"type":"connected"}\n\n');
        sseClients.add(res);
        _req.on('close', () => sseClients.delete(res));
      });

      if (manifestPath) {
        fs.watch(manifestPath, () => {
          for (const client of sseClients) {
            client.write('data: {"type":"manifest:changed"}\n\n');
          }
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), manifestPlugin()],
  server: { port: 3000 },
  resolve: {
    alias: {
      '@ikary/contract': path.resolve(__dirname, '../../libs/contract/src/index.ts'),
      '@ikary/engine': path.resolve(__dirname, '../../libs/engine/src/index.ts'),
      '@ikary/presentation': path.resolve(__dirname, '../../libs/presentation/src/index.ts'),
      '@ikary/primitives/registry': path.resolve(__dirname, '../../libs/primitives/src/registry.ts'),
      '@ikary/primitives': path.resolve(__dirname, '../../libs/primitives/src/index.ts'),
      '@ikary/renderer': path.resolve(__dirname, '../../libs/renderer/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
});
