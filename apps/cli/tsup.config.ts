import { readFileSync } from 'fs';
import { defineConfig } from 'tsup';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig([
  {
    entry: ['src/bin/cli.ts'],
    format: ['esm'],
    clean: true,
    banner: { js: '#!/usr/bin/env node' },
    noExternal: [
      '@ikary/contract',
      '@ikary/engine',
      '@ikary/loader',
    ],
    define: {
      'process.env.CLI_VERSION': JSON.stringify(pkg.version),
    },
  },
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    noExternal: [
      '@ikary/contract',
      '@ikary/engine',
      '@ikary/loader',
    ],
  },
]);
