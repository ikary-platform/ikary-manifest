# DomainEventActorTypeSchema

## Purpose

Restricts the type of actor that triggered a domain event to a fixed set of known values.

## Responsibilities

- Validate that the actor type is one of `'user'`, `'system'`, `'automation'`, `'webhook'`, or `'migration'`.
- Reject any value outside the enum.

## Non-Goals

- Does not describe the actor itself. See `DomainEventActorSchema` for that.
- Does not assign permissions or roles based on actor type.

## Contract Surface

- **Schema file:** `contracts/node/contract/src/contract/manifest/domain-event/DomainEventActorTypeSchema.ts`
- **Schema type:** Zod enum (TypeScript only, no YAML counterpart)
- **Imported dependencies:** none

```ts
z.enum(['user', 'system', 'automation', 'webhook', 'migration'])
```

## Validation Notes

- The value must be an exact string match against one of the five members.
- Zod's `.enum()` rejects `undefined`, `null`, and any string not in the list.

## Example

```ts
import { DomainEventActorTypeSchema } from './DomainEventActorTypeSchema';

DomainEventActorTypeSchema.parse('user');        // OK
DomainEventActorTypeSchema.parse('automation');   // OK
DomainEventActorTypeSchema.parse('cron');         // throws ZodError
```
