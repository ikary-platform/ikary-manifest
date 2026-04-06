# Compilation

Compilation takes a validated manifest and produces a normalized, runtime-ready object. It derives form fields, builds path registries, and ensures all optional arrays exist.

## Package

::: code-group

```text [Node.js]
@ikary-manifest/engine   (contracts/node/engine/)
```

```text [Python]
# Compilation: coming soon
```

:::

## Install

::: code-group

```bash [Node.js]
pnpm add @ikary-manifest/engine
```

<LangComingSoon />

:::

## `compileCellApp(manifest)`

The main entry point. Takes a validated `CellManifestV1`, runs schema validation and business rules, normalizes the manifest, and returns a compiled manifest.

::: code-group

```typescript [Node.js]
import { compileCellApp, isValidationResult } from '@ikary-manifest/engine';
import type { CellManifestV1 } from '@ikary-manifest/contract';

const result = compileCellApp(manifest);

if (isValidationResult(result)) {
  console.error('Errors:', result.errors);
} else {
  // result is a normalized CellManifestV1
  console.log(result.spec.entities);
}
```

<LangComingSoon />

:::

## `normalizeManifest(manifest)`

Ensures all optional arrays exist (entities, pages, navigation items). Prevents undefined access in downstream code.

::: code-group

```typescript [Node.js]
import { normalizeManifest } from '@ikary-manifest/engine';

const normalized = normalizeManifest(manifest);
```

<LangComingSoon />

:::

## Field derivation

::: code-group

```typescript [Node.js]
import { deriveCreateFields, deriveEditFields } from '@ikary-manifest/engine';

// Derive fields for a create form (filtered, sorted, with effective properties)
const createFields = deriveCreateFields(entity.fields);

// Derive fields for an edit form
const editFields = deriveEditFields(entity.fields);
```

<LangComingSoon />

:::

## Path builders

::: code-group

```typescript [Node.js]
import {
  buildEntityListPath,
  buildEntityDetailPath,
  buildEntityCreatePath,
  buildEntityEditPath,
} from '@ikary-manifest/engine';

buildEntityListPath(manifest, 'customer');           // "/crm/customers"
buildEntityDetailPath(manifest, 'customer', '123'); // "/crm/customers/123"
```

<LangComingSoon />

:::

## Design

Engine is stateless and pure: no I/O, no YAML dependency, no React. It accepts a manifest object and returns a transformed manifest object. Consumers compose loader and engine as needed.
