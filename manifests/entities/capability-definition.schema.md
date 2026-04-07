# Capability Definition

Declares an action that an entity supports. Each capability is discriminated on the `type` field with five variants: `transition`, `mutation`, `workflow`, `export`, and `integration`.

## Responsibilities

- Define the available actions users can perform on an entity.
- Discriminate action behavior through the `type` field.
- Attach optional input forms to actions via capability inputs.
- Control visibility, confirmation prompts, and scope per action.

## Non-Goals

- Does not execute the action. Runtime interprets the definition.
- Does not enforce access control. Use `policy.schema.yaml` for that.
- Does not define the input schema itself. Inputs reference `capability-input.schema.yaml`.

## Schema Surface

- `capability-definition.schema.yaml`
- References: `capability-input.schema.yaml`

## Variants

All variants require `key` (string) and `type` (const per variant).

All variants share these optional properties:
- `description` (string)
- `icon` (string)
- `visible` (boolean)
- `confirm` (boolean)
- `scope` (enum: `entity`, `selection`, `global`)
- `inputs` (array of `$ref capability-input.schema.yaml`)

**transition** requires `transition` (string). The value must reference a declared lifecycle transition key.

**mutation** requires `updates` (object). The object holds the field-value pairs to apply.

**workflow** requires `workflow` (string). The value references a workflow definition key.

**export** requires `format` (enum: `pdf`, `csv`, `xlsx`, `json`).

**integration** requires `provider` (string). Accepts an optional `operation` (string).

## Validation Notes

- The schema uses `oneOf` to enforce exactly one variant match.
- `additionalProperties` is `false` on every variant.
- All string properties require `minLength: 1`.

## Example

```yaml
- key: approve
  type: transition
  transition: approve
  description: Approve this request
  icon: check
  confirm: true
  scope: entity
```
