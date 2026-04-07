# cell-manifest.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **CellManifestV1** schema, located at `manifests/cell-manifest.schema.yaml`. It is the top-level manifest that assembles a complete cell application from its metadata and spec blocks. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates that `apiVersion` is exactly `ikary.co/v1alpha1`.
- Validates that `kind` is exactly `Cell`.
- Delegates `metadata` validation to the referenced metadata schema.
- Delegates `spec` validation to the referenced cell-spec schema.
- Enforces that all four properties (`apiVersion`, `kind`, `metadata`, `spec`) are required.
- Rejects unknown top-level properties via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of manifest data.
- Backend execution or runtime loading of cells.
- Transport layer concerns (HTTP, gRPC, file I/O).
- Business logic beyond structural schema validation.
- Validation of metadata or spec internals (owned by child schemas).

## 4. Runtime Inputs

- `apiVersion` -- string constant `ikary.co/v1alpha1`
- `kind` -- string constant `Cell`
- `metadata` -- object validated by `metadata.schema.yaml`
- `spec` -- object validated by `cell-spec.schema.yaml`

## 5. Primitive Composition

- `$ref: "./metadata.schema.yaml"` for the `metadata` property.
- `$ref: "./cell-spec.schema.yaml"` for the `spec` property.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/cell-manifest.schema.yaml` -- YAML schema source
- `manifests/cell-manifest.schema.md` -- human-readable documentation
- `manifests/cell-manifest.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/manifest/CellManifestV1Schema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
