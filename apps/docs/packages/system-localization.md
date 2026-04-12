# @ikary/system-localization

Production-ready multi-layer localization for IKARY cells. Provides Zod-validated contracts, a deterministic build pipeline, and a React runtime with `react-intl` under the hood.

**Package kind:** `mixed` — shared root + `./server` + `./ui` entry points.

## Export surface

| Import path | Use from | Contents |
|-------------|----------|----------|
| `@ikary/system-localization` | any environment | Zod schemas, types, merge logic, `defineLocalizationConfig()` |
| `@ikary/system-localization/server` | Node / CLI | `buildLocalization()`, `extractI18nCatalog()`, commander command registrations |
| `@ikary/system-localization/ui` | React | `LocalizationProvider`, `LanguageProvider`, `useT`, `useTranslation`, `<T>` |

The root path is browser-safe and never imports Node, NestJS, or React.

## Shared API (root)

```ts
import {
  defineLocalizationConfig,
  mergeMessageSources,
  diffLocaleKeys,
  createLocaleScaffold,
  type LocalizationConfig,
  type LocaleMessages,
  type MessageSource,
} from '@ikary/system-localization';
```

**`defineLocalizationConfig(input)`** — Validates and returns a strongly-typed config.

```ts
export const config = defineLocalizationConfig({
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr', 'pt-BR'],
  outputDir: 'locales',
  validation: {
    failOnMissing: false,
    failOnDuplicate: true,
  },
});
```

**`mergeMessageSources(sources, options?)`** — Merges multiple message sources with deterministic precedence. Returns the merged map, duplicates, and provenance tracking.

**`diffLocaleKeys(reference, candidate)`** — Returns `{ missingKeys, extraKeys }` for translation coverage reporting.

**`createLocaleScaffold(reference, existing?)`** — Builds a template for a new locale, filling unknown keys with empty strings.

## Server API (`./server`)

```ts
import {
  buildLocalization,
  extractI18nCatalog,
  registerI18nExtractCommand,
} from '@ikary/system-localization/server';
```

**`buildLocalization(options)`** — Full build pipeline: discovers locale sources, merges, validates, writes JSON. Supports watch mode.

```ts
await buildLocalization({
  cwd: process.cwd(),
  app: '.',
  watch: false,
  failOnMissing: true,
  failOnDuplicate: true,
});
```

**`extractI18nCatalog(appRoot)`** — Scans source files for `t()`, `<T id>`, and `formatMessage({ id })` patterns. Returns `{ keys, catalog }`.

The `register*Command` helpers wire a commander `Command` instance to the underlying pipeline. The IKARY CLI uses them directly.

## UI API (`./ui`)

```tsx
import {
  LocalizationProvider,
  LanguageProvider,
  useT,
  useTranslation,
  T,
} from '@ikary/system-localization/ui';
```

**`<LocalizationProvider config={...} loaders={...}>`** — Wraps the app. Loads the active locale asynchronously, provides `useT()` downstream, and persists the user's choice in `localStorage`.

Required props:

- `config: LocalizationConfig` — defaultLocale + supportedLocales
- `loaders: LocaleLoaderMap` — map of locale code to async loader function

Optional:

- `catalogClient` — fetch catalogs from a server (for multi-tenant overrides)
- `initialLocale` — force the starting locale (default: `config.defaultLocale`)
- `initialScope` — `{ tenantId?, workspaceId?, cellId? }`

**`useT(): TranslateFn`** — Returns a translate function.

```tsx
const t = useT();
return <button>{t('app.submit_button')}</button>;
```

With interpolation:

```tsx
return <div>{t('app.welcome_banner', { name: 'Alex' })}</div>;
```

**`<T id="..." values={...} />`** — Inline component form.

```tsx
<T id="app.welcome_banner" values={{ name: 'Alex' }} />
```

**`useTranslation()`** — Convenience hook returning `{ t, locale, defaultLocale, supportedLocales, setLocale, isLoading }`.

**`<LanguageProvider>`** — Optional wrapper around `LocalizationProvider` that adds priority resolution (stored → user → workspace → tenant → browser → platform → default) and a Tanstack Query integration for fetching the list of supported languages.

## Installation

```json
{
  "dependencies": {
    "@ikary/system-localization": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

React + `react-intl` are peer dependencies on the `./ui` path only.

## See also

- [Localization guide](/guide/localization) — concepts and quick start
- [`ikary localize` commands](/cli/localize) — CLI reference
