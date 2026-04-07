# Field Rule

Declares a single validation rule for a field. Each rule identifies the check type, the target field, and the message to surface when validation fails.

## Responsibilities

- Specify the validation type and the field it applies to.
- Provide a message key for localized error messages.
- Carry optional parameters (for example, minimum length or regex pattern).
- Indicate whether the rule runs on the client, blocks submission, and its severity.

## Non-Goals

- Does not execute validation logic. The validation engine interprets the rule definition.
- Does not group rules. Use `field-validation.schema.yaml` to collect rules per field.

## Schema Surface

- `field-rule.schema.yaml`
- Referenced by: `field-validation.schema.yaml`

## Properties

**Required:**

| Property | Type | Description |
|----------|------|-------------|
| `ruleId` | string | Unique identifier for this rule. |
| `type` | enum | One of: `required`, `min_length`, `max_length`, `regex`, `enum`, `number_min`, `number_max`, `date`, `future_date`, `email`. |
| `field` | string | The field key this rule validates. |
| `messageKey` | string | Localization key for the validation message. |
| `clientSafe` | boolean | Whether this rule can run on the client. |
| `blocking` | boolean | Whether a violation blocks form submission. |
| `severity` | enum | One of: `error`, `warning`. |

**Optional:**

| Property | Type | Description |
|----------|------|-------------|
| `defaultMessage` | string | Fallback message when the localization key is missing. |
| `params` | object | Rule-specific parameters (for example, `{ min: 2 }` for `min_length`). |

## Validation Notes

- All seven properties listed under Required are enforced by the schema.
- `additionalProperties` is `false`.
- All string properties require `minLength: 1`.
- `params` allows `additionalProperties: true` for flexible rule configuration.

## Example

```yaml
- ruleId: name_min_length
  type: min_length
  field: name
  messageKey: validation.name.min_length
  params:
    min: 2
  clientSafe: true
  blocking: true
  severity: error
```
