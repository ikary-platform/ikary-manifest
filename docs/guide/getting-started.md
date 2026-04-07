# Getting Started

## Prerequisites

::: code-group

```bash [Node.js]
# Node.js 20 or later
# pnpm 9 or later
node --version
pnpm --version
```

```bash [Python]
# Python 3.11 or later
# pip (included with Python)
python --version
```

:::

## Install

::: code-group

```bash [Node.js]
git clone https://github.com/ikary-platform/ikary-manifest.git
cd ikary-manifest
pnpm install
```

```bash [Python]
git clone https://github.com/ikary-platform/ikary-manifest.git
cd ikary-manifest/python
pip install -e ".[dev]"
```

:::

## Build and test

::: code-group

```bash [Node.js]
pnpm build    # Build all packages
pnpm test     # Run all tests
```

```bash [Python]
cd python
pytest
```

:::

## Your first manifest

Create a file `my-app.yaml`. This file is language-neutral and works with both runtimes.

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

::: code-group

```typescript [Node.js]
import { loadManifestFromFile } from '@ikary/loader';
import { compileCellApp } from '@ikary/engine';

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

```python [Python]
from ikary_manifest.loader import load_manifest_from_file

# Load YAML
manifest = load_manifest_from_file("my-app.yaml")
print(manifest["metadata"]["key"])  # "my_app"
```

:::

## Project structure

```
ikary-manifest/
  manifests/               # YAML source of truth
    entities/              # Domain entity schemas
    examples/              # Complete manifest examples
  node/                    # TypeScript packages
    packages/
      contract/            # Zod schemas, types, validation
      loader/              # YAML/JSON loading
      engine/              # Compilation, normalization
      presentation/        # UI primitive contracts
      runtime-ui/          # React component library
      renderer/            # React renderer
      data-runtime/        # Data providers
  python/                  # Python SDK
  docs/                    # This documentation
```

## Next steps

- [Architecture](/guide/architecture): the three-layer model (schema, contract, runtime)
- [Manifest Format](/guide/manifest-format): Cell Manifest structure and spec sections
- [Contract](/guide/contract): loading, structural validation, and semantic validation
