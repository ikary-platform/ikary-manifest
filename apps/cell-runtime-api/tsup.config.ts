import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  shims: true,
  clean: true,
  target: 'node20',
  noExternal: ['@ikary/system-migration-core', '@ikary/cell-runtime-core', '@ikary/cell-contract', '@ikary/cell-engine', '@ikary/cell-loader', '@ikary/system-auth', '@ikary/system-db-core', '@ikary/system-log-core'],
  external: [
    '@nestjs/common',
    '@nestjs/core',
    '@nestjs/platform-express',
    '@nestjs/swagger',
    'express',
    'reflect-metadata',
    'rxjs',
    'kysely',
    'pg',
  ],
});
