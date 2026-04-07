# role-definition.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **RoleDefinition** schema, located at `manifests/roles/role-definition.schema.yaml`. It defines a named role with permission scopes and optional identity mappings. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates that `key`, `name`, and `scopes` are all present.
- Validates that `key` and `name` are non-empty strings.
- Validates that `scopes` is a non-empty array of unique strings.
- Accepts an optional `description` string with minLength 1.
- Accepts an optional `identityMappings` array of unique strings.
- Rejects unknown properties via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of role data.
- Backend enforcement of role-based access control.
- Transport layer concerns (HTTP, gRPC, file I/O).
- Business logic beyond structural schema validation.
- Resolution of scope strings to permissions (cross-schema concern).

## 4. Runtime Inputs

- `key` -- string, required, minLength 1
- `name` -- string, required, minLength 1
- `description` -- string, optional, minLength 1
- `scopes` -- array of strings, required, minItems 1, uniqueItems true
- `identityMappings` -- array of strings, optional, uniqueItems true

## 5. Primitive Composition

Self-contained. No child `$ref` schemas are referenced.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/roles/role-definition.schema.yaml` -- YAML schema source
- `manifests/roles/role-definition.schema.md` -- human-readable documentation
- `manifests/roles/role-definition.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/manifest/role/RoleDefinitionSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
