# Micro-App Library Template (Reusable)

Use this as a copy/paste baseline when creating a new domain library in `libs/`.

## 1) Folder Blueprint

```text
/libs/<lib-name>
  /src
    /config
    /modules
      /<module-a>
      /<module-b>
    /shared               # shared contracts, types, Zod schemas (browser-safe)
    /server               # NestJS/Node runtime — only for mixed-shared-server or mixed
      /db
        schema.ts         # required for server-backed persistence libs
      /repositories       # required when the lib owns DB access
    /ui                   # React hooks + components — only for mixed-shared-ui or mixed
      /hooks
      /components
    /providers            # optional
    /guards               # optional
    /decorators           # optional
    /interceptors         # optional
    index.ts              # exports shared surface only
  /migrations
    /v1.0.0
      001_<lib>_<module>_<action>.sql
      002_<lib>_<module>_<action>.sql
  /scripts                # optional (migrate/bootstrap)
  package.json
  tsconfig.json
  README.md
```

**Convention:** Use `src/shared/` (not `src/contracts/`) and `src/ui/` (not `src/client/`) in all new and refactored libraries.

## 2) Quick Start Checklist

- Choose a clear name: `<lib-name>`.
- Set package name: `@ikary/<lib-name>`.
- Choose `microPackageKind`:
  - `shared`
  - `ui`
  - `server`
  - `mixed-shared-server`
  - `mixed-shared-ui`
  - `mixed` _(all three: shared root + `./server` + `./ui`)_
- Add strict TS config.
- Add Zod config schema in `src/config` when needed.
- Implement domain modules in `src/modules`.
- Expose only the intended public API from `src/index.ts`.
- Add versioned SQL migrations in `migrations/vX.Y.Z` when the library owns data.
- For server-backed persistence libraries, add `src/server/db/schema.ts` and repository code built on `@ikary/system-db-core`.
- Document install/config/usage/migrations in README.
- Add explicit `exports` in `package.json`.

## 3) Export Convention

### Pure shared

```json
{
  "microPackageKind": "shared",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

### Pure UI

```json
{
  "microPackageKind": "ui",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

Add explicit asset subpaths such as `./styles` only when needed.

### Pure server

```json
{
  "microPackageKind": "server",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "require": "./dist/index.js"
    }
  }
}
```

### Mixed shared + server

```json
{
  "microPackageKind": "mixed-shared-server",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./server": {
      "types": "./src/server/index.ts",
      "import": "./dist/server/index.mjs",
      "require": "./dist/server/index.js"
    }
  }
}
```

### Mixed shared + UI

```json
{
  "microPackageKind": "mixed-shared-ui",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./ui": {
      "types": "./src/ui/index.ts",
      "import": "./dist/ui/index.mjs",
      "require": "./dist/ui/index.js"
    }
  }
}
```

### Mixed (shared + server + ui)

```json
{
  "microPackageKind": "mixed",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./server": {
      "types": "./src/server/index.ts",
      "import": "./dist/server/index.mjs",
      "require": "./dist/server/index.js"
    },
    "./ui": {
      "types": "./src/ui/index.ts",
      "import": "./dist/ui/index.mjs",
      "require": "./dist/ui/index.js"
    }
  }
}
```

Rules:

- package root is the shared/contracts-safe surface (no React, no NestJS)
- `./server` is only for NestJS or Node runtime
- `./ui` is only for a separate browser/runtime surface (React hooks, components)
- do not create empty subpaths just for symmetry
- runtime DB access must use Kysely via `@ikary/system-db-core`, not handwritten `pg` queries
- raw SQL remains limited to migrations, approved scripts, and rare repository-local `sql\`\`` edge cases

## 4) Migration Naming Template

Use this exact pattern:

`NNN_<lib>_<module>_<action>.sql`

Examples:

- `001_billing_invoice_create_invoices.sql`
- `002_billing_customer_create_customers.sql`
- `003_billing_core_add_indexes.sql`

## 5) README Template Sections

```md
# <Lib Name>

## Package Kind # required for pure packages

## Export Surface # required for mixed packages

## Purpose

## Installation

## Migrations

## Configuration

## Usage in NestJS

## Example Endpoint/Service

## Security/Isolation Notes

## Versioning

## Breaking Changes
```

## 6) NestJS Integration Template

```ts
import { Module } from '@nestjs/common';
import { <LibModule> } from '@ikary/<lib-name>/server';

@Module({
  imports: [
    <LibModule>.register({
      // validated config here
    })
  ]
})
export class AppModule {}
```

For pure server libraries, import from the package root instead of `./server`.

## 7) Reuse Rule

When creating a new library, start from this template and enforce all constraints in:

- `libs/LIBRARY_STYLE_RULES.md`
