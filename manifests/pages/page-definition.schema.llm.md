# page-definition.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **PageDefinition** schema, located at `manifests/pages/page-definition.schema.yaml`. It defines a page within a Cell application, including entity-bound and standalone page types. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates that `key`, `type`, `title`, and `path` are all present.
- Restricts `type` to the enum: entity-list, entity-detail, entity-create, entity-edit, dashboard, custom.
- Validates that `path` starts with `/` via the pattern `^/`.
- Accepts an optional `entity` string for entity-bound page types.
- Validates the optional `menu` object with `label`, `icon`, and `order` properties.
- Validates the optional `options` object as free-form (additionalProperties allowed).
- Validates the optional `dataContext` object with `entityKey` and `idParam` (defaults to `id`).
- Validates the optional `dataProviders` array, where each provider requires `key`, `entityKey`, and `mode`.
- Restricts `dataProviders[].mode` to the enum: single, list.
- Validates optional `filterBy` and `query` sub-objects on data providers.
- Rejects unknown properties on all typed objects via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of pages or page layouts.
- Backend execution of data providers or queries.
- Transport layer concerns (HTTP, gRPC, file I/O).
- Business logic beyond structural schema validation.

## 4. Runtime Inputs

- `key` -- string, required, minLength 1
- `type` -- string, required, enum: entity-list | entity-detail | entity-create | entity-edit | dashboard | custom
- `title` -- string, required, minLength 1
- `path` -- string, required, minLength 1, pattern: ^/
- `entity` -- string, optional, minLength 1
- `menu` -- object, optional
  - `menu.label` -- string, optional, minLength 1
  - `menu.icon` -- string, optional, minLength 1
  - `menu.order` -- integer, optional
- `options` -- object, optional, additionalProperties allowed
- `dataContext` -- object, optional
  - `dataContext.entityKey` -- string, optional, minLength 1
  - `dataContext.idParam` -- string, optional, minLength 1, default: id
- `dataProviders` -- array, optional
  - `dataProviders[].key` -- string, required, minLength 1
  - `dataProviders[].entityKey` -- string, required, minLength 1
  - `dataProviders[].mode` -- string, required, enum: single | list
  - `dataProviders[].idFrom` -- string, optional
  - `dataProviders[].filterBy` -- object, optional
    - `filterBy.field` -- string, minLength 1
    - `filterBy.valueFrom` -- string, minLength 1
  - `dataProviders[].query` -- object, optional
    - `query.pageSize` -- number, optional
    - `query.sortField` -- string, optional
    - `query.sortDir` -- string, optional, enum: asc | desc

## 5. Primitive Composition

Self-contained. All object shapes are defined inline. No external `$ref` schemas are referenced.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/pages/page-definition.schema.yaml` -- YAML schema source
- `manifests/pages/page-definition.schema.md` -- human-readable documentation
- `manifests/pages/page-definition.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/manifest/page/PageDefinitionSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
