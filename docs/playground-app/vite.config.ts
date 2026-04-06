import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/ikary-manifest/playground/',
  resolve: {
    alias: {
      '@ikary-manifest/contract': path.resolve(__dirname, '../../contracts/node/contract/src/index.ts'),
      '@ikary-manifest/engine': path.resolve(__dirname, '../../contracts/node/engine/src/index.ts'),
      '@ikary-manifest/presentation': path.resolve(__dirname, '../../ui/presentation/src/index.ts'),
      '@ikary-manifest/primitives/registry': path.resolve(__dirname, '../../ui/primitives/src/registry.ts'),
      '@ikary-manifest/primitives': path.resolve(__dirname, '../../ui/primitives/src/index.ts'),
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
