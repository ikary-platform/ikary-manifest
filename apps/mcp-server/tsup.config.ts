import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/main.ts'],
    format: ['cjs'],
    shims: true,
    clean: true,
    target: 'node20',
    noExternal: [
      '@ikary/cell-contract',
      '@ikary/cell-engine',
      '@ikary/cell-loader',
      '@ikary/cell-primitive-contract',
      '@ikary/cell-presentation',
      '@ikary/system-db-core',
      '@ikary/system-log-core',
      '@ikary/system-migration-core',
      'zod-to-json-schema',
    ],
    external: [
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/platform-express',
      '@nestjs/swagger',
      '@modelcontextprotocol/sdk',
      'express',
      'pg',
      'reflect-metadata',
      'rxjs',
    ],
  },
  {
    entry: ['src/main-stdio.ts'],
    format: ['cjs'],
    target: 'node20',
    noExternal: ['@ikary/cell-contract', '@ikary/cell-engine', '@ikary/cell-loader', '@ikary/cell-primitive-contract'],
    external: ['@modelcontextprotocol/sdk', 'zod'],
  },
]);
