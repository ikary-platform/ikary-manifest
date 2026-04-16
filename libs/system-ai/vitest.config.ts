import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@ikary/system-ai',
    environment: 'node',
    include: ['src/**/*.{spec,test}.ts'],
  },
});
