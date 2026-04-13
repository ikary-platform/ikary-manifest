# Localization

IKARY cells localize their runtime UI through `@ikary/system-localization`. Translations live in TypeScript source files, merge deterministically across four layers, and compile to JSON bundles the preview and production runtime load at startup.

The renderer ships English defaults for every built-in string. Your cell overrides those defaults per-locale.

## The four layers

Sources merge in precedence order. Later layers override earlier ones.

| Layer | Where it comes from |
|-------|--------------------|
| `core` | Bundled with core UI packages like `@ikary/system-localization` |
| `library` | Shipped by `@ikary/*-ui` library packages you install |
| `app` | `src/locales/<locale>.ts` in your cell |
| `override` | `src/locales/overrides/<locale>.ts` in your cell |

Only the `override` layer may replace a key that another layer already defined. Duplicates at other layers are reported as errors during `ikary localize build`.

## Quick start

Scaffold config and starter files:

```bash
ikary localize init --locales en,fr
```

This creates:

```
ikary.localization.config.ts
src/locales/en.ts
src/locales/fr.ts
src/locales/overrides/en.ts
src/locales/overrides/fr.ts
locales/
```

Edit `src/locales/en.ts` to add your app messages:

```ts
export const messages = {
  'app.title': 'My App',
  'app.welcome_banner': 'Welcome back, {name}',
} as const;
```

Override a renderer default in `src/locales/overrides/en.ts`:

```ts
export const messages = {
  'entity.detail.edit_button': 'Modify',
} as const;
```

Build the locale bundles:

```bash
ikary localize build
```

Output:

```
locales/en.json
locales/fr.json
```

The preview server picks up the compiled bundles on the next reload.

## Message IDs

Message IDs must be flat dotted keys using lowercase letters, digits, and underscores:

- `app.title`
- `auth.login.title`
- `workspace.member.invite_button`

At least three dot-separated segments are expected for namespaced library codes. App-level keys can use fewer segments.

## Locale codes

Locale codes follow BCP-47 style: `en`, `fr`, `pt-BR`. The default locale must appear in the `supportedLocales` list.

## Using translations in React

Wrap your app root in `LocalizationProvider`:

```tsx
import { LocalizationProvider } from '@ikary/system-localization/ui';
import { config, loaders } from './i18n/config';

<LocalizationProvider config={config} loaders={loaders}>
  <App />
</LocalizationProvider>
```

Call `useT()` anywhere inside the tree:

```tsx
import { useT } from '@ikary/system-localization/ui';

function WelcomeBanner({ name }: { name: string }) {
  const t = useT();
  return <div>{t('app.welcome_banner', { name })}</div>;
}
```

Or use the `<T>` component:

```tsx
import { T } from '@ikary/system-localization/ui';

<T id="app.welcome_banner" values={{ name: 'Alex' }} />
```

## Reporting translation coverage

Extract the keys your source code references:

```bash
ikary localize extract
```

Report which keys a given locale is missing:

```bash
ikary localize missing --lang fr
```

Check whether the catalog has drifted from the source:

```bash
ikary localize sync --check
```

See the [CLI reference](/cli/localize) for full command options.
