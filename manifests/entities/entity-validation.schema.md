# Entity Validation

Defines entity-level validation rules and server-side validators. These rules operate across multiple fields or across entities, unlike field-level rules which target a single field.

## Responsibilities

- Declare entity invariant rules that span multiple field paths.
- Register server-side validators for cross-entity, lifecycle, and persistence-preview checks.
- Specify whether each rule blocks submission and its severity.

## Non-Goals

- Does not handle single-field validation. Use `field-validation.schema.yaml` for that.
- Does not execute validation. The validation engine reads these definitions at runtime.

## Schema Surface

- `entity-validation.schema.yaml`

## Properties

### entityRules

An array of entity invariant rules. Each item requires:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `ruleId` | string | yes | Unique identifier for this rule. |
| `type` | const | yes | Always `entity_invariant`. |
| `paths` | array of strings | yes | Field paths involved in the invariant. Minimum one item. |
| `messageKey` | string | yes | Localization key for the validation message. |
| `clientSafe` | boolean | yes | Whether this rule can run on the client. |
| `blocking` | boolean | yes | Whether a violation blocks submission. |
| `severity` | enum | yes | One of: `error`, `warning`. |
| `defaultMessage` | string | no | Fallback message when the localization key is missing. |
| `validatorRef` | string | no | Reference to a named validator implementation. |

### serverValidators

An array of server-side validators. Each item requires:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `ruleId` | string | yes | Unique identifier for this validator. |
| `type` | enum | yes | One of: `cross_entity`, `lifecycle`, `persistence_preview`. |
| `validatorRef` | string | yes | Reference to the server-side validator implementation. |
| `messageKey` | string | yes | Localization key for the validation message. |
| `clientSafe` | const | yes | Always `false`. Server validators do not run on the client. |
| `async` | const | yes | Always `true`. Server validators run asynchronously. |
| `blocking` | boolean | yes | Whether a violation blocks submission. |
| `severity` | enum | yes | One of: `error`, `warning`. |
| `defaultMessage` | string | no | Fallback message when the localization key is missing. |
| `targetPaths` | array of strings | no | Field paths affected by this validator. |

## Validation Notes

- At least one of `entityRules` or `serverValidators` should be present for a meaningful definition.
- `additionalProperties` is `false` on all objects.
- `paths` in `entityRules` requires `minItems: 1`.
- Server validators fix `clientSafe` to `false` and `async` to `true`.

## Example

```yaml
validation:
  entityRules:
    - ruleId: date_range_valid
      type: entity_invariant
      paths: [startDate, endDate]
      messageKey: validation.date_range
      clientSafe: true
      blocking: true
      severity: error
  serverValidators:
    - ruleId: unique_email
      type: cross_entity
      validatorRef: uniqueEmailValidator
      messageKey: validation.email.unique
      clientSafe: false
      async: true
      blocking: true
      severity: error
```
