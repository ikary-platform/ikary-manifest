# ValidationScopeSchema

Categorizes where a validation issue applies within the manifest pipeline.

**TypeScript source:** `src/semantic/ValidationScopeSchema.ts`

---

## Purpose

Defines a closed set of validation scopes. Each scope tells consumers which layer of the system produced the issue.

## Responsibilities

- Constrain scope values to a known set via a Zod enum.
- Give validators and UI surfaces a shared vocabulary for classifying issues.

## Non-Goals

- Does not define behavior per scope.
- Does not control execution order of validators.

## Contract Surface

```typescript
z.enum([
  'field',
  'entity',
  'cross_entity',
  'lifecycle',
  'persistence',
  'authorization',
])
```

| Value           | Meaning                                  |
|-----------------|------------------------------------------|
| `field`         | Single-field constraint violation         |
| `entity`        | Entity-level rule failure                 |
| `cross_entity`  | Rule spanning multiple entities           |
| `lifecycle`     | State-transition or lifecycle constraint  |
| `persistence`   | Storage or write-path error               |
| `authorization` | Permission or access control violation    |

The inferred type is `ValidationScope`.

## Validation Notes

Zod rejects any string not in the enum. No default value is applied.

## Example

```typescript
import type { ValidationScope } from './ValidationScopeSchema';

const scope: ValidationScope = 'field';
const scope2: ValidationScope = 'cross_entity';
```
