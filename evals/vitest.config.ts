import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const repoRoot = resolve(__dirname, '..');

export default defineConfig({
  resolve: {
    alias: [
      { find: '@ikary/system-ai/server', replacement: resolve(repoRoot, 'libs/system-ai/src/server/index.ts') },
      { find: '@ikary/system-ai', replacement: resolve(repoRoot, 'libs/system-ai/src/index.ts') },
      { find: '@ikary/cell-contract', replacement: resolve(repoRoot, 'libs/cell-contract/src/index.ts') },
      { find: '@ikary/cell-engine', replacement: resolve(repoRoot, 'libs/cell-engine/src/index.ts') },
      { find: '@ikary/cell-ai/server', replacement: resolve(repoRoot, 'libs/cell-ai/src/server/index.ts') },
      { find: '@ikary/cell-ai', replacement: resolve(repoRoot, 'libs/cell-ai/src/index.ts') },
    ],
  },
  test: {
    name: '@ikary/evals',
    environment: 'node',
    include: ['tests/**/*.{spec,test}.ts'],
  },
});
