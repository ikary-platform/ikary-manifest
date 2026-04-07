# DomainEventEntityRefSchema

## Purpose

Provides a normalized reference to an entity type and identifier inside event payloads.

## Responsibilities

- Validate that both `entityType` and `entityId` are present and non-empty.
- Give event consumers a consistent way to locate the affected entity.

## Non-Goals

- Does not verify that the referenced entity exists.
- Does not carry the entity's data. The envelope's `payload` field holds that.

## Contract Surface

- **Schema file:** `contracts/node/contract/src/contract/manifest/domain-event/DomainEventEntityRefSchema.ts`
- **Schema type:** Zod object (TypeScript only, no YAML counterpart)
- **Imported dependencies:** none

| Field        | Type          | Required | Constraint |
|--------------|---------------|----------|------------|
| `entityType` | `z.string()`  | yes      | `.min(1)`  |
| `entityId`   | `z.string()`  | yes      | `.min(1)`  |

## Validation Notes

- Both fields reject empty strings.
- No format constraint is applied to `entityId`. UUIDs, slugs, and numeric strings are all valid.

## Example

```ts
import { DomainEventEntityRefSchema } from './DomainEventEntityRefSchema';

const ref = DomainEventEntityRefSchema.parse({
  entityType: 'Invoice',
  entityId: 'inv_00042',
});
```
