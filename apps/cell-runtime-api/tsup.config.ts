import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  clean: true,
  target: 'node20',
  noExternal: ['@ikary/cell-runtime-core', '@ikary/contract', '@ikary/engine', '@ikary/loader'],
  external: [
    '@nestjs/common',
    '@nestjs/core',
    '@nestjs/platform-express',
    '@nestjs/swagger',
    'express',
    'reflect-metadata',
    'rxjs',
    'better-sqlite3',
    'kysely',
    'pg',
  ],
});
