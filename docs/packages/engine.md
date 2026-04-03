# @ikary-manifest/engine

Manifest compilation, normalization, field derivation, and path building.

## Install

```bash
pnpm add @ikary-manifest/engine
```

## API

### `compileCellApp(manifest)`

The main entry point. Takes a validated `CellManifestV1`, runs schema validation, business rules, normalization, and returns a compiled manifest.

```typescript
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

### `normalizeManifest(manifest)`

Ensures all optional arrays exist (entities, pages, navigation items). Prevents undefined access in downstream code.

### Field derivation

```typescript
import { deriveCreateFields, deriveEditFields } from '@ikary-manifest/engine';

// Derive fields for a create form (filtered, sorted, with effective properties)
const createFields = deriveCreateFields(entity.fields);

// Derive fields for an edit form
const editFields = deriveEditFields(entity.fields);
```

### Path builders

```typescript
import {
  buildEntityListPath,
  buildEntityDetailPath,
  buildEntityCreatePath,
  buildEntityEditPath,
} from '@ikary-manifest/engine';

buildEntityListPath(manifest, 'customer');           // "/crm/customers"
buildEntityDetailPath(manifest, 'customer', '123');  // "/crm/customers/123"
```

## Design principle

Engine is **stateless and pure** -- no I/O, no YAML dependency, no React. It accepts a manifest object and returns a transformed manifest object. Consumers compose loader + engine as needed.
