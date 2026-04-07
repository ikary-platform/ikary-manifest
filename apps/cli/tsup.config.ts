import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/bin/cli.ts'],
    format: ['esm'],
    clean: true,
    banner: { js: '#!/usr/bin/env node' },
  },
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
  },
]);
