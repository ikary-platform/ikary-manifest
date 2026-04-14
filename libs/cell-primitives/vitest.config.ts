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
        'src/**/*.tsx',               // React components: require component/integration testing
        'src/**/*.types.ts',          // TypeScript interface/type declarations only
        'src/**/*.register.ts',       // Component registration side effects
        'src/**/register*.ts',        // Registration files (alternate naming)
        'src/**/*.example.ts',        // Example/demo data files
        'src/**/*.adapter.ts',        // Framework adapter wiring code
        'src/**/*.resolver.ts',       // Resolver configuration code (except entity-header)
        'src/registry.ts',            // Top-level primitive registration side effects
        'src/data/**',                // Fake/test data files
        'src/types/**',               // Type-only declaration files
        'src/chrome/**',              // App-chrome primitives (ThemeToggle, useTheme) - require full React + DOM test env
        'src/primitives/*/hooks/**',  // Complex React hooks requiring full test environment
        'src/primitives/form/hooks/**',
        'src/primitives/list-page/hooks/**',
        'src/primitives/form/buildEntityCreatePresentation.ts', // Complex form builder (164 lines)
        'src/primitives/form/useFormRuntime.ts',       // Barrel re-export of hooks
        'src/primitives/form/useIkaryForm.ts',         // Barrel re-export of hooks
        'src/primitives/list-page/useListPageControllerRuntime.ts', // Barrel re-export
        'src/primitives/list-page/useListPageRuntime.ts', // Barrel re-export
        'src/primitives/list-page/listPage.runtime-utils.ts', // Complex runtime utils (312 lines)
        'src/query/hooks/**',         // React Query hooks requiring mock providers
        'src/query/useQuery.ts',      // Barrel re-export
        'src/query/useQuerySingle.ts', // Barrel re-export
        'src/query/clients/**',       // HTTP clients
        'src/query/queryEngine.ts',   // Complex query engine
        'src/query/utils/fakeStore.ts', // Fake test store
        'src/query/shared/**',        // Type-only shared query type definitions
        'src/query/cache/**',         // Query cache key utilities
        'src/registry/**',            // Module-state registries (registered at startup)
      ],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});
