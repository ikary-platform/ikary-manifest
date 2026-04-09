import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server.ts'],
  format: ['cjs'],
  outDir: 'dist',
  outExtension: () => ({ js: '.js' }),
  noExternal: ['@ikary/loader', '@ikary/engine', '@ikary/contract'],
  platform: 'node',
  target: 'node20',
  clean: false, // Vite output is already in dist/ — don't wipe it
});
