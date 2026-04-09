import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
  },
  {
    entry: { 'server/index': 'src/server/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    external: [
      '@nestjs/common',
      '@nestjs/core',
      '@ikary/system-db-core',
      'pino',
      'pino-pretty',
    ],
  },
  {
    entry: { 'ui/index': 'src/ui/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    external: ['react', 'react-dom', 'lucide-react', '@tanstack/react-virtual'],
  },
]);
