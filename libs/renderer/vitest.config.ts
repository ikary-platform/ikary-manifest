import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{spec,test}.{ts,tsx}',
        'src/**/index.ts',
        'src/**/*.tsx',                  // React components: require component/integration testing
        'src/__cell-styles.ts',          // CSS-in-JS style definitions
        'src/context/**',                // React context + hooks requiring renderHook infrastructure
        'src/registry/default-registry.ts', // Registration of .tsx page components
        'src/detail/use-detail-page-mode.ts', // Barrel re-export
        'src/detail/hooks/**',           // Complex React hooks
        'src/pages/hooks/**',            // Complex React hooks
        'src/sheets/**',                 // Sheet component hooks
        'src/store/**',                  // Zustand state management
        'src/providers/**',              // Provider setup files
        'src/ui-components.ts',          // TypeScript interface declarations only
      ],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});
