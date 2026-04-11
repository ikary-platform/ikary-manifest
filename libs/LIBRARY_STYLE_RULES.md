# Micro-App Library Style Rules

These rules define how every new `libs/*` package must be designed and delivered in this repository.

## 1) Scope and Goal

- A library must have one clear domain purpose (single responsibility).
- A library must be reusable by multiple apps.
- A library must be framework-friendly for NestJS integration.
- A library must avoid mixing IAM and authorization policy concerns unless explicitly required.

## 2) Stack Alignment

- Language: TypeScript (strict mode).
- Backend integration target: NestJS.
- Database: PostgreSQL — accessed via `@ikary/system-db-core`.
- Validation: Zod for external inputs and configuration.
- Migrations: raw SQL files only (no ORM-generated migrations).
- Runtime persistence: Kysely for backend data access (through `@ikary/system-db-core`).

## 3) Naming Rules

- Library folder name must be clear and domain-specific: `libs/<domain-name>`.
- Package name should follow workspace scope convention: `@ikary/<domain-name>` or repo-approved variant.
- Migration files must use explicit module naming, not relative-only naming.
  - Required format: `NNN_<lib>_<module>_<action>.sql`
  - Example: `001_auth_user_create_users.sql`

## 4) Package Kind and Export Surface

Every library must declare `microPackageKind` in `package.json` with one of:

- `shared`
- `ui`
- `server`
- `mixed-shared-server`
- `mixed-shared-ui`
- `mixed` _(all three: shared + server + ui)_

Required behavior by kind:

- `shared`
  - package root exports only
  - browser-safe and runtime-agnostic
  - no `./server`
  - no `./ui`
- `ui`
  - package root exports only
  - browser/runtime-specific surface is allowed
  - no `./server`
- `server`
  - package root exports only
  - Node/NestJS runtime surface is allowed
  - no `./server`
  - no `./ui`
- `mixed-shared-server`
  - package root exports shared/contracts-safe surface only
  - `./server` exports NestJS or Node runtime integration
  - package root must never import `@nestjs/*`, `node:*`, `pg`, `async_hooks`, or relative `server` modules
- `mixed-shared-ui`
  - package root exports shared/contracts-safe surface only
  - `./ui` exports browser/runtime-specific surface
  - package root must stay framework-light and browser-safe
- `mixed`
  - package root exports shared/contracts-safe surface only (no React, no NestJS)
  - `./server` exports NestJS or Node runtime integration
  - `./ui` exports React hooks and components
  - package root must never import `@nestjs/*`, `node:*`, `pg`, or `react`

Use explicit `exports` in every `libs/*/package.json`.

Defaults:

- package root is always the primary public surface (shared contracts only)
- add `./server` only when the package is genuinely mixed and has separate Node/NestJS runtime integration
- add `./ui` only when the package is genuinely mixed and has a separate browser/runtime surface
- do not invent empty or redundant subpaths for symmetry alone
- explicit non-code asset subpaths such as `./styles` are allowed when needed
- React hooks that belong to a domain lib must be exported from `./ui`, not from the package root

## 5) Required Library Structure

Each library must include at least:

- `package.json`
- `tsconfig.json`
- `README.md`
- `src/index.ts`
- `migrations/vX.Y.Z/*.sql` (if the library owns data)

Recommended source structure:

- `src/config` for typed config + Zod schema
- `src/modules` for domain modules/services/repositories
- `src/shared/` for shared contracts, types, and Zod schemas (browser-safe; no framework imports) — **use `shared/`, not `contracts/`**
- `src/server/db/schema.ts` for server-backed libraries that own persistence
- `src/guards`, `src/decorators`, `src/interceptors` only when needed
- `scripts` for deterministic automation like migrations
- `src/server/*` or `src/server.ts` only for `mixed-shared-server` or `mixed` packages
- `src/ui/*` only for `mixed-shared-ui` or `mixed` packages — **use `ui/`, not `client/`**
- `src/hooks/*` for React hooks in pure `ui` packages
- `src/ui/hooks/*` for React hooks in mixed packages
- `schema/` folders for UI-facing Zod validation schemas

**Folder naming conventions:**

| Old (deprecated)    | New (required)  |
| ------------------- | --------------- |
| `src/contracts/`    | `src/shared/`   |
| `src/client/`       | `src/ui/`       |
| `src/client/hooks/` | `src/ui/hooks/` |

Internal relative imports must always use the new names. Do not use `contracts/` or `client/` in new or refactored code.

React boundary rules:

- React components render UI and emit callbacks; they must not own business logic, API calls, validation setup, or side effects.
- React hooks that belong to a library must live in `src/hooks` or `src/ui/hooks`.
- UI-facing Zod schemas must live in a `schema/` folder.
- Compatibility re-export files may remain outside `hooks/` or `schema/`, but the canonical implementation must live in the governed folder.

## 6) Database and Migration Rules

- All primary keys should be UUID.
- Use soft deletes where domain-relevant.
- Include foreign keys, unique constraints, and indexes.
- Include tenant strategy (`workspace_id`) when library is tenant-aware.
- Migrations must be incremental and immutable once released.
- Store migration execution history in `schema_migrations`.
- Reserve no-op migration slots only when preserving numbering compatibility is necessary.
- Runtime DB access in `apps/*/src` and `libs/*/src` must use Kysely repositories built on `@ikary/system-db-core`.
- Raw SQL is allowed only in:
  - migrations
  - approved scripts/tooling
  - repository-local `sql\`\`` edge cases where Kysely fluent queries are insufficient
- Inline SQL strings and direct `pg` usage are forbidden in runtime repositories, services, and controllers.

## 7) Architecture Rules

- Keep clear separation between:
  - domain logic
  - integration logic (Nest modules/controllers)
  - provider/adaptor logic
- Dependency injection must be used for services and ports.
- No circular dependencies.
- Public API surface must be exported from `src/index.ts` only for root imports.
- `./server` and `./ui` subpaths must map to dedicated entry files and must not be re-exported from the package root.

## 8) Configuration Rules

- All runtime config must be validated by Zod.
- Config should support sensible defaults and environment overrides.
- Feature flags must be explicit (`enabled: boolean`) for optional capabilities.

## 9) Security and Data Safety Rules

- Secrets/tokens must never be stored in plaintext if avoidable.
- Security-sensitive flows must be auditable where applicable.
- Tenant data access must enforce tenant boundary checks at guard + query layers.
- Browser-consumable package roots must never pull in Node-only dependencies transitively.

## 10) README Minimum Content

Every library README must include:

- Purpose and scope
- Installation
- Configuration
- Migration execution
- Usage in NestJS (example module wiring) when applicable
- Example endpoint/service usage when applicable
- Versioning and breaking-change policy
- Package-kind metadata:
  - pure packages must include a `Package Kind` section
  - mixed packages must include an `Export Surface` section describing root vs `./server` or `./ui`

## 11) Definition of Done (DoD)

Before merge, a library must satisfy:

- `pnpm run check:library-exports` passes
- `pnpm run check-no-inline-sql` passes
- `pnpm typecheck` passes
- `pnpm build` passes
- README is complete and accurate
- Migration files follow naming rule and execute in order
- Public exports are intentional and minimal
