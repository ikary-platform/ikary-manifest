# DomainEventActorSchema

## Purpose

Identifies who or what triggered a domain event.

## Responsibilities

- Validate the actor's identity fields (`id`, `type`) as required.
- Accept optional display fields (`name`, `email`) and an open metadata bag (`meta`).
- Delegate actor type validation to `DomainEventActorTypeSchema`.

## Non-Goals

- Does not authenticate the actor.
- Does not resolve actor details from an external directory or user store.

## Contract Surface

- **Schema file:** `contracts/node/contract/src/contract/manifest/domain-event/DomainEventActorSchema.ts`
- **Schema type:** Zod object (TypeScript only, no YAML counterpart)
- **Imported dependencies:** `DomainEventActorTypeSchema`

| Field   | Type                           | Required | Constraint              |
|---------|--------------------------------|----------|-------------------------|
| `id`    | `z.string()`                   | yes      | `.min(1)`               |
| `type`  | `DomainEventActorTypeSchema`   | yes      | enum                    |
| `name`  | `z.string()`                   | no       |                         |
| `email` | `z.string()`                   | no       | `.email()`              |
| `meta`  | `z.record(z.unknown())`        | no       | open key-value bag      |

## Validation Notes

- `id` must be a non-empty string.
- `email`, when present, must pass Zod's built-in email format check.
- `meta` accepts any JSON-serializable values. Consumers should not rely on specific keys.

## Example

```ts
import { DomainEventActorSchema } from './DomainEventActorSchema';

const actor = DomainEventActorSchema.parse({
  id: 'usr_abc123',
  type: 'user',
  name: 'Alice',
  email: 'alice@example.com',
});
```
