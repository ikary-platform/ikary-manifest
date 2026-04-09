import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIBS = '../../libs';

export default defineConfig({
  appType: 'spa',
  plugins: [react()],
  server: {
    port: 4504,
    strictPort: true,
  },
  preview: {
    port: 4504,
  },
  resolve: {
    alias: {
      '@ikary/cell-contract-core': path.resolve(__dirname, `${LIBS}/cell-contract-core/src/index.ts`),
      '@ikary/cell-engine': path.resolve(__dirname, `${LIBS}/cell-engine/src/index.ts`),
      '@ikary/cell-runtime': path.resolve(__dirname, `${LIBS}/cell-runtime/src/index.ts`),
      '@ikary/cell-runtime-ui/registry': path.resolve(__dirname, `${LIBS}/cell-runtime-ui/src/registry.ts`),
      '@ikary/cell-runtime-ui': path.resolve(__dirname, `${LIBS}/cell-runtime-ui/src/index.ts`),
    },
  },
});
