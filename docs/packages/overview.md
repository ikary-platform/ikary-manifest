# Packages Overview

Packages are organised by concern, not by language. Each top-level directory answers a different question.

## contracts/

Everything related to "what is a valid manifest?". Node.js and Python implementations of the same concern live side by side.

| Package | Role |
|---------|------|
| [`@ikary-manifest/contract`](/packages/contract) | Zod schemas, TypeScript types, structural + semantic validation |
| [`@ikary-manifest/loader`](/packages/loader) | YAML/JSON parsing, meta-property stripping, validation pipeline |
| [`@ikary-manifest/engine`](/packages/engine) | Compilation, normalization, field derivation, path builders |
| `ikary-manifest` (Python) | Python manifest loader |

## runtime-api/

Everything related to "how do I serve a REST API from a manifest?".

| Package | Role |
|---------|------|
| `@ikary-manifest/generator-nest` | NestJS module/controller/service generator _(placeholder)_ |
| `ikary-manifest-fastapi` (Python) | FastAPI route generator _(placeholder)_ |

## ui/

Client-side rendering. All packages target the browser, not Node.js.

| Package | Role |
|---------|------|
| `@ikary-manifest/presentation` | Zod schemas for 40+ UI primitive presentations |
| `@ikary-manifest/primitives` | React component library: primitives, registries, query engine |
| `@ikary-manifest/data` | Data-binding providers for entity pages |
| `@ikary-manifest/renderer` | Manifest-driven React app shell and page renderer |

## apps/

Standalone executables.

| App | Role |
|-----|------|
| `@ikary-manifest/cli` | `ikary` CLI: validate, compile, generate _(placeholder)_ |

## Dependency graph

```mermaid
graph TD
    contract[contract] --> loader[loader]
    contract --> engine[engine]
    contract --> presentation[presentation]
    contract --> primitives[primitives]
    presentation --> primitives
    primitives --> renderer[renderer]
    primitives --> data[data]
    engine --> renderer

    style contract fill:#1d4ed8,stroke:#78afff,color:#f8fafc
    style loader fill:#182644,stroke:#78afff,color:#f8fafc
    style engine fill:#182644,stroke:#78afff,color:#f8fafc
    style presentation fill:#182644,stroke:#63a0ff,color:#f8fafc
    style primitives fill:#182644,stroke:#63a0ff,color:#f8fafc
    style renderer fill:#182644,stroke:#63a0ff,color:#f8fafc
    style data fill:#182644,stroke:#63a0ff,color:#f8fafc
```

## Processing pipeline

The three contract packages form a pipeline:

```mermaid
flowchart TD
    A[YAML file] -->|load| B[loader]
    B -->|parse| C[contract]
    C -->|validate| D[engine]
    D -->|compile| E[Runtime CellManifestV1]

    style A fill:#0a1329,stroke:#78afff,color:#bcc8df
    style B fill:#182644,stroke:#78afff,color:#f8fafc
    style C fill:#182644,stroke:#78afff,color:#f8fafc
    style D fill:#182644,stroke:#78afff,color:#f8fafc
    style E fill:#1d4ed8,stroke:#78afff,color:#f8fafc
```

```typescript
import { loadManifestFromFile } from '@ikary-manifest/loader';
import { compileCellApp } from '@ikary-manifest/engine';

const loaded = await loadManifestFromFile('manifest.yaml');
if (loaded.valid) {
  const compiled = compileCellApp(loaded.manifest!);
}
```

## Building

```bash
pnpm build        # Build all packages (via Turbo)
pnpm test         # Run all tests
pnpm typecheck    # Type-check all packages
```
