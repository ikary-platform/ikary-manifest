# Event

Controls which entity mutations emit audit events and how those events are named.
An entity can exclude sensitive fields from event payloads and override the default event names.

## Responsibilities

- Excludes specified fields from event payloads.
- Maps mutation types (`created`, `updated`, `deleted`) to custom event name strings.

## Non-Goals

- Does not define event transport or delivery guarantees. The platform event bus handles those.
- Does not filter which mutations trigger events. All three mutation types always emit if configured.

## Schema Surface

Defined in [`event.schema.yaml`](./event.schema.yaml).

## Validation Notes

| Field              | Type     | Required | Constraint                                |
|--------------------|----------|----------|-------------------------------------------|
| `exclude`          | `array`  | No       | Array of field key strings                |
| `names`            | `object` | No       | Object with `created`, `updated`, `deleted` keys |
| `names.created`    | `string` | No       | Custom event name for creation            |
| `names.updated`    | `string` | No       | Custom event name for updates             |
| `names.deleted`    | `string` | No       | Custom event name for deletion            |

Fields listed in `exclude` are stripped from the event payload before publishing.

## Example

```yaml
events:
  exclude: [internalNotes, tempData]
  names:
    created: invoice.created
    updated: invoice.updated
    deleted: invoice.deleted
```
