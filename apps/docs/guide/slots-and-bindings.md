# Slots and Bindings

For copy-paste examples covering every zone and mode, see [Slot Examples](./slot-examples.md).

Slots are named extension zones on high-level page primitives. They let you inject registered primitives into a page without modifying or forking the page primitive itself.

Every page type declares a fixed set of named zones. Using `slotBindings` in the page definition, you attach a registered primitive to one of those zones at three positions: before the zone, after the zone, or replacing the zone entirely.

## Zone naming convention

Each zone supports three binding points derived by convention:

| Notation | Position |
|---|---|
| `zone.before` | Prepend before the zone content |
| `zone` | Replace the entire zone |
| `zone.after` | Append after the zone content |

When you write `slot: "toolbar.before"`, the system infers `mode: prepend` from the `.before` suffix. You can override the inferred mode by setting `mode` explicitly.

Multiple prepend and append bindings at the same zone stack in declaration order. If more than one binding targets the same zone for replace, the last one wins.

## Zones by page type

| Page type | Zones |
|---|---|
| `entity-list` | `header`, `toolbar`, `table`, `footer` |
| `entity-detail` | `header`, `navigation`, `content`, `footer` |
| `dashboard` | `header`, `content`, `footer` |
| `custom` | `content` |

`entity-create` and `entity-edit` do not declare slot zones.

## Adding slot bindings to a page

```yaml
pages:
  - key: products-list
    type: entity-list
    title: Products
    path: /products
    entity: product
    slotBindings:
      - slot: toolbar.before
        primitive: beta-banner
        props:
          message: "This feature is in beta"
      - slot: table.after
        primitive: related-records
        version: "1.0.0"
      - slot: footer
        primitive: custom-footer
```

The `primitive` field references a registered primitive key. The optional `version` field pins to a specific semver. The optional `props` object passes static values to the primitive.

## Slot context

Every primitive rendered via a slot binding receives a `__slotContext` prop in addition to its declared props. Use it to adapt behavior based on where the primitive is placed.

```typescript
interface SlotContext {
  slotZone: string;            // "header", "toolbar", "table", "footer", etc.
  slotMode: 'prepend' | 'append' | 'replace';
  pageType: string;
  pageTitle: string;
  pageKey: string;
  entityKey?: string;          // present on entity-bound pages
  entityName?: string;
  entityPluralName?: string;
  entity?: EntityDefinition;   // full entity definition from the manifest
}
```

Your component accesses it via its props:

```typescript
interface MyBannerProps {
  message: string;
  __slotContext?: SlotContext;
}

export function MyBanner({ message, __slotContext }: MyBannerProps) {
  return (
    <div>
      {message}
      {__slotContext?.entityName && ` — ${__slotContext.entityName}`}
    </div>
  );
}
```

## Entity binding

When a primitive is designed for a specific entity type, declare `entityBinding` in `ikary-primitives.yaml`:

```yaml
primitives:
  - key: product-summary
    version: "1.0.0"
    source: ./primitives/product-summary/ProductSummary.register.ts
    contract: ./primitives/product-summary/product-summary.contract.yaml
    entityBinding: product
```

This field is metadata. The runtime does not block bindings that do not match. It enables validation warnings from `validate_slot_bindings` when a primitive is bound to a page whose entity does not match.

## Declaring slots on a primitive

If your custom primitive is itself a container (it exposes named zones for further injection), declare them in the `.contract.yaml`:

```yaml
key: my-layout
version: "1.0.0"
label: My Layout
category: layout
props:
  type: object
  properties: {}
slots:
  - name: header
    description: Top area of the layout
    allowedModes: [replace, prepend, append]
  - name: body
    description: Main content area
    allowedModes: [replace, append]
```

The `allowedModes` field restricts which operations are valid for that slot. Omit it to allow all three modes.

## `blank-slot` primitive

`blank-slot` is a built-in primitive that renders nothing. Its purpose is to act as an empty body in a slot zone so that `prepend` and `append` bindings still render around an empty area.

The primary use case is custom pages. Set `primitive: blank-slot` on the page and use `slotBindings` to populate the `content` zone:

```yaml
pages:
  - key: announcements
    type: custom
    title: Announcements
    path: /announcements
    primitive: blank-slot
    slotBindings:
      - slot: content
        primitive: announcement-feed
```

This renders `announcement-feed` as the full page body.

You can also use `blank-slot` to clear a zone and still prepend or append around it:

```yaml
slotBindings:
  - slot: toolbar
    primitive: blank-slot         # clears the toolbar
  - slot: toolbar.after
    primitive: quick-actions      # renders after the (now-empty) toolbar
```

## Using the MCP tools

The `list_slots_for_page_type` tool returns all binding points for a page type:

```
list_slots_for_page_type(pageType: "entity-list")
```

The `validate_slot_bindings` tool checks a binding array for unknown primitives, invalid zone names, and disallowed modes:

```
validate_slot_bindings(
  slotBindings: [...],
  pageType: "entity-list"
)
```
