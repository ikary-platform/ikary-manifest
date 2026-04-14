---
"@ikary/cell-primitive-contract": minor
"@ikary/cell-contract": minor
"@ikary/cell-primitives": minor
"@ikary/cell-renderer": minor
"@ikary/mcp-server": minor
---

feat(slots): introduce SLOTS system for manifest-driven page composition

Add named extension zones to entity-list, entity-detail, dashboard, and custom pages. Slot bindings declared under `slotBindings` in a page definition inject registered primitives before, after, or replacing each zone.

**`@ikary/cell-primitive-contract`**: Added `SlotDefinitionSchema` and `slots` field to `PrimitiveContractSchema`. Added `entityBinding` to `PrimitiveSourceEntrySchema`.

**`@ikary/cell-contract`**: Added `SlotBindingSchema` and `slotBindings` / `primitive` fields to `PageDefinitionSchema`. Exported `SlotBinding` type.

**`@ikary/cell-primitives`**: Added `SlotContext` type, `SlotOutlet` component, `BlankSlot` primitive (registered under key `blank-slot`), and `entityBinding` field on `UIPrimitiveDefinition`.

**`@ikary/cell-renderer`**: Entity-list (header/toolbar/table/footer), entity-detail (header/navigation/content/footer), dashboard (header/content/footer), and custom pages now wrap each zone in `SlotOutlet`. Custom pages support `page.primitive` to render a registered primitive as the page body.

**`@ikary/mcp-server`**: Added `list_slots_for_page_type` tool. Added `validate_slot_bindings` tool. Enhanced `validate_page` to validate slot binding structure. Enhanced `get_primitive_contract` to display declared slots. Extended `get_page_schema` to include `slotBindings` and `primitive` fields.
