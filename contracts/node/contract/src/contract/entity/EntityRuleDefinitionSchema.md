# EntityRuleDefinitionSchema

## Purpose

Declares a cross-field invariant rule within a single entity. The runtime uses these rules for client-safe, multi-field validation.

## Responsibilities

- Identify the rule (`ruleId`) and fix its type to `'entity_invariant'`.
- List the field paths involved so the UI can highlight affected inputs.
- Carry a translatable `messageKey` with an optional `defaultMessage` fallback.
- Mark whether the rule is `clientSafe`, `blocking`, and its severity level.

## Non-Goals

- Does not execute validation logic. The runtime reads these declarations and runs the checks.
- Does not handle cross-entity rules. See `CrossEntityValidatorRefSchema` for that.

## Contract Surface

- **Schema file:** `contracts/node/contract/src/contract/entity/EntityRuleDefinitionSchema.ts`
- **Schema type:** Zod object (TypeScript only, no YAML counterpart)
- **Imported dependencies:** `ValidationSeveritySchema`

| Field            | Type                          | Required | Constraint                   |
|------------------|-------------------------------|----------|------------------------------|
| `ruleId`         | `z.string()`                  | yes      |                              |
| `type`           | `z.literal('entity_invariant')` | yes   | fixed value                  |
| `paths`          | `z.array(z.string())`         | yes      | field paths involved         |
| `messageKey`     | `z.string()`                  | yes      | i18n key                     |
| `defaultMessage` | `z.string()`                  | no       | fallback display text        |
| `clientSafe`     | `z.boolean()`                 | yes      |                              |
| `blocking`       | `z.boolean()`                 | yes      |                              |
| `severity`       | `ValidationSeveritySchema`    | yes      | `'error'` or `'warning'`    |

## Validation Notes

- `type` is locked to the literal `'entity_invariant'`. Any other value fails.
- `paths` must be an array of strings. An empty array is structurally valid but semantically meaningless.
- `severity` delegates to `ValidationSeveritySchema`, which allows `'error'` or `'warning'`.

## Example

```ts
import { EntityRuleDefinitionSchema } from './EntityRuleDefinitionSchema';

const rule = EntityRuleDefinitionSchema.parse({
  ruleId: 'end-after-start',
  type: 'entity_invariant',
  paths: ['startDate', 'endDate'],
  messageKey: 'validation.endDateBeforeStart',
  defaultMessage: 'End date must be after start date.',
  clientSafe: true,
  blocking: true,
  severity: 'error',
});
```
