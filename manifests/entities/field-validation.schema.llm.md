# field-validation.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **FieldValidation** schema, located at `manifests/entities/field-validation.schema.yaml`. It defines the validation rules attached to a single field as an array of field rule references. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates that `fieldRules` is an array of objects conforming to the referenced field-rule schema.
- Rejects unknown properties via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of validation state or error messages.
- Backend execution of validation logic.
- Transport layer concerns (HTTP, gRPC, file I/O).
- Business logic beyond structural schema validation.
- Validation of individual field-rule internals (owned by `field-rule.schema.yaml`).

## 4. Runtime Inputs

- `fieldRules` -- array, optional, items validated by `field-rule.schema.yaml`

## 5. Primitive Composition

- `$ref: "./field-rule.schema.yaml"` for each item in the `fieldRules` array.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/entities/field-validation.schema.yaml` -- YAML schema source
- `manifests/entities/field-validation.schema.md` -- human-readable documentation
- `manifests/entities/field-validation.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/entity/field/FieldValidationSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
