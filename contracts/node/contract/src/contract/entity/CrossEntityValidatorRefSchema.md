# CrossEntityValidatorRefSchema

## Purpose

References a server-side validator for cross-entity, lifecycle, and persistence-preview checks. These validators always run asynchronously and are never client-safe.

## Responsibilities

- Identify the rule (`ruleId`) and classify it as `'cross_entity'`, `'lifecycle'`, or `'persistence_preview'`.
- Point to a server-side validator by key (`validatorRef`).
- Carry a translatable `messageKey` with an optional `defaultMessage` fallback.
- Enforce that `async` is `true` and `clientSafe` is `false` at the schema level.

## Non-Goals

- Does not contain validator logic. The server resolves `validatorRef` to an implementation.
- Does not handle single-entity invariant rules. See `EntityRuleDefinitionSchema` for that.

## Contract Surface

- **Schema file:** `contracts/node/contract/src/contract/entity/CrossEntityValidatorRefSchema.ts`
- **Schema type:** Zod object (TypeScript only, no YAML counterpart)
- **Imported dependencies:** `ValidationSeveritySchema`

| Field            | Type                                                        | Required | Constraint                 |
|------------------|-------------------------------------------------------------|----------|----------------------------|
| `ruleId`         | `z.string()`                                                | yes      |                            |
| `type`           | `z.enum(['cross_entity', 'lifecycle', 'persistence_preview'])` | yes   | discriminator              |
| `validatorRef`   | `z.string()`                                                | yes      | server-side validator key  |
| `targetPaths`    | `z.array(z.string())`                                       | no       | affected field paths       |
| `messageKey`     | `z.string()`                                                | yes      | i18n key                   |
| `defaultMessage` | `z.string()`                                                | no       | fallback display text      |
| `severity`       | `ValidationSeveritySchema`                                  | yes      | `'error'` or `'warning'`  |
| `blocking`       | `z.boolean()`                                               | yes      |                            |
| `async`          | `z.literal(true)`                                           | yes      | always `true`              |
| `clientSafe`     | `z.literal(false)`                                          | yes      | always `false`             |

## Validation Notes

- `async` must be the literal `true`. The schema rejects `false`.
- `clientSafe` must be the literal `false`. The schema rejects `true`.
- These two literals encode an architectural constraint: cross-entity checks require server round-trips and must not run on the client.
- `type` accepts three values. Each maps to a different validation phase on the server.

## Example

```ts
import { CrossEntityValidatorRefSchema } from './CrossEntityValidatorRefSchema';

const ref = CrossEntityValidatorRefSchema.parse({
  ruleId: 'unique-email-across-orgs',
  type: 'cross_entity',
  validatorRef: 'validators/uniqueEmailAcrossOrgs',
  targetPaths: ['email'],
  messageKey: 'validation.emailNotUnique',
  defaultMessage: 'This email is already in use by another organization.',
  severity: 'error',
  blocking: true,
  async: true,
  clientSafe: false,
});
```
