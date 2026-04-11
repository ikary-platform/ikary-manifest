import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/**/schema.ts',
        'src/**/*.types.ts',
        'src/interfaces/**',
        'src/database/database.module.ts',
        'src/modules/roles/roles.module.ts',
        'src/modules/groups/groups.module.ts',
        'src/modules/assignments/assignments.module.ts',
        'src/modules/authorization/authorization.module.ts',
        'src/registry/registry.module.ts',
      ],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});
