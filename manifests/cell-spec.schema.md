# Cell Spec

Specification body of a Cell manifest.
Declares the mount point, entities, pages, navigation, roles, and app shell that make up a cell.

## Responsibility Boundary

**Owns:** The shape and optionality of each spec-level property.

**Does not own:** The internal structure of mount, entities, pages, navigation, roles, or app shell. Each is validated by its own schema.

## Canonical Position

```
Cell Manifest
  └── Spec (this)
       ├── Mount
       ├── Entities[]
       ├── Pages[]
       ├── Navigation
       ├── Roles[]
       └── App Shell
```

## Schema Shape

```yaml
type: object
required: [mount]
additionalProperties: false
```

## Fields

### `mount`

| Key       | Value                              |
|-----------|------------------------------------|
| Type      | `object`                           |
| Required  | Yes                                |
| Ref       | `./shared/mount.schema.yaml`       |

Defines where the cell mounts in the host application and which page loads first.
Every cell needs a mount point.

### `appShell`

| Key       | Value                                    |
|-----------|------------------------------------------|
| Type      | `object`                                 |
| Required  | No                                       |
| Ref       | `./app-shell/app-shell.schema.yaml`      |

Layout, branding, region configuration, and shell-level navigation.
Omit this property when the cell runs inside an existing shell provided by a host application.

### `entities`

| Key       | Value                                           |
|-----------|-------------------------------------------------|
| Type      | `array`                                         |
| Items     | `./entities/entity-definition.schema.yaml`      |
| Required  | No                                              |

List of domain entity definitions.
Items can be inline objects or `$ref` pointers to standalone entity YAML files.

### `pages`

| Key       | Value                                     |
|-----------|-------------------------------------------|
| Type      | `array`                                   |
| Items     | `./pages/page-definition.schema.yaml`     |
| Required  | No                                        |

List of page definitions that the cell renders.
Each page declares its type, route path, and layout.

### `navigation`

| Key       | Value                                      |
|-----------|--------------------------------------------|
| Type      | `object`                                   |
| Required  | No                                         |
| Ref       | `./navigation/navigation.schema.yaml`      |

Defines the navigation tree for the cell.
Groups pages into menus and determines ordering.

### `roles`

| Key       | Value                                     |
|-----------|-------------------------------------------|
| Type      | `array`                                   |
| Items     | `./roles/role-definition.schema.yaml`     |
| Required  | No                                        |

List of role definitions that the cell recognizes.
Each role declares a key, a display name, and a set of scopes.

## Child Schema References

| Property     | Schema File                                  |
|--------------|----------------------------------------------|
| `mount`      | `./shared/mount.schema.yaml`                 |
| `appShell`   | `./app-shell/app-shell.schema.yaml`          |
| `entities[]` | `./entities/entity-definition.schema.yaml`   |
| `pages[]`    | `./pages/page-definition.schema.yaml`        |
| `navigation` | `./navigation/navigation.schema.yaml`        |
| `roles[]`    | `./roles/role-definition.schema.yaml`        |

## Semantic Invariants

- `mount` is the only required property. All others are optional.
- `additionalProperties` is `false`. No extra keys are allowed at the spec level.
- `entities` and `pages` are arrays. An empty array is valid but carries no effect.
- A spec with no `entities`, `pages`, or `navigation` is technically valid but produces a cell with no user-facing content.

## Minimal YAML Example

```yaml
mount:
  mountPath: /
  landingPage: dashboard
pages:
  - key: dashboard
    type: dashboard
    title: Dashboard
    path: /dashboard
```

## Rich YAML Example

```yaml
mount:
  mountPath: /crm
  landingPage: customer-list
appShell:
  key: crm-shell
  name: CRM Shell
  layout:
    mode: sidebar-content
  regions:
    - key: sidebar
      enabled: true
    - key: main
      enabled: true
  outlet:
    type: page
    region: main
roles:
  - key: admin
    name: Admin
    scopes:
      - crm.admin
entities:
  - $ref: "./entities/customer.entity.yaml"
pages:
  - key: customer-list
    type: entity-list
    title: Customers
    path: /customers
    entity: customer
navigation:
  items:
    - type: page
      key: customer-list
      pageKey: customer-list
```

## Forbidden Patterns

| Pattern | Why |
|---------|-----|
| Missing `mount` | `mount` is the only required field and must be present. |
| Extra top-level keys (e.g., `theme`, `settings`) | `additionalProperties: false` rejects them. |
| Scalar value for `entities`, `pages`, or `roles` | These properties must be arrays. |
| Duplicate entity or page keys across array items | Keys serve as identifiers and must be unique within their array. |
