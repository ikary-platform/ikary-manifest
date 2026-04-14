# @ikary/cell-branding

Per-cell branding overrides for accent color, title font, body font, and default
theme mode. Ships a NestJS module, a Kysely-backed Postgres migration, a React
provider tree, hooks, and an admin panel.

## Export Surface

- `.` — Zod contracts, types, defaults. Safe for any runtime.
- `./server` — NestJS module, controller, service, Kysely repository.
- `./ui` — React provider, hooks, admin components, and two data-hook factories
  (live API and localStorage).

## Install

```bash
pnpm add @ikary/cell-branding
```

## Migrations

The `cell_branding` table lives in `migrations/v1.0.0/`. Run migrations through
`@ikary/system-migration-core` the same way other libs do:

```ts
const runner = new MigrationRunner(
  dbService,
  {
    packageName: '@ikary/cell-branding',
    migrationsRoot: resolveMigrationsRoot('@ikary/cell-branding'),
  },
  log,
);
await runner.migrate();
```

## Server usage (NestJS)

```ts
import { Module } from '@nestjs/common';
import { DatabaseService } from '@ikary/system-db-core';
import { CellBrandingModule } from '@ikary/cell-branding/server';

@Module({
  imports: [
    CellBrandingModule.register({
      databaseProviderToken: DatabaseService,
      packageVersion: '0.3.0',
    }),
  ],
})
export class AppModule {}
```

Routes exposed (with default `routePrefix: 'cells'`):

| Method | Path                                | Body                       |
| ------ | ----------------------------------- | -------------------------- |
| GET    | `/cells/:cellId/branding`           |                            |
| PATCH  | `/cells/:cellId/branding`           | `PatchCellBrandingInput`   |
| POST   | `/cells/:cellId/branding/reset`     | `ResetCellBrandingInput`   |

All requests validate with Zod. The service throws `ConflictException` on
`expectedVersion` mismatch and `NotFoundException` when resetting a missing row.

## UI usage

Wire the provider tree once near the root of the app. Pick the data-hook factory
that matches the backend.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrandingDataHooksProvider,
  CellBrandingProvider,
  ThemeModeProvider,
  createLiveBrandingHooks,
} from '@ikary/cell-branding/ui';

const queryClient = new QueryClient();
const brandingHooks = createLiveBrandingHooks({
  apiBase: import.meta.env.VITE_DATA_API_URL,
  getToken: () => window.__IKARY_CONFIG__?.authToken ?? null,
});

export function Root({ cellId, children }: { cellId: string; children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <BrandingDataHooksProvider value={brandingHooks}>
          <CellBrandingProvider cellId={cellId}>{children}</CellBrandingProvider>
        </BrandingDataHooksProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}
```

For apps without a real backend (demos, playgrounds, try.ikary.co), use the
localStorage factory instead:

```ts
import { createLocalStorageBrandingHooks } from '@ikary/cell-branding/ui';

const brandingHooks = createLocalStorageBrandingHooks({
  storageKey: 'ikary.playground.branding',
});
```

The interface is identical, so every component, hook, and the admin panel work
unchanged.

## Admin panel

```tsx
import { BrandingAdminPanel } from '@ikary/cell-branding/ui';

<BrandingAdminPanel cellId={cellId} title="Branding" />
```

The panel reads through `useBranding`, writes through `useUpdateBranding` and
`useResetBranding`, and enforces optimistic version checks.

## CSS variables

The `ThemeProvider` writes these variables on the document root only when the
corresponding field is non-null. Leaving every field null preserves the host
app's shadcn defaults.

- `--accent-color`, `--accent-foreground`
- `--font-title`, `--font-body`
- `--ux-cta-bg-start`, `--ux-cta-bg-end`, `--ux-cta-bg-hover-start`,
  `--ux-cta-bg-hover-end`, `--ux-cta-fg`, `--ux-cta-border`,
  `--ux-cta-border-hover`, `--ux-cta-focus-ring`

Your Tailwind config and shadcn `globals.css` are untouched. Host apps opt in to
branded tokens by referencing any of the variables above.

## Versioning

Versioned together with the rest of the `@ikary/*` monorepo via Changesets.
Breaking changes are called out in the root changelog.
