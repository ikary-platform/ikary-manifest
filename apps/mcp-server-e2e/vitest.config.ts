import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 15_000,
    hookTimeout: 15_000,
    reporters: process.env.CI
      ? ['verbose', 'junit', 'github-actions']
      : ['verbose'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
    sequence: { shuffle: false },
  },
});
