# Compilation

Compilation takes a validated manifest and produces a normalized, runtime-ready object. It derives form fields, builds path registries, and ensures all optional arrays exist.

## Package

```text
@ikary/cell-engine   (contracts/node/engine/)
```

## Install

```bash
pnpm add @ikary/cell-engine
```

## `compileCellApp(manifest)`

The main entry point. Takes a validated `CellManifestV1`, runs schema validation and business rules, normalizes the manifest, and returns a compiled manifest.

```typescript
import { compileCellApp, isValidationResult } from '@ikary/cell-engine';
import type { CellManifestV1 } from '@ikary/cell-contract';

const result = compileCellApp(manifest);

if (isValidationResult(result)) {
  console.error('Errors:', result.errors);
} else {
  // result is a normalized CellManifestV1
  console.log(result.spec.entities);
}
```

## `normalizeManifest(manifest)`

Ensures all optional arrays exist (entities, pages, navigation items). Prevents undefined access in downstream code.

```typescript
import { normalizeManifest } from '@ikary/cell-engine';

const normalized = normalizeManifest(manifest);
```

## Field derivation

```typescript
import { deriveCreateFields, deriveEditFields } from '@ikary/cell-engine';

// Derive fields for a create form (filtered, sorted, with effective properties)
const createFields = deriveCreateFields(entity.fields);

// Derive fields for an edit form
const editFields = deriveEditFields(entity.fields);
```

## Path builders

```typescript
import {
  buildEntityListPath,
  buildEntityDetailPath,
  buildEntityCreatePath,
  buildEntityEditPath,
} from '@ikary/cell-engine';

buildEntityListPath(manifest, 'customer');           // "/crm/customers"
buildEntityDetailPath(manifest, 'customer', '123'); // "/crm/customers/123"
```

## Design

Engine is stateless and pure: no I/O, no YAML dependency, no React. It accepts a manifest object and returns a transformed manifest object. Consumers compose loader and engine as needed.
