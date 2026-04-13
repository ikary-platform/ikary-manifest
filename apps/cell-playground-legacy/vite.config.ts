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
      '@ikary/cell-presentation': path.resolve(__dirname, `${LIBS}/cell-presentation/src/index.ts`),
      '@ikary/cell-contract': path.resolve(__dirname, `${LIBS}/cell-contract/src/index.ts`),
      '@ikary/cell-engine': path.resolve(__dirname, `${LIBS}/cell-engine/src/index.ts`),
      '@ikary/cell-renderer': path.resolve(__dirname, `${LIBS}/cell-renderer/src/index.ts`),
      '@ikary/cell-primitives/registry': path.resolve(__dirname, `${LIBS}/cell-primitives/src/registry.ts`),
      '@ikary/cell-primitives': path.resolve(__dirname, `${LIBS}/cell-primitives/src/index.ts`),
      '@ikary/cell-primitive-contract': path.resolve(__dirname, `${LIBS}/cell-primitive-contract/src/index.ts`),
      '@ikary/cell-primitive-studio/ui': path.resolve(__dirname, `${LIBS}/cell-primitive-studio/src/ui/index.ts`),
      '@ikary/cell-primitive-studio': path.resolve(__dirname, `${LIBS}/cell-primitive-studio/src/index.ts`),
      // Legacy aliases — app is marked for deletion; these keep it buildable for now
      '@ikary/cell-contract-core': path.resolve(__dirname, `${LIBS}/cell-contract/src/index.ts`),
      '@ikary/cell-contract-presentation': path.resolve(__dirname, `${LIBS}/cell-presentation/src/index.ts`),
      '@ikary/cell-runtime': path.resolve(__dirname, `${LIBS}/cell-renderer/src/index.ts`),
      '@ikary/cell-runtime-ui/registry': path.resolve(__dirname, `${LIBS}/cell-primitives/src/registry.ts`),
      '@ikary/cell-runtime-ui': path.resolve(__dirname, `${LIBS}/cell-primitives/src/index.ts`),
      '@ikary/system-localization/ui': path.resolve(__dirname, `${LIBS}/system-localization/src/ui/index.ts`),
      '@ikary/system-localization': path.resolve(__dirname, `${LIBS}/system-localization/src/index.ts`),
    },
  },
});
