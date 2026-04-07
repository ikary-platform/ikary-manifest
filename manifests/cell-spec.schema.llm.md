# cell-spec.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **CellSpec** schema, located at `manifests/cell-spec.schema.yaml`. It defines the specification body of a Cell manifest, composing mount configuration, shell layout, entities, pages, navigation, and roles. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Requires the `mount` property.
- Delegates `mount` validation to the mount schema.
- Delegates `appShell` validation to the app-shell schema.
- Validates `entities` as an array, delegating each item to the entity-definition schema.
- Validates `pages` as an array, delegating each item to the page-definition schema.
- Delegates `navigation` validation to the navigation schema.
- Validates `roles` as an array, delegating each item to the role-definition schema.
- Rejects unknown properties via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of the spec structure.
- Runtime orchestration of entities, pages, or roles.
- Transport layer concerns.
- Business logic beyond structural schema validation.
- Validation of individual child schema internals.

## 4. Runtime Inputs

- `mount` -- object, required, validated by `shared/mount.schema.yaml`
- `appShell` -- object, optional, validated by `app-shell/app-shell.schema.yaml`
- `entities` -- array of objects, optional, each validated by `entities/entity-definition.schema.yaml`
- `pages` -- array of objects, optional, each validated by `pages/page-definition.schema.yaml`
- `navigation` -- object, optional, validated by `navigation/navigation.schema.yaml`
- `roles` -- array of objects, optional, each validated by `roles/role-definition.schema.yaml`

## 5. Primitive Composition

- `$ref: "./shared/mount.schema.yaml"` for the `mount` property.
- `$ref: "./app-shell/app-shell.schema.yaml"` for the `appShell` property.
- `$ref: "./entities/entity-definition.schema.yaml"` for each `entities[]` item.
- `$ref: "./pages/page-definition.schema.yaml"` for each `pages[]` item.
- `$ref: "./navigation/navigation.schema.yaml"` for the `navigation` property.
- `$ref: "./roles/role-definition.schema.yaml"` for each `roles[]` item.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/cell-spec.schema.yaml` -- YAML schema source
- `manifests/cell-spec.schema.md` -- human-readable documentation
- `manifests/cell-spec.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/manifest/CellSpecSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
