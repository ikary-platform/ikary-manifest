# ListPage LLD

## 1. Purpose

ListPage provides the canonical implementation unit for the `list-page` contract in this repository. It converts validated presentation payloads into deterministic runtime rendering through the standard pipeline: schema, validator, adapter, resolver, and register. This LLD constrains implementation choices so code generation stays consistent with existing `cell-contract-presentation` and `cell-runtime-ui` patterns.

## 2. Scope

- Normalize and validate presentation shape defined by `ListPagePresentationSchema`.
- Expose a stable runtime contract for `ListPage` rendering.
- Map presentation fields into adapter-friendly view props.
- Preserve deterministic render order for the primitive surface.
- Keep behavior host-agnostic and transport-agnostic.
- Own canonical fields such as `title`, `description`, `visible`, `placeholder`, `key`, `label`.

## 3. Non-Goals

- No backend fetching, mutation, or retry orchestration.
- No route-state ownership beyond declarative navigation metadata.
- No business validation rules or domain-specific workflow logic.
- No ad hoc styling system outside repo token/class conventions.
- No alternative primitive architecture outside schema -> adapter -> resolver -> register.

## 4. Inputs

- Presentation input: `ListPagePresentation` validated by the runtime validator in this folder.
- Runtime input: optional handler maps and runtime override payloads from host surfaces.
- Resolver input: unknown node payload parsed into typed view props before render.
- Primary schema fields consumed at runtime include `title`, `description`, `visible`, `placeholder`, `key`, `label`, `mode`, `items`.

## 5. Composition

- Contract layer: schema + runtime validator + local index export.
- Runtime layer: types + adapter + component + resolver + register + local index export.
- Registry layer: explicit primitive key registration in `cell-runtime-ui` registry.
- Direct primitive dependencies in component composition: `..`.

## 6. Render Flow

1. Receive unknown node payload from host or renderer runtime.
2. Validate payload using the contract validator in this folder.
3. Build runtime view props with the adapter, including normalized defaults.
4. Resolve interaction handlers from runtime injection maps.
5. Render component with deterministic prop-to-UI mapping.
6. Apply local fallback rendering only when explicit state fields are present.
7. Return stable output without embedding orchestration side effects.

## 7. State Handling

- `loading`: use only when declared by schema/runtime; keep behavior local and deterministic.
- `empty`: render only for successful no-content conditions explicitly modeled by props.
- `error`: render normalized error presentation payload when provided by runtime mapping.
- `success`: render the adapted primitive body when no fallback state is active.

## 8. Interactions

- No mandatory dispatch contract; interactions stay optional and schema-driven.
- No required routing behavior unless schema explicitly includes navigation fields.
- Support controlled/uncontrolled behavior only where schema fields define it.
- Do not mutate external state directly; always use injected callbacks.

## 9. Files

- Contract schema: `libs/cell-contract-presentation/src/contract/list-page/ListPagePresentationSchema.ts`.
- LLD doc: `libs/cell-contract-presentation/src/contract/list-page/ListPage.LLD.md`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/ListPage.Controller.old.tsx`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/ListPage.Controller.tsx`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/ListPage.adapter.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/ListPage.old.tsx`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/ListPage.register.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/ListPage.resolver.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/ListPage.tsx`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/ListPage.types.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/index.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/listPage.runtime-utils.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/useListPageRuntime.old.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/list-page/useListPageRuntime.ts`.

## 10. Implementation Notes

- MUST keep naming aligned with repo conventions (PascalCase files, kebab-case primitive folders/keys).
- MUST treat schema as source of truth; adapters only normalize and map defaults.
- MUST keep resolver thin: validate -> adapt -> return typed view model.
- MUST keep registration explicit and avoid duplicate primitive keys in registry bootstrap.
- SHOULD reuse existing shared runtime helpers before introducing new utility layers.
