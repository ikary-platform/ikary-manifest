import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@ikary/system-mcp',
    environment: 'node',
    include: ['src/**/*.{spec,test}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{spec,test}.ts', 'src/**/index.ts'],
      reporter: ['text', 'lcov'],
    },
  },
});
