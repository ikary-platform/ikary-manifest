# entity-validation.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **EntityValidation** schema, located at `manifests/entities/entity-validation.schema.yaml`. It defines entity-level validation rules and cross-entity server validators using inline definitions. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates that `entityRules` is an array of `entity_invariant` rule objects.
- Requires each entity rule to contain `ruleId`, `type`, `paths`, `messageKey`, `clientSafe`, `blocking`, and `severity`.
- Enforces `type: entity_invariant` as a constant on entity rules.
- Validates that `paths` is a non-empty array of strings on each entity rule.
- Validates that `serverValidators` is an array of cross-entity/lifecycle/persistence_preview validator objects.
- Requires each server validator to contain `ruleId`, `type`, `validatorRef`, `messageKey`, `clientSafe`, `async`, `blocking`, and `severity`.
- Enforces `clientSafe: false` and `async: true` as constants on server validators.
- Restricts server validator `type` to the enum: cross_entity, lifecycle, persistence_preview.
- Rejects unknown properties on all objects via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of validation state or error messages.
- Backend execution of entity rules or server validators.
- Transport layer concerns (HTTP, gRPC, file I/O).
- Business logic beyond structural schema validation.

## 4. Runtime Inputs

- `entityRules` -- array, optional
  - `entityRules[].ruleId` -- string, required, minLength 1
  - `entityRules[].type` -- const: entity_invariant
  - `entityRules[].paths` -- array of strings, required, minItems 1
  - `entityRules[].messageKey` -- string, required, minLength 1
  - `entityRules[].defaultMessage` -- string, optional
  - `entityRules[].clientSafe` -- boolean, required
  - `entityRules[].blocking` -- boolean, required
  - `entityRules[].severity` -- string, required, enum: error | warning
  - `entityRules[].validatorRef` -- string, optional
- `serverValidators` -- array, optional
  - `serverValidators[].ruleId` -- string, required, minLength 1
  - `serverValidators[].type` -- string, required, enum: cross_entity | lifecycle | persistence_preview
  - `serverValidators[].validatorRef` -- string, required, minLength 1
  - `serverValidators[].messageKey` -- string, required, minLength 1
  - `serverValidators[].defaultMessage` -- string, optional
  - `serverValidators[].clientSafe` -- const: false
  - `serverValidators[].async` -- const: true
  - `serverValidators[].blocking` -- boolean, required
  - `serverValidators[].severity` -- string, required, enum: error | warning
  - `serverValidators[].targetPaths` -- array of strings, optional

## 5. Primitive Composition

Self-contained. All object shapes are defined inline. No external `$ref` schemas are referenced.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/entities/entity-validation.schema.yaml` -- YAML schema source
- `manifests/entities/entity-validation.schema.md` -- human-readable documentation
- `manifests/entities/entity-validation.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/entity/EntityValidationSchema.ts` -- TypeScript mirror
- `contracts/node/contract/src/contract/entity/EntityRuleDefinitionSchema.ts` -- TypeScript mirror
- `contracts/node/contract/src/contract/entity/CrossEntityValidatorRefSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
