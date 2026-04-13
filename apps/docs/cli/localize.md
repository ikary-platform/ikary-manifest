# Localization commands

`ikary localize` manages translation catalogs for a cell. All commands read from the cell package root (defaults to the current directory) and expect an `ikary.localization.config.ts` at that root.

**Requires:** a cell scaffolded with `ikary init` or `ikary localize init`.

## `ikary localize init`

Scaffolds localization config and starter locale files.

```bash
ikary localize init --default-locale en --locales en,fr
```

Creates:

- `ikary.localization.config.ts` — config with default + supported locales
- `src/locales/<locale>.ts` — app message source (one per locale)
- `src/locales/overrides/<locale>.ts` — empty override file per locale
- `locales/` — output directory for compiled JSON bundles

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Cell package root | `.` |
| `--default-locale <code>` | Default locale code | `en` |
| `--locales <codes>` | Comma-separated supported locales | `en` |
| `--force` | Overwrite existing files | false |

If any of the target files already exist and `--force` is not passed, they are left untouched and the command reports which files were skipped.

---

## `ikary localize build`

Discovers locale sources from your cell and every installed `@ikary/*-ui` package, merges them in precedence order (core → library → app → override), and writes compiled JSON bundles to `locales/<locale>.json`.

```bash
ikary localize build
```

Output:

```
Building localization catalogs

✔ Generated 2 locale file(s)

  locales/en.json
  locales/fr.json
```

| Option | Description | Default |
|--------|-------------|---------|
| `--app <path>` | Cell package root | `.` |
| `--watch` | Rebuild on file changes | false |
| `--fail-on-missing` | Exit non-zero when translations are missing | false |
| `--fail-on-duplicate` | Exit non-zero when duplicate keys are detected | false |

Watch mode monitors the config file, your cell's `src/locales/` tree, and every discovered library locale directory. Each change triggers a full rebuild.

---

## `ikary localize extract`

Scans `src/**/*.{ts,tsx}` for translation call sites and writes the full key list to `translations.catalog.json`.

```bash
ikary localize extract
```

Recognized call patterns:

- `t('key.path')`
- `<T id="key.path" />`
- `formatMessage({ id: 'key.path' })`

| Option | Description | Default |
|--------|-------------|---------|
| `--app <path>` | Cell package root | `.` |

The output catalog serves as input for `ikary localize missing` and `ikary localize sync`.

---

## `ikary localize missing`

Compares an extracted catalog against a compiled locale JSON file and reports coverage.

```bash
ikary localize missing --lang fr
```

Example output:

```
Checking translation coverage for fr

Coverage: 73% (22/30 keys)

Missing 8 key(s):
  app.welcome_banner
  auth.login.subtitle
  ...
```

| Option | Description | Default |
|--------|-------------|---------|
| `--lang <code>` | Target locale code (required) | — |
| `--app <path>` | Cell package root | `.` |
| `--strict` | Exit non-zero when keys are missing | false |

Run `ikary localize extract` before this command so the catalog reflects current source code.

---

## `ikary localize sync`

Compares the extracted catalog on disk against a fresh scan of the source tree and reports drift.

```bash
ikary localize sync --check
```

| Option | Description | Default |
|--------|-------------|---------|
| `--app <path>` | Cell package root | `.` |
| `--check` | Report drift without updating the catalog | false |

Without `--check`, the command rewrites `translations.catalog.json` to match the current source. CI pipelines should use `--check` to fail the build when the committed catalog is stale.
