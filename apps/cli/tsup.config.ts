import { readFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { defineConfig } from 'tsup';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/** Copy the standalone renderer bundle into dist/assets/ after the CLI builds. */
function copyRendererBundle(): void {
  const src = join(__dirname, '..', '..', 'libs', 'renderer', 'dist', 'standalone', 'renderer.iife.js');
  const destDir = join(__dirname, 'dist', 'assets');
  const dest = join(destDir, 'renderer.iife.js');
  if (existsSync(src)) {
    mkdirSync(destDir, { recursive: true });
    copyFileSync(src, dest);
    console.log('[cli] Copied renderer.iife.js →', dest);
  } else {
    console.warn('[cli] renderer.iife.js not found — run pnpm --filter @ikary/cell-renderer build:standalone first');
  }
}

export default defineConfig([
  {
    entry: ['src/bin/cli.ts'],
    format: ['esm'],
    clean: true,
    banner: { js: '#!/usr/bin/env node' },
    noExternal: [
      '@ikary/cell-contract',
      '@ikary/cell-engine',
      '@ikary/cell-loader',
    ],
    define: {
      'process.env.CLI_VERSION': JSON.stringify(pkg.version),
    },
    onSuccess: copyRendererBundle,
  },
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    noExternal: [
      '@ikary/cell-contract',
      '@ikary/cell-engine',
      '@ikary/cell-loader',
    ],
  },
]);
