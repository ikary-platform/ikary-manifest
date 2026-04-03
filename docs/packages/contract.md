# @ikary-manifest/contract

Zod schemas, TypeScript types, and validation for IKARY cell manifests.

This is the foundational package -- all other packages depend on it.

## Install

```bash
pnpm add @ikary-manifest/contract
```

## What it provides

### Zod schemas

Runtime-safe schemas for every manifest construct:

```typescript
import {
  CellManifestV1Schema,
  EntityDefinitionSchema,
  FieldDefinitionSchema,
  RelationDefinitionSchema,
  LifecycleDefinitionSchema,
  CapabilityDefinitionSchema,
  PageDefinitionSchema,
  RoleDefinitionSchema,
} from '@ikary-manifest/contract';

// Validate any object against the manifest schema
const result = CellManifestV1Schema.safeParse(unknownObject);
```

### TypeScript types

All types are derived from Zod schemas via `z.infer`, ensuring they are always in sync:

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
} from '@ikary-manifest/contract';
```

### Structural validation

```typescript
import { parseManifest } from '@ikary-manifest/contract';

const result = parseManifest(unknownObject);
// result.valid, result.errors, result.manifest
```

### Semantic validation

Business rules that Zod can't express:

```typescript
import { validateManifest } from '@ikary-manifest/contract';

const result = validateManifest(unknownObject);
// Checks: unique entity keys, valid lifecycle transitions,
// page-entity bindings, navigation references, role scopes, etc.
```

### API contracts

HTTP route parameters, query types, and response shapes:

```typescript
import {
  EntityRouteParams,
  EntityListQuery,
  PaginatedResponse,
  SingleResponse,
} from '@ikary-manifest/contract';
```

## Design principle

Contract is **pure** -- no filesystem access, no YAML dependency, no React. It is a validation and type library. I/O belongs in the loader; rendering belongs in the runtime packages.
