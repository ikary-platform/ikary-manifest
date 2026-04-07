import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

/** Serve repo-root files (manifests/, contracts/) during local dev. */
function serveRepoRoot() {
  return {
    name: 'serve-repo-root',
    configureServer(server) {
      server.middlewares.use('/repo', (req, res, next) => {
        const filePath = path.join(repoRoot, decodeURIComponent(req.url || ''));
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveRepoRoot()],
  base: '/ikary-manifest/playground/',
  resolve: {
    alias: {
      '@ikary/contract': path.resolve(__dirname, '../../contracts/node/contract/src/index.ts'),
      '@ikary/engine': path.resolve(__dirname, '../../contracts/node/engine/src/index.ts'),
      '@ikary/presentation': path.resolve(__dirname, '../../ui/presentation/src/index.ts'),
      '@ikary/primitives/registry': path.resolve(__dirname, '../../ui/primitives/src/registry.ts'),
      '@ikary/primitives': path.resolve(__dirname, '../../ui/primitives/src/index.ts'),
    },
  },
  build: {
    outDir: '../../docs/public/playground',
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
});
