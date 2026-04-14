import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
  },
  {
    entry: { 'ui/index': 'src/ui/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    external: ['react'],
  },
]);
