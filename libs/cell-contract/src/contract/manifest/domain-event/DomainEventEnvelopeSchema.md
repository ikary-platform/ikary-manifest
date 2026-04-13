# DomainEventEnvelopeSchema

## Purpose

Defines the transport envelope for domain events. Audit logs and timeline surfaces consume this shape.

## Responsibilities

- Validate the core event identity (`eventId`, `eventType`, `timestamp`).
- Embed a validated `actor` and `entity` reference via composed schemas.
- Accept optional tenant, workspace, and correlation identifiers for multi-tenant routing.
- Carry an open `payload` and `meta` bag for event-specific data.

## Non-Goals

- Does not define event-specific payload schemas. Each event type owns its own payload shape.
- Does not handle event dispatch, ordering, or delivery guarantees.

## Contract Surface

- **Schema file:** `contracts/node/contract/src/contract/manifest/domain-event/DomainEventEnvelopeSchema.ts`
- **Schema type:** Zod object (TypeScript only, no YAML counterpart)
- **Imported dependencies:** `DomainEventActorSchema`, `DomainEventEntityRefSchema`

| Field           | Type                             | Required | Constraint          |
|-----------------|----------------------------------|----------|---------------------|
| `eventId`       | `z.string()`                     | yes      | `.uuid()`           |
| `eventType`     | `z.string()`                     | yes      | `.min(1)`           |
| `timestamp`     | `z.string()`                     | yes      | `.datetime()`       |
| `actor`         | `DomainEventActorSchema`         | yes      | composed object     |
| `entity`        | `DomainEventEntityRefSchema`     | yes      | composed object     |
| `tenantId`      | `z.string()`                     | no       |                     |
| `workspaceId`   | `z.string()`                     | no       |                     |
| `correlationId` | `z.string()`                     | no       |                     |
| `payload`       | `z.record(z.unknown())`          | no       | open key-value bag  |
| `meta`          | `z.record(z.unknown())`          | no       | open key-value bag  |

## Validation Notes

- `eventId` must be a valid UUID (v4 or any version accepted by Zod's `.uuid()`).
- `timestamp` must be an ISO 8601 datetime string.
- `actor` and `entity` are validated recursively through their own schemas.
- `payload` and `meta` accept any JSON-serializable values.

## Example

```ts
import { DomainEventEnvelopeSchema } from './DomainEventEnvelopeSchema';

const envelope = DomainEventEnvelopeSchema.parse({
  eventId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  eventType: 'invoice.created',
  timestamp: '2026-04-07T12:00:00Z',
  actor: {
    id: 'usr_abc123',
    type: 'user',
  },
  entity: {
    entityType: 'Invoice',
    entityId: 'inv_00042',
  },
  tenantId: 'tenant_01',
  payload: {
    amount: 250,
    currency: 'USD',
  },
});
```
