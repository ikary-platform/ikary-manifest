# entity-definition.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **EntityDefinition** schema, located at `manifests/entities/entity-definition.schema.yaml`. It validates a domain entity with its fields, relations, computed values, lifecycle, events, capabilities, policies, and validation rules. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates `key` as a snake-case identifier matching `^[a-z][a-z0-9_]*$`.
- Validates `name` and `pluralName` as non-empty strings.
- Validates `fields` as a non-empty array, delegating each item to the field-definition schema.
- Validates `relations` as an optional array, delegating each item to the relation-definition schema.
- Validates `computed` as an optional array, delegating each item to the computed-field schema.
- Delegates `lifecycle` validation to the lifecycle schema.
- Delegates `events` validation to the event schema.
- Validates `capabilities` as an optional array, delegating each item to the capability-definition schema.
- Delegates `policies` validation to `policy.schema.yaml#/definitions/EntityPoliciesDefinition`.
- Delegates `fieldPolicies` validation to `policy.schema.yaml#/definitions/FieldPoliciesDefinition`.
- Delegates `validation` to the entity-validation schema.
- Validates `governance` as an optional object with `tier` (enum: tier-1, tier-2, tier-3), `rollbackEnabled` (boolean), and `maxRollbackDepth` (integer, minimum 1).
- Requires `key`, `name`, `pluralName`, and `fields`.
- Rejects unknown properties via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of entity data.
- Backend CRUD execution or persistence.
- Transport layer concerns.
- Business logic beyond structural schema validation.
- Validation of individual field, relation, or policy internals (owned by child schemas).

## 4. Runtime Inputs

- `key` -- string, required, pattern `^[a-z][a-z0-9_]*$`
- `name` -- string, required, minLength 1
- `pluralName` -- string, required, minLength 1
- `fields` -- array, required, minItems 1, each validated by `field-definition.schema.yaml`
- `relations` -- array, optional, each validated by `relation-definition.schema.yaml`
- `computed` -- array, optional, each validated by `computed-field.schema.yaml`
- `lifecycle` -- object, optional, validated by `lifecycle.schema.yaml`
- `events` -- object, optional, validated by `event.schema.yaml`
- `capabilities` -- array, optional, each validated by `capability-definition.schema.yaml`
- `policies` -- object, optional, validated by `policy.schema.yaml#/definitions/EntityPoliciesDefinition`
- `fieldPolicies` -- object, optional, validated by `policy.schema.yaml#/definitions/FieldPoliciesDefinition`
- `validation` -- object, optional, validated by `entity-validation.schema.yaml`
- `governance` -- object, optional, containing `tier`, `rollbackEnabled`, `maxRollbackDepth`

## 5. Primitive Composition

- `$ref: "./field-definition.schema.yaml"` for each `fields[]` item.
- `$ref: "./relation-definition.schema.yaml"` for each `relations[]` item.
- `$ref: "./computed-field.schema.yaml"` for each `computed[]` item.
- `$ref: "./lifecycle.schema.yaml"` for the `lifecycle` property.
- `$ref: "./event.schema.yaml"` for the `events` property.
- `$ref: "./capability-definition.schema.yaml"` for each `capabilities[]` item.
- `$ref: "./policy.schema.yaml#/definitions/EntityPoliciesDefinition"` for `policies`.
- `$ref: "./policy.schema.yaml#/definitions/FieldPoliciesDefinition"` for `fieldPolicies`.
- `$ref: "./entity-validation.schema.yaml"` for the `validation` property.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/entities/entity-definition.schema.yaml` -- YAML schema source
- `manifests/entities/entity-definition.schema.md` -- human-readable documentation
- `manifests/entities/entity-definition.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/entity/EntityDefinitionSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
