# Cell Manifest

Top-level entry point for an Ikary Cell application.
Validates the API version, kind, metadata, and spec as a single document.

## Responsibility Boundary

**Owns:** Document-level envelope (API version, kind) and references to the metadata and spec sub-schemas.

**Does not own:** Content of metadata or spec. Those are validated by their own schemas.

## Canonical Position

```
Cell Manifest (this)
  ├── Metadata
  └── Spec
       ├── Mount
       ├── Entities
       ├── Pages
       ├── Navigation
       ├── Roles
       └── App Shell
```

## Schema Shape

```yaml
type: object
required: [apiVersion, kind, metadata, spec]
additionalProperties: false
```

## Fields

### `apiVersion`

| Key       | Value                  |
|-----------|------------------------|
| Type      | `string`               |
| Required  | Yes                    |
| Const     | `ikary.co/v1alpha1`    |

Fixed version identifier. The manifest loader rejects any other value.

### `kind`

| Key       | Value   |
|-----------|---------|
| Type      | `string`|
| Required  | Yes     |
| Const     | `Cell`  |

Discriminator field. The platform uses `kind` to select the correct schema at parse time.

### `metadata`

| Key       | Value                             |
|-----------|-----------------------------------|
| Type      | `object`                          |
| Required  | Yes                               |
| Ref       | `./metadata.schema.yaml`          |

Contains the cell's key, human-readable name, description, and version.
See [metadata.schema.yaml](./metadata.schema.yaml).

### `spec`

| Key       | Value                              |
|-----------|------------------------------------|
| Type      | `object`                           |
| Required  | Yes                                |
| Ref       | `./cell-spec.schema.yaml`          |

Contains every configurable part of the cell: mount, entities, pages, navigation, roles, and app shell.
See [cell-spec.schema.md](./cell-spec.schema.md).

## Child Schema References

| Property   | Schema File                 |
|------------|-----------------------------|
| `metadata` | `./metadata.schema.yaml`    |
| `spec`     | `./cell-spec.schema.yaml`   |

## Semantic Invariants

- All four properties are required on every manifest document.
- `additionalProperties` is `false`. No extra top-level keys are allowed.
- `apiVersion` and `kind` are constants. Changing either value causes validation failure.
- A valid manifest file must pass both the envelope check (this schema) and every referenced sub-schema.

## Minimal YAML Example

```yaml
apiVersion: ikary.co/v1alpha1
kind: Cell
metadata:
  key: minimal
  name: Minimal Cell
  version: "1.0.0"
spec:
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
apiVersion: ikary.co/v1alpha1
kind: Cell
metadata:
  key: crm
  name: CRM Cell
  version: "1.0.0"
spec:
  mount:
    mountPath: /crm
    landingPage: customer-list
  roles:
    - key: admin
      name: Admin
      scopes:
        - crm.admin
    - key: sales
      name: Sales
      scopes:
        - crm.customer.view
  entities:
    - $ref: "./entities/customer.entity.yaml"
    - $ref: "./entities/invoice.entity.yaml"
  pages:
    - key: dashboard
      type: dashboard
      title: Dashboard
      path: /dashboard
    - key: customer-list
      type: entity-list
      title: Customers
      path: /customers
      entity: customer
  navigation:
    items:
      - type: page
        key: dashboard
        pageKey: dashboard
      - type: group
        key: customers
        label: Customers
        children:
          - type: page
            key: customer-list
            pageKey: customer-list
```

## Forbidden Patterns

| Pattern | Why |
|---------|-----|
| Extra top-level properties | `additionalProperties: false` rejects them. |
| Missing `apiVersion` or `kind` | The schema requires all four properties. |
| `apiVersion` set to anything other than `ikary.co/v1alpha1` | The field is a `const`. |
| `kind` set to anything other than `Cell` | The field is a `const`. |
| Inline metadata or spec content without matching the sub-schema | Validation cascades into `$ref` targets. |
