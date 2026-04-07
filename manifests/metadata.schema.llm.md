# metadata.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **CellMetadata** schema, located at `manifests/metadata.schema.yaml`. It validates the identifying metadata block of a Cell manifest. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates that `key` is a non-empty string.
- Validates that `name` is a non-empty string.
- Validates that `version` is a non-empty string.
- Accepts an optional `description` string.
- Requires `key`, `name`, and `version`.
- Rejects unknown properties via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of metadata fields.
- Version resolution or comparison logic.
- Transport or persistence of metadata.
- Business logic beyond structural schema validation.

## 4. Runtime Inputs

- `key` -- string, required, minLength 1
- `name` -- string, required, minLength 1
- `version` -- string, required, minLength 1
- `description` -- string, optional, minLength 1

## 5. Primitive Composition

Self-contained. No child `$ref` schemas are referenced.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/metadata.schema.yaml` -- YAML schema source
- `manifests/metadata.schema.md` -- human-readable documentation
- `manifests/metadata.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/manifest/CellMetadataSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
