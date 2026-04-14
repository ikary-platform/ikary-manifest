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
      '@ikary/cell-contract': path.resolve(__dirname, '../../libs/cell-contract/src/index.ts'),
      '@ikary/cell-engine': path.resolve(__dirname, '../../libs/cell-engine/src/index.ts'),
      '@ikary/cell-presentation': path.resolve(__dirname, '../../libs/cell-presentation/src/index.ts'),
      '@ikary/cell-primitive-contract': path.resolve(__dirname, '../../libs/cell-primitive-contract/src/index.ts'),
      '@ikary/cell-primitive-studio/ui': path.resolve(__dirname, '../../libs/cell-primitive-studio/src/ui/index.ts'),
      '@ikary/cell-primitive-studio': path.resolve(__dirname, '../../libs/cell-primitive-studio/src/index.ts'),
      '@ikary/cell-primitives/registry': path.resolve(__dirname, '../../libs/cell-primitives/src/registry.ts'),
      '@ikary/cell-primitives': path.resolve(__dirname, '../../libs/cell-primitives/src/index.ts'),
      '@ikary/cell-renderer': path.resolve(__dirname, '../../libs/cell-renderer/src/index.ts'),
      '@ikary/system-ikary-ui/styles': path.resolve(__dirname, '../../libs/system-ikary-ui/src/ui/styles/brand.css'),
      '@ikary/system-ikary-ui/ui': path.resolve(__dirname, '../../libs/system-ikary-ui/src/ui/index.ts'),
      '@ikary/system-ikary-ui': path.resolve(__dirname, '../../libs/system-ikary-ui/src/index.ts'),
      '@ikary/system-localization/ui': path.resolve(__dirname, '../../libs/system-localization/src/ui/index.ts'),
      '@ikary/system-localization': path.resolve(__dirname, '../../libs/system-localization/src/index.ts'),
    },
  },
  build: {
    outDir: '../../apps/docs/public/playground',
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
});
