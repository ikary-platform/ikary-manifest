# IkaryForm LLD

## 1. Purpose

IkaryForm provides the canonical implementation unit for the `form` contract in this repository. It converts validated presentation payloads into deterministic runtime rendering through the standard pipeline: schema, validator, adapter, resolver, and register. This LLD constrains implementation choices so code generation stays consistent with existing `cell-contract-presentation` and `cell-runtime-ui` patterns.

## 2. Scope

- Normalize and validate presentation shape defined by `IkaryFormPresentationSchema`.
- Expose a stable runtime contract for `IkaryForm` rendering.
- Map presentation fields into adapter-friendly view props.
- Preserve deterministic render order for the primitive surface.
- Keep behavior host-agnostic and transport-agnostic.
- Own canonical fields such as `enabled`, `debounceMs`, `saveOnBlur`, `saveDraft`, `commit`, `discard`.

## 3. Non-Goals

- No backend fetching, mutation, or retry orchestration.
- No route-state ownership beyond declarative navigation metadata.
- No business validation rules or domain-specific workflow logic.
- No ad hoc styling system outside repo token/class conventions.
- No alternative primitive architecture outside schema -> adapter -> resolver -> register.

## 4. Inputs

- Presentation input: `IkaryFormPresentation` validated by the runtime validator in this folder.
- Runtime input: optional handler maps and runtime override payloads from host surfaces.
- Resolver input: unknown node payload parsed into typed view props before render.
- Primary schema fields consumed at runtime include `enabled`, `debounceMs`, `saveOnBlur`, `saveDraft`, `commit`, `discard`, `retry`, `resolveConflict`.

## 5. Composition

- Contract layer: schema + runtime validator + local index export.
- Runtime layer: types + adapter + component + resolver + register + local index export.
- Registry layer: explicit primitive key registration in `cell-runtime-ui` registry.
- Direct primitive dependencies in component composition: `FormSection`.

## 6. Render Flow

1. Receive unknown node payload from host or renderer runtime.
2. Validate payload using the contract validator in this folder.
3. Build runtime view props with the adapter, including normalized defaults.
4. Resolve interaction handlers from runtime injection maps.
5. Render component with deterministic prop-to-UI mapping.
6. Apply local fallback rendering only when explicit state fields are present.
7. Return stable output without embedding orchestration side effects.

## 7. State Handling

- `loading`: not owned by default; parent containers decide fallback behavior.
- `empty`: not owned unless explicit empty metadata is added in schema/runtime.
- `error`: not owned unless explicit error presentation is provided.
- `success`: default render path with adapted schema props.

## 8. Interactions

- No mandatory dispatch contract; interactions stay optional and schema-driven.
- No required routing behavior unless schema explicitly includes navigation fields.
- Support controlled/uncontrolled behavior only where schema fields define it.
- Do not mutate external state directly; always use injected callbacks.

## 9. Files

- Contract schema: `libs/cell-contract-presentation/src/contract/form/IkaryFormPresentationSchema.ts`.
- LLD doc: `libs/cell-contract-presentation/src/contract/form/IkaryForm.LLD.md`.
- Runtime: `libs/cell-runtime-ui/src/primitives/form/Form.types.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/form/IkaryForm.adapter.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/form/IkaryForm.register.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/form/IkaryForm.tsx`.
- Runtime: `libs/cell-runtime-ui/src/primitives/form/IkaryForm.types.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/form/index.ts`.
- Runtime: `libs/cell-runtime-ui/src/primitives/form/useIkaryForm.ts`.

## 10. Implementation Notes

- MUST keep naming aligned with repo conventions (PascalCase files, kebab-case primitive folders/keys).
- MUST treat schema as source of truth; adapters only normalize and map defaults.
- MUST keep resolver thin: validate -> adapt -> return typed view model.
- MUST keep registration explicit and avoid duplicate primitive keys in registry bootstrap.
- SHOULD reuse existing shared runtime helpers before introducing new utility layers.
