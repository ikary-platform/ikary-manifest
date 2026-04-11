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
  base: '/playground/',
  server: {
    port: 4505,
    strictPort: true,
  },
  preview: {
    port: 4505,
  },
  resolve: {
    alias: {
      '@ikary/contract': path.resolve(__dirname, '../../libs/contract/src/index.ts'),
      '@ikary/engine': path.resolve(__dirname, '../../libs/engine/src/index.ts'),
      '@ikary/presentation': path.resolve(__dirname, '../../libs/presentation/src/index.ts'),
      '@ikary/primitive-contract': path.resolve(__dirname, '../../libs/primitive-contract/src/index.ts'),
      '@ikary/primitive-studio/ui': path.resolve(__dirname, '../../libs/primitive-studio/src/ui/index.ts'),
      '@ikary/primitive-studio': path.resolve(__dirname, '../../libs/primitive-studio/src/index.ts'),
      '@ikary/primitives/registry': path.resolve(__dirname, '../../libs/primitives/src/registry.ts'),
      '@ikary/primitives': path.resolve(__dirname, '../../libs/primitives/src/index.ts'),
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
