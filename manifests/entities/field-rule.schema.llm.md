# field-rule.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **FieldRuleDefinition** schema, located at `manifests/entities/field-rule.schema.yaml`. It defines a single client- or server-side validation rule for a field. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates that `ruleId`, `type`, `field`, `messageKey`, `clientSafe`, `blocking`, and `severity` are all present.
- Restricts `type` to the enum: required, min_length, max_length, regex, enum, number_min, number_max, date, future_date, email.
- Validates that `ruleId`, `field`, and `messageKey` are non-empty strings.
- Accepts optional `defaultMessage` as a string.
- Accepts optional `params` as a free-form object.
- Validates `clientSafe` and `blocking` as booleans.
- Restricts `severity` to the enum: error, warning.
- Rejects unknown properties via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of validation errors or warnings.
- Backend execution of the validation rule.
- Transport layer concerns (HTTP, gRPC, file I/O).
- Business logic beyond structural schema validation.

## 4. Runtime Inputs

- `ruleId` -- string, required, minLength 1
- `type` -- string, required, enum: required | min_length | max_length | regex | enum | number_min | number_max | date | future_date | email
- `field` -- string, required, minLength 1
- `messageKey` -- string, required, minLength 1
- `defaultMessage` -- string, optional
- `params` -- object, optional, additionalProperties allowed
- `clientSafe` -- boolean, required
- `blocking` -- boolean, required
- `severity` -- string, required, enum: error | warning

## 5. Primitive Composition

Self-contained. No child `$ref` schemas are referenced.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/entities/field-rule.schema.yaml` -- YAML schema source
- `manifests/entities/field-rule.schema.md` -- human-readable documentation
- `manifests/entities/field-rule.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/entity/field/FieldRuleDefinitionSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
