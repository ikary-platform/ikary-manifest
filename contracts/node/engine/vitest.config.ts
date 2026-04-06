import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{spec,test}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.{spec,test}.ts',
        'src/**/index.ts',
        'src/**/types.ts',
        'src/**/derived-field-types.ts',
      ],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});
