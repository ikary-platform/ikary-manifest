# Lifecycle

Defines a state machine for an entity.
The lifecycle tracks which states an entity can occupy and which transitions move it between them.

## Responsibilities

- Names the entity field that holds the current state.
- Sets the initial state for new records.
- Enumerates all valid states.
- References transition definitions that control movement between states.

## Non-Goals

- Does not define transition guards, hooks, or events. The lifecycle-transition schema owns those.
- Does not enforce state persistence or history tracking.

## Schema Surface

Defined in [`lifecycle.schema.yaml`](./lifecycle.schema.yaml).
Transitions reference [`lifecycle-transition.schema.yaml`](./lifecycle-transition.schema.yaml).

## Validation Notes

| Field         | Type     | Required | Constraint                                          |
|---------------|----------|----------|-----------------------------------------------------|
| `field`       | `string` | Yes      | Names the entity field holding the current state     |
| `initial`     | `string` | Yes      | Must be one of the values listed in `states`         |
| `states`      | `array`  | Yes      | Array of strings, `minItems: 2`                      |
| `transitions` | `array`  | Yes      | Array of `$ref: lifecycle-transition.schema.yaml`    |

The `states` array must contain at least two entries.

## Example

```yaml
lifecycle:
  field: status
  initial: draft
  states: [draft, active, archived]
  transitions:
    - key: activate
      from: draft
      to: active
```
