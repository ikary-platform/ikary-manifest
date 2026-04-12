import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
  },
  {
    entry: { 'server/index': 'src/server/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    external: ['chalk', 'chokidar', 'commander', 'jiti', 'zod'],
  },
  {
    entry: { 'ui/index': 'src/ui/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    external: ['react', 'react-dom', '@tanstack/react-query', 'react-intl'],
  },
]);
