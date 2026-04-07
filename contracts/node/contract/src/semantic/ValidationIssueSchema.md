# ValidationIssueSchema

Describes a single normalized validation issue used by validators and UI result surfaces.

**TypeScript source:** `src/semantic/ValidationIssueSchema.ts`
**References:** `ValidationScopeSchema`, `ValidationSeveritySchema`

---

## Purpose

Defines the shape of one validation issue. Every validator in the pipeline produces issues in this format. UI surfaces and API responses consume it directly.

## Responsibilities

- Enforce required fields: `code`, `scope`, `entity`, `ruleId`, `messageKey`, `severity`, `blocking`, `retryable`.
- Accept optional fields: `defaultMessage`, `path`, `paths`, `meta`.
- Reuse `ValidationScopeSchema` and `ValidationSeveritySchema` for the `scope` and `severity` fields.

## Non-Goals

- Does not aggregate issues into a response envelope. That is the job of `ValidationErrorResponseSchema`.
- Does not execute validation logic.

## Contract Surface

```typescript
z.object({
  code:           z.string().min(1),              // machine-readable issue code
  scope:          ValidationScopeSchema,           // where the issue applies
  entity:         z.string().min(1),              // entity key
  ruleId:         z.string().min(1),              // originating rule ID
  messageKey:     z.string().min(1),              // i18n key
  defaultMessage: z.string().optional(),           // fallback message
  path:           z.string().optional(),           // single field path
  paths:          z.array(z.string()).optional(),   // multiple field paths
  severity:       ValidationSeveritySchema,        // error or warning
  blocking:       z.boolean(),                     // blocks submission if true
  retryable:      z.boolean(),                     // can be retried if true
  meta:           z.record(z.unknown()).optional(), // arbitrary metadata
})
```

| Field            | Type                           | Required | Description                        |
|------------------|--------------------------------|----------|------------------------------------|
| `code`           | `string` (min 1)               | yes      | Machine-readable issue code        |
| `scope`          | `ValidationScope`              | yes      | Classification of issue origin     |
| `entity`         | `string` (min 1)               | yes      | Target entity key                  |
| `ruleId`         | `string` (min 1)               | yes      | ID of the rule that fired          |
| `messageKey`     | `string` (min 1)               | yes      | i18n lookup key                    |
| `defaultMessage` | `string`                       | no       | Fallback when i18n key is missing  |
| `path`           | `string`                       | no       | Single field path                  |
| `paths`          | `string[]`                     | no       | Multiple field paths               |
| `severity`       | `ValidationSeverity`           | yes      | Error or warning                   |
| `blocking`       | `boolean`                      | yes      | Blocks submission when `true`      |
| `retryable`      | `boolean`                      | yes      | Can be retried when `true`         |
| `meta`           | `Record<string, unknown>`      | no       | Arbitrary metadata                 |

The inferred type is `ValidationIssue`.

## Validation Notes

- All required string fields enforce `min(1)`, so empty strings are rejected.
- `path` and `paths` are independent. A single-field issue typically sets `path`. A cross-entity issue may set `paths`.
- `meta` accepts any key-value pairs. Zod does not constrain the values.

## Example

```json
{
  "code": "FIELD_REQUIRED",
  "scope": "field",
  "entity": "invoice",
  "ruleId": "invoice_amount_required",
  "messageKey": "validation.invoice.amount.required",
  "path": "amount",
  "severity": "error",
  "blocking": true,
  "retryable": false
}
```
