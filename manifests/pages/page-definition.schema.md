# PageDefinition

Defines a page within a Cell application. Each page maps a URL path to a page type and optionally binds to an entity.

## Responsibility Boundary

**Owns:**

- The routing path, type, and title of one page.
- Menu configuration for the page.
- Data context and data provider declarations.
- Free-form options passed to the page renderer.

**Does not own:**

- The entity schema referenced by `entity` (defined in entity-definition.schema.yaml).
- Navigation ordering (defined in navigation.schema.yaml).
- The Cell manifest that contains this page.

## Canonical Position

```
Cell Manifest
  └── Spec
       └── Pages[] (this)
```

## Schema Shape

```yaml
key:            string       # required
type:           enum          # required
title:          string       # required
path:           string       # required
entity:         string
menu:           object
options:        object
dataContext:     object
dataProviders:  object[]
```

## Field-by-Field Breakdown

### `key` (required)

- **Type:** `string`
- **minLength:** 1

Unique identifier for the page within the Cell.

### `type` (required)

- **Type:** `string`
- **Enum:** `entity-list`, `entity-detail`, `entity-create`, `entity-edit`, `dashboard`, `custom`

Determines the page behavior and rendering strategy. Entity-bound types (`entity-list`, `entity-detail`, `entity-create`, `entity-edit`) require the `entity` property.

### `title` (required)

- **Type:** `string`
- **minLength:** 1

Display title for the page. Used in the browser tab and page header.

### `path` (required)

- **Type:** `string`
- **minLength:** 1
- **Pattern:** `^/`

URL path for this page. Must start with `/`.

### `entity`

- **Type:** `string`
- **minLength:** 1

References the entity key that this page operates on. Required when `type` is one of the entity-bound types: `entity-list`, `entity-detail`, `entity-create`, or `entity-edit`.

### `menu`

- **Type:** `object`
- **Properties:**
  - `label` (`string`, minLength 1): Text shown in the menu.
  - `icon` (`string`, minLength 1): Icon identifier for the menu entry.
  - `order` (`integer`): Sort position in the menu.

Controls how this page appears in the application menu.

### `options`

- **Type:** `object`
- **additionalProperties:** `true`

Free-form key-value pairs passed to the page renderer. The schema does not constrain the shape of this object. Use it for page-type-specific configuration.

### `dataContext`

- **Type:** `object`
- **Properties:**
  - `entityKey` (`string`, minLength 1): The entity this context loads.
  - `idParam` (`string`, minLength 1, default `"id"`): Route parameter name used to resolve the entity record.

Binds the page to a single entity record. The runtime reads the ID from the URL parameter named in `idParam`.

### `dataProviders`

- **Type:** `array` of `object`
- **Item required properties:** `key`, `entityKey`, `mode`
- **Item properties:**
  - `key` (`string`, minLength 1): Unique provider identifier within this page.
  - `entityKey` (`string`, minLength 1): The entity to load data from.
  - `mode` (`string`, enum: `single`, `list`): Whether to fetch one record or a collection.
  - `idFrom` (`string`): Source of the record ID when `mode` is `"single"`.
  - `filterBy` (`object`):
    - `field` (`string`, minLength 1): The entity field to filter on.
    - `valueFrom` (`string`, minLength 1): Expression that resolves to the filter value.
  - `query` (`object`):
    - `pageSize` (`number`): Number of records per page.
    - `sortField` (`string`): Field to sort by.
    - `sortDir` (`string`, enum: `asc`, `desc`): Sort direction.

Declares additional data sources for the page. Each provider loads entity data and exposes it to the page renderer.

## Child Schema References

This schema has no `$ref` child schemas. The `entity` property references an entity by key at runtime, not through a schema reference.

## Semantic Invariants

- Entity-bound page types (`entity-list`, `entity-detail`, `entity-create`, `entity-edit`) require the `entity` property. The schema does not enforce this through `if/then`, but the runtime rejects manifests that omit it.
- `path` must start with `/`.
- `key` must be unique across all pages in the Cell.
- Each data provider `key` must be unique within the `dataProviders` array.
- When `dataProviders[].mode` is `"single"`, the provider should specify `idFrom` to resolve which record to fetch.

## Minimal YAML Example

```yaml
key: dashboard
type: dashboard
title: Home
path: /
```

## Rich YAML Example

```yaml
key: order-list
type: entity-list
title: Orders
path: /orders
entity: order

menu:
  label: Orders
  icon: shopping-cart
  order: 2

options:
  showExport: true
  defaultPageSize: 25

dataProviders:
  - key: recent-orders
    entityKey: order
    mode: list
    query:
      pageSize: 50
      sortField: createdAt
      sortDir: desc
    filterBy:
      field: status
      valueFrom: route.query.status
```

## Forbidden Patterns

**Do not omit `entity` on entity-bound page types.**
The JSON Schema does not enforce the conditional requirement. The runtime rejects any page with type `entity-list`, `entity-detail`, `entity-create`, or `entity-edit` that lacks the `entity` property.

**Do not reuse the same `key` across pages.**
Page keys serve as unique identifiers referenced by navigation items and deep links. Duplicate keys cause undefined behavior at runtime.

**Do not use `dataContext` and `dataProviders` for the same entity record.**
If the page already has a `dataContext` bound to an entity, adding a data provider for the same entity and record creates a redundant fetch. Use one or the other.
