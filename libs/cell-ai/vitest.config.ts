import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const repoRoot = resolve(__dirname, '..', '..');

export default defineConfig({
  resolve: {
    alias: [
      { find: '@ikary/system-ai/server', replacement: resolve(repoRoot, 'libs/system-ai/src/server/index.ts') },
      { find: '@ikary/system-ai', replacement: resolve(repoRoot, 'libs/system-ai/src/index.ts') },
      { find: '@ikary/system-prompt/server', replacement: resolve(repoRoot, 'libs/system-prompt/src/server/index.ts') },
      { find: '@ikary/system-prompt', replacement: resolve(repoRoot, 'libs/system-prompt/src/index.ts') },
      { find: '@ikary/cell-contract', replacement: resolve(repoRoot, 'libs/cell-contract/src/index.ts') },
      { find: '@ikary/cell-engine', replacement: resolve(repoRoot, 'libs/cell-engine/src/index.ts') },
    ],
  },
  test: {
    name: '@ikary/cell-ai',
    environment: 'node',
    include: ['src/**/*.{spec,test}.ts'],
  },
});
