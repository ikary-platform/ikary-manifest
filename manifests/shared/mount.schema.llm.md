# mount.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **CellMountDefinition** schema, located at `manifests/shared/mount.schema.yaml`. It validates the mount configuration that determines where and how a Cell is attached in the host application. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates that `mountPath` is a non-empty string starting with `/`.
- Validates that `landingPage` is a non-empty string identifying the default page key.
- Accepts an optional `title` string.
- Requires `mountPath` and `landingPage`.
- Rejects unknown properties via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of mount targets.
- Runtime path resolution or router integration.
- Transport layer concerns.
- Business logic beyond structural schema validation.

## 4. Runtime Inputs

- `mountPath` -- string, required, minLength 1, pattern `^/`
- `landingPage` -- string, required, minLength 1
- `title` -- string, optional, minLength 1

## 5. Primitive Composition

Self-contained. No child `$ref` schemas are referenced.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values (`mountPath`, `landingPage`) are validated as data only.

## 9. Files to Generate or Update

- `manifests/shared/mount.schema.yaml` -- YAML schema source
- `manifests/shared/mount.schema.md` -- human-readable documentation
- `manifests/shared/mount.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/manifest/shell/CellMountDefinitionSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
