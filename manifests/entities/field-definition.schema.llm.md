# field-definition.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **FieldDefinition** schema, located at `manifests/entities/field-definition.schema.yaml`. It validates a single field on an entity, including nested object fields through recursive self-reference (max depth 3, enforced at runtime). This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates `key` as a snake-case identifier matching `^[a-z][a-z0-9_]*$`.
- Validates `type` against a fixed enum: `string`, `text`, `number`, `boolean`, `date`, `datetime`, `enum`, `object`.
- Validates `name` as a non-empty string.
- Validates `enumValues` as an optional string array (required when type is `enum`).
- Validates boolean flags: `system`, `readonly`.
- Validates `sensitive` against an enum: `pii`, `secret`, `credential`, `token`, `binary-reference`.
- Validates optional text properties: `helpText`, `smallTip`.
- Validates operation-level override objects: `list` (visible, sortable, searchable, filterable), `form` (visible, placeholder), `create` (visible, order, placeholder), `edit` (visible, order, placeholder).
- Delegates `display` validation to the display schema.
- Delegates `validation` to the field-validation schema.
- Validates `fields` as a recursive self-reference array for nested object fields.
- Requires `key`, `type`, and `name`.
- Rejects unknown properties via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of field inputs or display components.
- Backend storage or indexing of field values.
- Transport layer concerns.
- Business logic beyond structural schema validation.
- Runtime enforcement of the max nesting depth (handled outside this schema).

## 4. Runtime Inputs

- `key` -- string, required, pattern `^[a-z][a-z0-9_]*$`
- `type` -- string, required, enum [string, text, number, boolean, date, datetime, enum, object]
- `name` -- string, required, minLength 1
- `enumValues` -- array of strings, optional
- `system` -- boolean, optional
- `helpText` -- string, optional
- `smallTip` -- string, optional
- `readonly` -- boolean, optional
- `sensitive` -- string, optional, enum [pii, secret, credential, token, binary-reference]
- `list` -- object, optional (visible, sortable, searchable, filterable)
- `form` -- object, optional (visible, placeholder)
- `create` -- object, optional (visible, order, placeholder)
- `edit` -- object, optional (visible, order, placeholder)
- `display` -- object, optional, validated by `display.schema.yaml`
- `validation` -- object, optional, validated by `field-validation.schema.yaml`
- `fields` -- array, optional, recursive self-reference (`$ref: "#"`)

## 5. Primitive Composition

- `$ref: "./display.schema.yaml"` for the `display` property.
- `$ref: "./field-validation.schema.yaml"` for the `validation` property.
- `$ref: "#"` (self-reference) for the `fields` array items, enabling recursive nesting for `type: "object"`.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/entities/field-definition.schema.yaml` -- YAML schema source
- `manifests/entities/field-definition.schema.md` -- human-readable documentation
- `manifests/entities/field-definition.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/entity/field/FieldDefinitionSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
