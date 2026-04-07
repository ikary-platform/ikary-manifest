# Capability Input

Defines an input parameter for a capability action form. Each input declares a field that the user fills in when triggering a capability.

## Responsibilities

- Declare the key, type, and label for each input field.
- Constrain select inputs to a fixed set of options.
- Link entity-type inputs to a target entity definition.
- Mark inputs as required or provide a default value.

## Non-Goals

- Does not validate field values at runtime. Validation is handled separately.
- Does not define layout or rendering. The UI layer interprets the input list.

## Schema Surface

- `capability-input.schema.yaml`
- Referenced by: `capability-definition.schema.yaml`

## Properties

**Required:**

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | Unique identifier for the input. |
| `type` | enum | One of: `string`, `text`, `number`, `boolean`, `date`, `select`, `entity`. |

**Optional:**

| Property | Type | Description |
|----------|------|-------------|
| `label` | string | Display label for the input. |
| `required` | boolean | Whether the user must provide a value. |
| `defaultValue` | any | Pre-filled value for the input. |
| `options` | array of strings | Allowed values when `type` is `select`. Must have at least one item. Items must be unique. |
| `entity` | string | Target entity key when `type` is `entity`. |

## Validation Notes

- `additionalProperties` is `false`.
- `options` requires `minItems: 1` and `uniqueItems: true`.
- All string properties require `minLength: 1`.

## Example

```yaml
inputs:
  - key: reason
    type: text
    label: Rejection Reason
    required: true
  - key: severity
    type: select
    label: Severity
    options: [low, medium, high]
```
