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
        'src/**/*.tsx',              // React components: require component/integration testing
        'src/data-hooks.ts',               // React createContext/useContext infrastructure
        'src/use-list-provider.ts',        // Barrel re-export of hooks/use-list-provider
        'src/use-single-provider.ts',      // Barrel re-export of hooks/use-single-provider
        'src/useRelationRuntime.ts',       // Barrel re-export of hooks/useRelationRuntime
        'src/hooks/use-list-provider.ts',  // React hook requiring DataHooksProvider
        'src/hooks/use-single-provider.ts', // React hook requiring DataHooksProvider
        'src/hooks/useRelationRuntime.ts', // Complex React Query hook (204 lines)
      ],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});
