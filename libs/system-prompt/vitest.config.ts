import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const repoRoot = resolve(__dirname, '..', '..');

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@ikary/system-ai/server',
        replacement: resolve(repoRoot, 'libs/system-ai/src/server/index.ts'),
      },
      {
        find: '@ikary/system-ai',
        replacement: resolve(repoRoot, 'libs/system-ai/src/index.ts'),
      },
    ],
  },
  test: {
    name: '@ikary/system-prompt',
    environment: 'node',
    include: ['src/**/*.{spec,test}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{spec,test}.ts', 'src/**/index.ts'],
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
  },
});
