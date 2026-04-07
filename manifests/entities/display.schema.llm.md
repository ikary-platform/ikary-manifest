# display.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **DisplayDefinition** schema, located at `manifests/entities/display.schema.yaml`. It controls how a field value is rendered in list and detail views by specifying renderer type, alignment, and type-specific display options. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates `type` against 21 renderer types: `text`, `multiline-text`, `number`, `currency`, `percentage`, `date`, `datetime`, `boolean`, `status`, `badge`, `email`, `phone`, `url`, `entity-link`, `user`, `avatar-name`, `tags`, `progress`, `json-preview`, `actions`, `custom`.
- Validates `align` against an enum: `left`, `center`, `right`.
- Validates `emptyLabel` as an optional string.
- Validates `truncate` and `tooltip` as optional booleans.
- Validates `currency` as an optional ISO currency code string (valid when type is `currency`).
- Validates `precision` as an optional integer (0-6) for number, currency, percentage, and progress types.
- Validates `labelField` and `subtitleField` as optional non-empty strings.
- Validates `route` as an optional non-empty string.
- Validates `badgeToneMap` and `statusMap` as optional objects with string values.
- Validates `maxItems` as an optional integer (minimum 1) and `showOverflowCount` as an optional boolean.
- Validates `rendererKey` as an optional non-empty string (required when type is `custom`, forbidden otherwise).
- Rejects unknown properties via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering logic or component instantiation.
- Backend formatting or value transformation.
- Transport layer concerns.
- Business logic beyond structural schema validation.

## 4. Runtime Inputs

- `type` -- string, optional, enum of 21 renderer types
- `align` -- string, optional, enum [left, center, right]
- `emptyLabel` -- string, optional
- `truncate` -- boolean, optional
- `tooltip` -- boolean, optional
- `currency` -- string, optional, minLength 1
- `precision` -- integer, optional, minimum 0, maximum 6
- `labelField` -- string, optional, minLength 1
- `subtitleField` -- string, optional, minLength 1
- `route` -- string, optional, minLength 1
- `badgeToneMap` -- object, optional, additionalProperties: string
- `statusMap` -- object, optional, additionalProperties: string
- `maxItems` -- integer, optional, minimum 1
- `showOverflowCount` -- boolean, optional
- `rendererKey` -- string, optional, minLength 1

## 5. Primitive Composition

Self-contained. No child `$ref` schemas are referenced.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. The `route` value is validated as data only.

## 9. Files to Generate or Update

- `manifests/entities/display.schema.yaml` -- YAML schema source
- `manifests/entities/display.schema.md` -- human-readable documentation
- `manifests/entities/display.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/entity/display/DisplayDefinitionSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
