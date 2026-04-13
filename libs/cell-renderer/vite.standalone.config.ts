import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Builds a self-contained IIFE bundle that includes React, ReactDOM,
 * React Router, TanStack Query, and the full CellAppRenderer.
 *
 * Output: dist/standalone/renderer.iife.js
 * Global name: IkaryRuntime
 *
 * Usage in generated HTML:
 *   <script>window.__IKARY_MANIFEST__ = {...compiled manifest...}</script>
 *   <script src="renderer.iife.js"></script>
 */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/standalone-entry.tsx'),
      name: 'IkaryRuntime',
      formats: ['iife'],
      fileName: () => 'renderer.iife.js',
    },
    outDir: 'dist/standalone',
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      // Bundle everything — this is a self-contained file
      external: [],
    },
  },
  resolve: {
    alias: {
      '@ikary/cell-contract': resolve(__dirname, '../cell-contract/src/index.ts'),
      '@ikary/cell-engine': resolve(__dirname, '../cell-engine/src/index.ts'),
      '@ikary/cell-loader': resolve(__dirname, '../cell-loader/src/index.ts'),
      '@ikary/cell-presentation': resolve(__dirname, '../cell-presentation/src/index.ts'),
      '@ikary/cell-primitives': resolve(__dirname, '../cell-primitives/src/index.ts'),
      '@ikary/system-localization/ui': resolve(__dirname, '../system-localization/src/ui/index.ts'),
      '@ikary/system-localization': resolve(__dirname, '../system-localization/src/index.ts'),
    },
  },
});
