# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+

## Install

```bash
git clone https://github.com/ikary-platform/ikary-manifest.git
cd ikary-manifest
pnpm install
```

## Build and test

```bash
pnpm build    # Build all packages
pnpm test     # Run all tests
```

## Your first manifest

Create a file `my-app.yaml`:

```yaml
apiVersion: ikary.co/v1alpha1
kind: Cell
metadata:
  key: my_app
  name: My First App
  version: "1.0.0"
spec:
  mount:
    mountPath: /
    landingPage: dashboard

  entities:
    - key: task
      name: Task
      pluralName: Tasks
      fields:
        - key: title
          type: string
          name: Title
        - key: done
          type: boolean
          name: Done

  pages:
    - key: dashboard
      type: dashboard
      title: Dashboard
      path: /dashboard
    - key: task-list
      type: entity-list
      title: Tasks
      path: /tasks
      entity: task

  navigation:
    items:
      - type: page
        key: dashboard
        pageKey: dashboard
      - type: page
        key: task-list
        pageKey: task-list
```

## Load and validate

```typescript
import { loadManifestFromFile } from '@ikary-manifest/loader';
import { compileCellApp } from '@ikary-manifest/engine';

// Load YAML and validate
const loaded = await loadManifestFromFile('my-app.yaml');

if (!loaded.valid) {
  console.error('Validation errors:', loaded.errors);
  process.exit(1);
}

// Compile to runtime manifest
const compiled = compileCellApp(loaded.manifest!);
console.log('Compiled manifest:', compiled);
```

## Project structure

```
ikary-manifest/
  manifests/               # YAML source of truth
    entities/              # Standalone entity files
    examples/              # Complete manifest examples
    schemas/               # YAML schemas (JSON Schema in YAML)
  node/                    # TypeScript packages
    packages/
      contract/            # Zod schemas, types, validation
      loader/              # YAML/JSON loading
      engine/              # Compilation, normalization
      presentation/        # UI component schemas
      runtime-ui/          # React component library
      renderer/            # React renderer
      data-runtime/        # Data providers
  python/                  # Python SDK
  docs/                    # This documentation
```

## Next steps

- [Architecture](/guide/architecture) -- understand the processing pipeline
- [Manifest Format](/guide/manifest-format) -- YAML structure, `$ref`, schemas
- [Entity Definition](/reference/entity-definition) -- full entity specification
