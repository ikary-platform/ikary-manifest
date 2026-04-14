---
"@ikary/cell-playground": minor
"@ikary/cell-primitive-studio": minor
---

feat(playground): IDE chrome redesign — IKARY brand, collapsible panels, contract schema reference

- Unified IDE chrome CSS system across App Runtime, API Runtime and UI Runtime using IKARY brand tokens (`.ide-toolbar`, `.ide-panel-tab`, `.ide-seg`, `.ide-sub-header`, `.ide-scenario-tabs`)
- Split/Full segmented toggle with icons, right-aligned in all sections; View Code/View Preview button in full mode
- Runtime Context and Contract Schema panels in `PropsEditor` are now collapsible with animated chevron
- `PrimitiveStudio` gains a `renderRuntimeEditor` render-prop for custom editor injection (Monaco in UI Runtime)
- New `ContractSchemaPanel` component in playground shows field reference from `CellManifestV1Schema` (App Runtime) and `EntityDefinitionSchema` (API Runtime)
- Schema tab moved to last position in the top nav
