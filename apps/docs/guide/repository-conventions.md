# Repository conventions

This page defines the naming and versioning rules every contributor must
follow. Read it before adding a new library, moving a script, or releasing.

## Directory layout

```text
ikary-manifest/
  apps/        Executables, services, and sites (CLI, servers, docs, playground)
  libs/        Reusable packages consumed by apps (cell-*, system-*)
  scripts/     Repo-orchestration scripts (build helpers, doc checks, schema gen)
  manifests/   Canonical YAML schemas and examples
```

Apps are leaves. Libs are internal packages published under `@ikary/*`.
Scripts are one-off Node files invoked from the root `package.json`; they
are never imported from another package.

## Domain terms

Four terms cover every package in the repo.

- **Cell.** An isolated runtime environment that renders a presentation
  layer on top of the IKARY API. One Cell is one application: its own data,
  its own UI, its own lifecycle, described by a single manifest file.
- **Entity.** A domain object inside a Cell (for example `Customer`,
  `Invoice`). An entity declares fields, relations, computed values,
  capabilities, and policies. The renderer generates list and detail pages
  for every entity from its definition.
- **Manifest.** The YAML or JSON file that defines a Cell. Its schema is
  `CellManifestV1`, published from `@ikary/cell-contract`.
- **Primitive.** A reusable UI component (text input, date picker, table,
  chart). Built-in primitives ship in `@ikary/cell-primitives`. Projects
  register custom primitives via `ikary-primitives.yaml`.

## Library naming: `cell-*` vs `system-*`

Every library in `libs/` carries one of two prefixes.

### `cell-*`: Cell-domain code

Use `cell-` when the library models the Cell domain or depends on
`@ikary/cell-contract`. These libraries only make sense inside an IKARY
Cell runtime.

Examples:

| Package                        | Role                                         |
|--------------------------------|----------------------------------------------|
| `@ikary/cell-contract`         | Zod schemas for `CellManifestV1`, entities   |
| `@ikary/cell-engine`           | Manifest compilation and derivation          |
| `@ikary/cell-loader`           | YAML or JSON manifest parser                 |
| `@ikary/cell-renderer`         | React runtime that renders a Cell            |
| `@ikary/cell-presentation`     | Presentation-layer types                     |
| `@ikary/cell-data`             | Data-layer hooks for manifest UIs            |
| `@ikary/cell-primitives`       | Built-in UI primitive components             |
| `@ikary/cell-primitive-contract` | Zod contract for authoring primitives      |
| `@ikary/cell-primitive-studio` | Primitive authoring workbench                |
| `@ikary/cell-runtime-core`     | NestJS runtime orchestrator                  |

### `system-*`: infrastructure that wraps a 3rd-party tool

Use `system-` when the library wraps a 3rd-party tool and has no
Cell-specific knowledge. These libraries are reusable outside the Cell
domain (for example in analytics, billing, or AI-token modules that the
platform may add later).

Examples:

| Package                       | Wraps                                        |
|-------------------------------|----------------------------------------------|
| `@ikary/system-auth`          | JWT, bcrypt, NestJS Guards                   |
| `@ikary/system-authorization` | Kysely-backed RBAC                           |
| `@ikary/system-db-core`       | PostgreSQL via Kysely                        |
| `@ikary/system-localization`  | react-intl + catalog build pipeline          |
| `@ikary/system-log-core`      | Pino + DB-backed log sinks                   |
| `@ikary/system-migration-core`| File-based Postgres migration engine         |
| `@ikary/system-ikary-ui`      | IKARY brand: logo, theme toggle, wave bg, tokens |

The `system-*` prefix also covers IKARY-wide platform utilities (brand, fonts,
theme) with no Cell-domain knowledge. `system-ikary-ui` is the IKARY brand
implementation; the `system-brand-*` namespace is reserved for a future
white-label theming system.

### How to choose

Ask one question: **does this library make sense in a platform module
that has nothing to do with Cells?**

- Yes. Prefix with `system-`.
- No, it only runs inside a Cell. Prefix with `cell-`.

A library that depends on `@ikary/cell-contract` is Cell-domain by
definition. Prefix it with `cell-`.

A library that only depends on Node standard library, a 3rd-party driver,
or other `system-*` packages is infrastructure. Prefix it with `system-`.

## App naming

Apps use descriptive names. The `cell-` prefix is applied only when the app
is Cell-specific.

| App                       | Role                                               |
|---------------------------|----------------------------------------------------|
| `apps/cli`                | `ikary` CLI                                        |
| `apps/ikary`              | npm wrapper for the CLI                            |
| `apps/docs`               | VitePress documentation site                       |
| `apps/mcp-server`         | MCP server exposing contract intelligence          |
| `apps/cell-runtime-api`   | PostgreSQL-backed entity REST API                  |
| `apps/cell-preview-server`| Local hot-reload preview server for Cell manifests |
| `apps/cell-playground`    | Public manifest playground served at `/playground/` |

## Scripts location

Repo-orchestration scripts live at the root `scripts/` directory. They are
invoked from the root `package.json` and never imported from another
package.

Do not create a `libs/scripts/` directory. A library is a package with a
`package.json` and public exports. A script is a standalone Node file with
no exports.

Current scripts:

```text
scripts/
  capture-cli-output.ts       Captures CLI output for doc snippets
  check-docs-command-smoke.mjs Verifies docs match CLI behavior
  check-docs-freshness.mjs     Verifies doc links and references
  generate-json-schema.ts      Generates JSON Schema from Zod contracts
  test-db-up.sh                Brings up the local Postgres test container
  test-db-down.sh              Tears the test container down
```

## Versioning: one number, lockstep releases

Every publishable package in `apps/` and `libs/` shares the same version.
We release the whole monorepo together or we do not release. Partial
releases are structurally impossible.

This is enforced by Changesets `fixed` config in `.changeset/config.json`.
The `fixed` array lists every publishable package. When you run `pnpm changeset` and
then `pnpm changeset version`, every package in the array is bumped to the
same new version.

The current version is set in every `package.json` and must stay in sync.

### When to add a package to `fixed`

Every new `cell-*` or `system-*` library MUST be added to the `fixed`
array the moment it is created. Same for any new app.

Only add `"private": true` packages to the array if you want them to
appear in the release PR alongside the published packages.

## How to add a new library

1. Pick the prefix (`cell-` or `system-`) using the rule above.
2. Create the directory: `libs/<prefix>-<name>/`.
3. Set `"name": "@ikary/<prefix>-<name>"` in `package.json`.
4. Set `"version"` to the current monorepo version (read it from any
   other `libs/*/package.json`).
5. Add the package name to the `fixed` array in `.changeset/config.json`.
6. Follow the template at `libs/LIBRARY_TEMPLATE.md` in the repo for folder
   structure.
7. Run `pnpm install` to wire the package into the workspace graph.

## How to add a new app

1. Decide the name. Use `cell-*` only if the app is Cell-specific.
2. Create the directory: `apps/<name>/`.
3. Set `"name": "@ikary/<name>"`, `"version"` matching the monorepo
   version, `"private": true` unless you intend to publish it.
4. Add the package name to the `fixed` array in `.changeset/config.json`.
5. Run `pnpm install`.

## Breaking the convention

Do not. If you think a library does not fit, start a discussion before
adding it.
