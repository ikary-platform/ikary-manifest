# Loading & Validation

Loading a manifest means reading it from YAML or JSON, validating its structure against the schema, and checking its business rules.

## Packages

```text
@ikary/loader   : file and string I/O, YAML/JSON parsing, meta-property stripping
@ikary/contract : Zod schemas, TypeScript types, structural and semantic validation
```

## Install

```bash
pnpm add @ikary/loader @ikary/contract
```

## Load from file

```typescript
import { loadManifestFromFile } from '@ikary/loader';

const result = await loadManifestFromFile('my-app.yaml');

if (result.valid) {
  console.log(result.manifest); // CellManifestV1
} else {
  console.error(result.errors);
}
```

## Load from string

```typescript
import { loadManifestFromYaml } from '@ikary/loader';

const result = loadManifestFromYaml(`
apiVersion: ikary.co/v1alpha1
kind: Cell
metadata:
  key: my_app
  name: My App
  version: "1.0.0"
spec:
  mount:
    mountPath: /
    landingPage: dash
  pages:
    - key: dash
      type: dashboard
      title: Dashboard
      path: /dashboard
`);

if (result.valid) {
  console.log(result.manifest);
}
```

## Validation

Validation runs in two stages. Structural validation checks types, required fields, and patterns. Semantic validation checks business rules: unique entity keys, valid lifecycle transitions, consistent cross-references.

```typescript
// loadManifestFromFile runs both stages by default.
// Skip semantic validation with structuralOnly:
const result = await loadManifestFromFile('app.yaml', {
  structuralOnly: true,
});

// Run validation directly on an already-parsed object:
import { validateManifest } from '@ikary/contract';

const result = validateManifest(unknownObject);
// result.valid, result.errors, result.manifest
```

## Result type

```typescript
interface LoadManifestResult {
  valid: boolean;
  errors: ValidationError[];   // { field: string; message: string }
  manifest?: CellManifestV1;   // Present when valid is true
  raw?: unknown;               // The raw parsed object before validation
}
```

## Meta-property handling

The loader strips YAML/JSON Schema meta-properties before Zod validation runs:

- **`$schema`**: authoring hint, removed from root and all nested objects
- **`$ref`**: unresolved file references in entity arrays are filtered out

This allows manifests to use `$schema` declarations and `$ref` composition without affecting strict-mode Zod parsing.

## TypeScript types

All TypeScript types are inferred from Zod schemas via `z.infer`. No separate type definitions exist alongside the schemas.

```typescript
import type {
  CellManifestV1,
  EntityDefinition,
  FieldDefinition,
  RelationDefinition,
  PageDefinition,
  NavigationDefinition,
  RoleDefinition,
  ValidationError,
  ValidationResult,
} from '@ikary/contract';
```

## API contracts

`@ikary/contract` also exports HTTP route parameter types, query shapes, and response shapes for use in API handlers:

```typescript
import {
  EntityRouteParams,
  EntityListQuery,
  PaginatedResponse,
  SingleResponse,
} from '@ikary/contract';
```

## Design

`@ikary/contract` is pure: no filesystem access, no YAML dependency, no React. It is a validation and type library. File I/O belongs in the loader; rendering belongs in the UI packages.
