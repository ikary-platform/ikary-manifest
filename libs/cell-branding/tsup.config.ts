import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'server/index': 'src/server/index.ts',
    'ui/index': 'src/ui/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    '@tanstack/react-query',
    'zod',
    '@ikary/system-db-core',
    '@nestjs/common',
    '@nestjs/core',
    'pg',
    'kysely',
    'reflect-metadata',
  ],
});
