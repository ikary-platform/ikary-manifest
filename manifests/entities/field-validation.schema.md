# Field Validation

Groups validation rules for a single field. The schema wraps an array of field rules that the validation engine evaluates against the field value.

## Responsibilities

- Collect one or more field-level validation rules into a single definition.
- Reference `field-rule.schema.yaml` for each rule in the array.

## Non-Goals

- Does not define the rules themselves. Each rule is declared in `field-rule.schema.yaml`.
- Does not handle entity-level or cross-field validation. Use `entity-validation.schema.yaml` for that.

## Schema Surface

- `field-validation.schema.yaml`
- References: `field-rule.schema.yaml`

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `fieldRules` | array of `$ref field-rule.schema.yaml` | no | The validation rules to apply to this field. |

## Validation Notes

- `additionalProperties` is `false`.
- Each item in `fieldRules` must conform to `field-rule.schema.yaml`.

## Example

```yaml
validation:
  fieldRules:
    - ruleId: email_required
      type: required
      field: email
      messageKey: validation.email.required
      clientSafe: true
      blocking: true
      severity: error
```
