# ValidationSeveritySchema

Classifies the severity of a validation issue as either an error or a warning.

**TypeScript source:** `src/shared/ValidationSeveritySchema.ts`

---

## Purpose

Defines a two-member Zod enum for validation severity. Consumers use this value to decide how to handle a reported issue.

## Responsibilities

- Constrain severity to `'error'` or `'warning'` via a Zod enum.
- Give validators and UI result surfaces a shared severity vocabulary.

## Non-Goals

- Does not determine whether an issue blocks submission. That decision belongs to the `blocking` field on `ValidationIssueSchema`.

## Contract Surface

```typescript
z.enum(['error', 'warning'])
```

| Value     | Meaning                                          |
|-----------|--------------------------------------------------|
| `error`   | The issue blocks submission.                     |
| `warning` | The issue is advisory and does not block submission. |

The inferred type is `ValidationSeverity`.

## Validation Notes

Zod rejects any string not in the enum. No default value is applied.

## Example

```typescript
import type { ValidationSeverity } from './ValidationSeveritySchema';

const severity: ValidationSeverity = 'error';
```
