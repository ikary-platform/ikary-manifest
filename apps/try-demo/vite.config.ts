import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4511,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4510',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@ikary/cell-ai': path.resolve(__dirname, '../../libs/cell-ai/src/index.ts'),
      '@ikary/cell-contract': path.resolve(__dirname, '../../libs/cell-contract/src/index.ts'),
      '@ikary/cell-engine': path.resolve(__dirname, '../../libs/cell-engine/src/index.ts'),
      '@ikary/cell-presentation': path.resolve(__dirname, '../../libs/cell-presentation/src/index.ts'),
      '@ikary/cell-primitive-contract': path.resolve(__dirname, '../../libs/cell-primitive-contract/src/index.ts'),
      '@ikary/cell-primitives/registry': path.resolve(__dirname, '../../libs/cell-primitives/src/registry.ts'),
      '@ikary/cell-primitives': path.resolve(__dirname, '../../libs/cell-primitives/src/index.ts'),
      '@ikary/cell-renderer': path.resolve(__dirname, '../../libs/cell-renderer/src/index.ts'),
      '@ikary/system-localization/ui': path.resolve(__dirname, '../../libs/system-localization/src/ui/index.ts'),
      '@ikary/system-localization': path.resolve(__dirname, '../../libs/system-localization/src/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
});
