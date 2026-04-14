# Manifest Format

A manifest is a YAML file that describes a complete application. This page explains the top-level structure, the Cell Manifest kind, and the purpose of each `spec` section.

## Cell Manifest

Every manifest has a `kind` field that identifies its type. The current kind is `Cell`.

```yaml
apiVersion: ikary.co/v1alpha1
kind: Cell
metadata:
  key: my_app
  name: My App
  version: "1.0.0"
spec:
  mount: { ... }
  entities: [ ... ]
  pages: [ ... ]
  navigation: { ... }
  roles: [ ... ]
```

`kind: Cell` targets web application generation. It is the first root manifest kind. As IKARY Manifest expands to other surfaces (reporting, dashboards, voice, machine-to-machine), new kinds will be introduced. A single project may eventually support multiple kinds in parallel. Cell is the starting point.

## Metadata

The `metadata` block identifies the manifest.

| Field | Purpose |
|-------|---------|
| `key` | Snake-case identifier used internally. Must be unique per deployment. |
| `name` | Human-readable display name. |
| `version` | Semantic version string. Always quote it (see conventions below). |

## Spec sections

The `spec` block is the application definition. Each section drives a different aspect of generation at runtime.

### `entities`

Entities are the data model. Each entity you define drives:

- CRUD API routes (list, detail, create, update, delete)
- List views in the UI
- Detail views in the UI
- Create and edit forms

An entity defines fields, relations to other entities, computed values, lifecycle states, and access policies. Entities are the central building block. Everything else in the spec references them by key.

```yaml
entities:
  - key: customer
    name: Customer
    pluralName: Customers
    fields:
      - key: name
        type: string
        name: Full Name
      - key: email
        type: string
        name: Email
```

See [Entity Definition](/reference/entity-definition) for the full field and relation specification.

### `pages`

Pages are explicit view definitions. Each page binds to an entity, a custom layout, or a dashboard widget set. Pages define what appears in the application navigation and which path serves each view.

```yaml
pages:
  - key: customer-list
    type: entity-list
    title: Customers
    path: /customers
    entity: customer
  - key: dashboard
    type: dashboard
    title: Dashboard
    path: /dashboard
```

#### Slot bindings

Use `slotBindings` to inject registered primitives into named zones on a page. Zones are fixed per page type. Each zone supports three binding points derived by convention: `zone.before` (prepend), `zone` (replace), and `zone.after` (append).

```yaml
pages:
  - key: customer-list
    type: entity-list
    title: Customers
    path: /customers
    entity: customer
    slotBindings:
      - slot: toolbar.before
        primitive: beta-banner
        props:
          message: "Beta feature"
      - slot: table.after
        primitive: export-controls
```

Set `primitive` on a `type: custom` page to render a registered primitive as the page body:

```yaml
  - key: reports
    type: custom
    title: Reports
    path: /reports
    primitive: blank-slot
    slotBindings:
      - slot: content
        primitive: reports-view
```

See [Slots and Bindings](/guide/slots-and-bindings) for the full guide, including zone names by page type, slot context, and the `blank-slot` primitive.

### `roles`

Roles define access control groups. They control which entities and pages are accessible to which users at runtime. Each role specifies a set of permission scopes tied to entity resources.

```yaml
roles:
  - key: admin
    name: Administrator
    scopes:
      - resource: customer
        actions: [read, create, update, delete]
  - key: viewer
    name: Viewer
    scopes:
      - resource: customer
        actions: [read]
```

### `navigation`

Navigation defines the application menu. It references page keys and supports nested groups for organizing related views.

```yaml
navigation:
  items:
    - type: page
      key: dashboard
      pageKey: dashboard
    - type: group
      key: data
      label: Data
      children:
        - type: page
          key: customer-list
          pageKey: customer-list
```

### `mount`

Mount sets the routing entry point. It specifies the base path for the application and the default landing page.

```yaml
mount:
  mountPath: /
  landingPage: dashboard
```

## Entity composition with `$ref`

Entities can be defined inline or referenced from standalone files using the standard `$ref` keyword:

```yaml
# Inline: works for simple cases
spec:
  entities:
    - key: task
      name: Task
      fields: [ ... ]

# Referenced from files: recommended for larger projects
spec:
  entities:
    - $ref: "./entities/customer.entity.yaml"
    - $ref: "./entities/invoice.entity.yaml"
```

Standalone entity files live in `manifests/examples/entities/`. They are independently reviewable and reusable across multiple manifests. The `$schema` property in each file enables IDE validation without requiring the full manifest to be present.

## Schema declaration

Manifests declare which schema they conform to:

```yaml
$schema: "../cell-manifest.schema.yaml"

apiVersion: ikary.co/v1alpha1
kind: Cell
```

The `$schema` property is stripped by the loader before validation. It is an authoring hint for IDE support, not a runtime requirement.

## Key conventions

### Snake-case identifiers

Entity keys, field keys, and role keys must be snake_case:

```yaml
key: customer_order   # valid
key: customerOrder    # invalid, rejected at validation
```

Pattern: `^[a-z][a-z0-9_]*$`

### Quoted version strings

YAML parses `1.0.0` as a number. Always quote version strings:

```yaml
version: "1.0.0"   # correct: parsed as a string
version: 1.0.0     # wrong: parsed as a float
```

### Path prefixes

Mount paths and page paths must start with `/`:

```yaml
mount:
  mountPath: /crm
pages:
  - path: /customers
  - path: /customers/:id
```
