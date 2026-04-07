# NavigationDefinition

Defines the top-level navigation menu for a Cell. Contains a tree of navigation items that link to pages or group other items.

## Responsibility Boundary

**Owns:**

- The structure and ordering of the Cell navigation menu.
- Discriminated item types: page links and groups.
- Recursive nesting of groups.

**Does not own:**

- Page definitions referenced by `pageKey` (defined in page-definition.schema.yaml).
- The Cell manifest that contains this navigation.
- Visual rendering of the navigation component.

## Canonical Position

```
Cell Manifest
  └── Spec
       └── Navigation (this)
            └── Items[]
                 ├── PageItem  (leaf)
                 └── GroupItem
                      └── Children[] (recursive)
```

## Schema Shape

```yaml
items:   NavigationItem[]   # required, minItems 1
```

### NavigationItem (via `$defs`)

Discriminated on the `type` property. Each item is one of:

```yaml
# PageItem
type:     "page"       # required (const)
key:      string       # required
pageKey:  string       # required
label:    string
icon:     string
order:    number

# GroupItem
type:      "group"     # required (const)
key:       string      # required
label:     string      # required
icon:      string
order:     number
children:  NavigationItem[]
```

## Field-by-Field Breakdown

### `items` (required)

- **Type:** `array` of `NavigationItem`
- **minItems:** 1

The top-level list of navigation entries. Must contain at least one item.

### NavigationItem: PageItem

A leaf item that links to a declared page.

#### `type` (required)

- **Const:** `"page"`

Identifies this item as a page link.

#### `key` (required)

- **Type:** `string`
- **minLength:** 1

Unique identifier for this navigation item.

#### `pageKey` (required)

- **Type:** `string`
- **minLength:** 1

References a page `key` from the Cell's pages array. The runtime resolves this to a page definition.

#### `label`

- **Type:** `string`

Display text for this item. When omitted, the runtime falls back to the referenced page's title.

#### `icon`

- **Type:** `string`

Icon identifier displayed next to the label.

#### `order`

- **Type:** `number`

Sort position among sibling items. Lower values appear first.

### NavigationItem: GroupItem

A container that nests child navigation items under a collapsible label.

#### `type` (required)

- **Const:** `"group"`

Identifies this item as a group container.

#### `key` (required)

- **Type:** `string`
- **minLength:** 1

Unique identifier for this navigation group.

#### `label` (required)

- **Type:** `string`
- **minLength:** 1

Display text for the group header.

#### `icon`

- **Type:** `string`

Icon identifier displayed next to the group label.

#### `order`

- **Type:** `number`

Sort position among sibling items. Lower values appear first.

#### `children`

- **Type:** `array` of `NavigationItem`

Nested navigation items within this group. Each child follows the same `NavigationItem` discriminated union. Groups can nest recursively.

## Child Schema References

| Property               | Schema                              |
|------------------------|-------------------------------------|
| `items[]`              | `$defs/NavigationItem` (internal)   |
| `children[]` (in group) | `$defs/NavigationItem` (recursive) |

This schema uses `$defs` for internal definitions. It does not reference external schema files.

## Semantic Invariants

- `items` must contain at least one entry.
- Every `pageKey` in a PageItem must reference a valid page `key` declared in the Cell's pages array.
- Item `key` values must be unique across the entire navigation tree, not only among siblings.
- Groups without `children` are valid but render as empty collapsible sections.
- The `order` property controls sort position among siblings. Items without `order` appear after ordered items, in declaration order.

## Minimal YAML Example

```yaml
items:
  - type: page
    key: nav-home
    pageKey: dashboard
```

## Rich YAML Example

```yaml
items:
  - type: page
    key: nav-home
    pageKey: dashboard
    label: Home
    icon: home
    order: 1

  - type: group
    key: nav-orders
    label: Orders
    icon: shopping-cart
    order: 2
    children:
      - type: page
        key: nav-order-list
        pageKey: order-list
        label: All Orders
        icon: list
        order: 1

      - type: page
        key: nav-order-create
        pageKey: order-create
        label: New Order
        icon: plus
        order: 2

  - type: group
    key: nav-settings
    label: Settings
    icon: gear
    order: 99
    children:
      - type: group
        key: nav-settings-advanced
        label: Advanced
        children:
          - type: page
            key: nav-config
            pageKey: config
            label: Configuration
```

## Forbidden Patterns

**Do not reference a `pageKey` that does not exist in the Cell's pages array.**
The schema cannot validate cross-file references. The runtime rejects navigation items that point to undeclared page keys.

**Do not duplicate `key` values across the navigation tree.**
Keys must be unique across all items, including items nested inside groups. Duplicate keys cause unpredictable behavior in the navigation renderer.

**Do not create an empty `items` array.**
The schema enforces `minItems: 1`. A navigation definition with zero items fails validation.
