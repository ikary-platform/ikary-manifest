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
      // cell-* aliases → actual ikary libs
      '@ikary/presentation': path.resolve(__dirname, `${LIBS}/presentation/src/index.ts`),
      '@ikary/cell-contract-core': path.resolve(__dirname, `${LIBS}/contract/src/index.ts`),
      '@ikary/cell-contract-presentation': path.resolve(__dirname, `${LIBS}/presentation/src/index.ts`),
      '@ikary/cell-engine': path.resolve(__dirname, `${LIBS}/engine/src/index.ts`),
      '@ikary/cell-runtime': path.resolve(__dirname, `${LIBS}/renderer/src/index.ts`),
      '@ikary/cell-runtime-ui/registry': path.resolve(__dirname, `${LIBS}/primitives/src/registry.ts`),
      '@ikary/cell-runtime-ui': path.resolve(__dirname, `${LIBS}/primitives/src/index.ts`),
      '@ikary/primitives': path.resolve(__dirname, `${LIBS}/primitives/src/index.ts`),
      // new primitive system libs
      '@ikary/primitive-contract': path.resolve(__dirname, `${LIBS}/primitive-contract/src/index.ts`),
      '@ikary/primitive-studio/ui': path.resolve(__dirname, `${LIBS}/primitive-studio/src/ui/index.ts`),
      '@ikary/primitive-studio': path.resolve(__dirname, `${LIBS}/primitive-studio/src/index.ts`),
      '@ikary/system-localization/ui': path.resolve(__dirname, `${LIBS}/system-localization/src/ui/index.ts`),
      '@ikary/system-localization': path.resolve(__dirname, `${LIBS}/system-localization/src/index.ts`),
    },
  },
});
