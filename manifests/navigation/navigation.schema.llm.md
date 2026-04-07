# navigation.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **NavigationDefinition** schema, located at `manifests/navigation/navigation.schema.yaml`. It defines the top-level navigation menu for a Cell as an array of NavigationItem entries discriminated on type. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates that `items` is a non-empty array of NavigationItem objects.
- Discriminates NavigationItem on `type`: `page` or `group`.
- Validates PageItem entries require `type`, `key`, and `pageKey`.
- Validates GroupItem entries require `type`, `key`, and `label`.
- Accepts optional `label`, `icon`, and `order` on PageItem.
- Accepts optional `icon`, `order`, and `children` on GroupItem.
- Supports recursive nesting through `children`, which references `NavigationItem` via `$defs`.
- Rejects unknown properties on all item types via `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of navigation menus.
- Backend route resolution or page loading.
- Transport layer concerns (HTTP, gRPC, file I/O).
- Business logic beyond structural schema validation.
- Validation that `pageKey` references a declared page (cross-schema concern).

## 4. Runtime Inputs

- `items` -- array, required, minItems 1, items: NavigationItem
- NavigationItem (type: page):
  - `type` -- const: page
  - `key` -- string, required, minLength 1
  - `pageKey` -- string, required, minLength 1
  - `label` -- string, optional
  - `icon` -- string, optional
  - `order` -- number, optional
- NavigationItem (type: group):
  - `type` -- const: group
  - `key` -- string, required, minLength 1
  - `label` -- string, required, minLength 1
  - `icon` -- string, optional
  - `order` -- number, optional
  - `children` -- array of NavigationItem, optional (recursive)

## 5. Primitive Composition

- `$defs/NavigationItem` used via `$ref: "#/$defs/NavigationItem"` for `items` and recursive `children`.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/navigation/navigation.schema.yaml` -- YAML schema source
- `manifests/navigation/navigation.schema.md` -- human-readable documentation
- `manifests/navigation/navigation.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/manifest/navigation/NavigationDefinitionSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
