import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  shims: true,
  clean: true,
  target: 'node20',
  outExtension: () => ({ js: '.cjs' }),
  noExternal: [
    '@ikary/cell-ai',
    '@ikary/cell-contract',
    '@ikary/system-ai',
  ],
  external: [
    '@nestjs/common',
    '@nestjs/core',
    '@nestjs/platform-express',
    'express',
    'openai',
    'partial-json',
    'reflect-metadata',
    'rxjs',
    'yaml',
  ],
});
