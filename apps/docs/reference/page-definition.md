# Page Definition

A page definition binds a page type to a route, an optional entity, and optional slot bindings. Pages are declared in `spec.pages` of the Cell manifest.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | string | Yes | Unique page identifier within the manifest |
| `type` | PageType | Yes | Page type (see below) |
| `title` | string | Yes | Display title shown in the page header |
| `path` | string | Yes | Route path, must start with `/` |
| `entity` | string | No | Entity key — required for entity-bound page types |
| `menu` | object | No | Navigation menu configuration |
| `options` | object | No | Arbitrary key/value options passed to the page renderer |
| `dataContext` | DataContextDefinition | No | Data binding context |
| `dataProviders` | DataProviderDefinition[] | No | Additional data providers |
| `slotBindings` | SlotBinding[] | No | Primitives to inject into named zones on this page |
| `primitive` | string | No | Custom page only: registered primitive key to render as the page body |

## Page types

| Type | Entity required | Slot zones |
|---|---|---|
| `entity-list` | Yes | `header`, `toolbar`, `table`, `footer` |
| `entity-detail` | Yes | `header`, `navigation`, `content`, `footer` |
| `entity-create` | Yes | none |
| `entity-edit` | Yes | none |
| `dashboard` | No | `header`, `content`, `footer` |
| `custom` | No | `content` |

## SlotBinding

| Field | Type | Required | Description |
|---|---|---|---|
| `slot` | string | Yes | Zone binding point: `zone`, `zone.before`, or `zone.after` |
| `primitive` | string | Yes | Registered primitive key |
| `version` | string | No | Semver to pin the primitive version |
| `props` | object | No | Static props to pass to the primitive |
| `mode` | string | No | Override the inferred mode: `replace`, `prepend`, or `append` |

When `mode` is not set, the mode is inferred from the `slot` value: `.before` suffix means `prepend`, `.after` suffix means `append`, no suffix means `replace`.

## Semantic rules

- Page keys must be unique across the manifest.
- Page paths must be unique and start with `/`.
- Entity-bound pages (`entity-list`, `entity-detail`, `entity-create`, `entity-edit`) require `entity`.
- Non-entity pages (`dashboard`, `custom`) must not have `entity`.
- `primitive` is only meaningful on `type: custom` pages.
- Multiple `slotBindings` targeting the same zone as `replace` are resolved last-wins.
- Multiple `prepend` or `append` bindings at the same zone stack in declaration order.

## Examples

Minimal entity list page:

```yaml
- key: products-list
  type: entity-list
  title: Products
  path: /products
  entity: product
```

Entity list page with slot bindings:

```yaml
- key: products-list
  type: entity-list
  title: Products
  path: /products
  entity: product
  slotBindings:
    - slot: toolbar.before
      primitive: beta-banner
      props:
        message: "Beta feature"
    - slot: table.after
      primitive: export-button
    - slot: footer
      primitive: custom-pagination
```

Custom page rendered by a registered primitive:

```yaml
- key: reports
  type: custom
  title: Reports
  path: /reports
  primitive: blank-slot
  slotBindings:
    - slot: content
      primitive: reports-dashboard
```

Dashboard page with a header banner:

```yaml
- key: dashboard
  type: dashboard
  title: Dashboard
  path: /dashboard
  slotBindings:
    - slot: header
      primitive: announcement-banner
      props:
        dismissible: true
```

## Notes

Slot bindings only render registered primitives. There is no mechanism to inject arbitrary components or inline JSX from the manifest. This constraint is intentional: it keeps the manifest declarative and ensures all UI is auditable from the primitive registry.

See [Slots and Bindings](/guide/slots-and-bindings) for the full guide including slot context, entity binding, and the `blank-slot` primitive.
