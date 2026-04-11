import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/main.ts'],
    format: ['cjs'],
    shims: true,
    clean: true,
    target: 'node20',
    noExternal: [
      '@ikary/contract',
      '@ikary/engine',
      '@ikary/loader',
      '@ikary/primitive-contract',
      '@ikary/system-db-core',
      '@ikary/system-log-core',
      '@ikary/cell-migration-core',
    ],
    external: [
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/platform-express',
      '@nestjs/swagger',
      '@modelcontextprotocol/sdk',
      'express',
      'reflect-metadata',
      'rxjs',
    ],
  },
  {
    entry: ['src/main-stdio.ts'],
    format: ['cjs'],
    target: 'node20',
    noExternal: ['@ikary/contract', '@ikary/engine', '@ikary/loader', '@ikary/primitive-contract'],
    external: ['@modelcontextprotocol/sdk', 'zod'],
  },
]);
