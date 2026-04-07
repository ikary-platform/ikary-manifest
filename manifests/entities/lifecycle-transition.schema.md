# Lifecycle Transition

Describes a single state transition within an entity lifecycle.
Each transition connects a source state to a target state and can carry guards, hooks, and an event name.

## Responsibilities

- Maps one state to another through a named transition.
- Attaches guard functions that must pass before the transition executes.
- Attaches hook functions that run after the transition completes.
- Publishes a domain event when the transition fires.

## Non-Goals

- Does not define the full state machine. The lifecycle schema owns the state list and initial state.
- Does not implement guard or hook logic. The runtime resolves those by name.

## Schema Surface

Defined in [`lifecycle-transition.schema.yaml`](./lifecycle-transition.schema.yaml).
Referenced by [`lifecycle.schema.yaml`](./lifecycle.schema.yaml).

## Validation Notes

| Field    | Type     | Required | Constraint                              |
|----------|----------|----------|-----------------------------------------|
| `key`    | `string` | Yes      | Unique identifier for the transition    |
| `from`   | `string` | Yes      | Source state                            |
| `to`     | `string` | Yes      | Target state                            |
| `label`  | `string` | No       | Human-readable label for UIs            |
| `guards` | `array`  | No       | Array of guard function names           |
| `hooks`  | `array`  | No       | Array of hook function names            |
| `event`  | `string` | No       | Domain event name emitted on transition |

## Example

```yaml
- key: approve
  from: pending
  to: approved
  label: Approve Request
  guards: [isManager]
  hooks: [sendNotification]
  event: request.approved
```
