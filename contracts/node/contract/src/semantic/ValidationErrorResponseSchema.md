# ValidationErrorResponseSchema

Wraps an array of validation issues into a single API response envelope.

**TypeScript source:** `src/semantic/ValidationErrorResponseSchema.ts`
**References:** `ValidationIssueSchema`

---

## Purpose

Defines the response shape returned when validation fails. API consumers receive this envelope containing all collected issues from a validation pass.

## Responsibilities

- Fix the `error` field to the literal `'VALIDATION_FAILED'`.
- Carry a `requestId` for traceability.
- Hold an array of `ValidationIssue` objects.

## Non-Goals

- Does not define success responses.
- Does not define transport-level details (HTTP status codes, headers).

## Contract Surface

```typescript
z.object({
  error:     z.literal('VALIDATION_FAILED'),   // fixed discriminator
  requestId: z.string(),                        // request trace ID
  issues:    z.array(ValidationIssueSchema),    // collected issues
})
```

| Field       | Type                  | Required | Description                              |
|-------------|-----------------------|----------|------------------------------------------|
| `error`     | `'VALIDATION_FAILED'` | yes      | Literal discriminator for this response  |
| `requestId` | `string`              | yes      | Trace ID linking to the original request |
| `issues`    | `ValidationIssue[]`   | yes      | All issues found during validation       |

The inferred type is `ValidationErrorResponse`.

## Validation Notes

- `error` must be the exact string `'VALIDATION_FAILED'`. Zod rejects any other value.
- `issues` can be an empty array. The schema does not enforce a minimum length.

## Example

```json
{
  "error": "VALIDATION_FAILED",
  "requestId": "req_abc123",
  "issues": [
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
  ]
}
```
