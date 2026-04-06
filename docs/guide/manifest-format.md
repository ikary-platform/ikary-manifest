# Manifest Format

YAML is the authoring format for all IKARY cell definitions. This page explains the structure, conventions, and composition patterns.

## Top-level structure

Every manifest has four required fields:

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

| Field | Description |
|-------|-------------|
| `apiVersion` | Always `ikary.co/v1alpha1` |
| `kind` | Always `Cell` |
| `metadata` | Key, name, version |
| `spec` | The application definition |

## Schema declaration

Manifests declare which schema they conform to:

```yaml
$schema: "../cell-manifest.schema.yaml"

apiVersion: ikary.co/v1alpha1
kind: Cell
# ...
```

Entity files declare their own schema:

```yaml
$schema: "../../entities/entity-definition.schema.yaml"

key: customer
name: Customer
# ...
```

The `$schema` property is stripped by the loader before validation. It is an authoring hint for IDE support and documentation.

## Entity composition with `$ref`

Entities can be defined inline or referenced from standalone files using the standard `$ref` keyword:

```yaml
# Inline (simple cases)
spec:
  entities:
    - key: task
      name: Task
      fields: [ ... ]

# Composed from files (recommended for real projects)
spec:
  entities:
    - $ref: "./entities/customer.entity.yaml"
    - $ref: "./entities/invoice.entity.yaml"
```

Standalone entity files live in `manifests/examples/entities/` and are valid on their own:

```yaml
# manifests/examples/entities/customer.entity.yaml
$schema: "../../entities/entity-definition.schema.yaml"

key: customer
name: Customer
pluralName: Customers
fields:
  - key: name
    type: string
    name: Name
  - key: email
    type: string
    name: Email
```

This keeps entities reusable, diffable, and independently reviewable.

## Schema cross-references

The YAML schemas under `manifests/` reference each other using `$ref`:

```yaml
# entity-definition.schema.yaml
properties:
  fields:
    type: array
    items:
      $ref: "./field-definition.schema.yaml"
  relations:
    type: array
    items:
      $ref: "./relation-definition.schema.yaml"
```

See [YAML Schemas](/reference/schemas) for the full schema map.

## Key conventions

### Snake-case identifiers

Entity keys, field keys, and relation keys must be snake_case:

```yaml
key: customer_order   # valid
key: customerOrder    # invalid - rejected by validation
```

Pattern: `^[a-z][a-z0-9_]*$`

### Quoted version strings

YAML parses `1.0.0` as a number. Always quote version strings:

```yaml
version: "1.0.0"   # correct - string
version: 1.0.0     # wrong - parsed as float
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

## Field types

| Type | Description |
|------|-------------|
| `string` | Short text |
| `text` | Long text / multiline |
| `number` | Numeric value |
| `boolean` | True / false |
| `date` | Date only |
| `datetime` | Date and time |
| `enum` | Constrained set of values (requires `enumValues`) |
| `object` | Nested structure (recursive `fields`) |

## Processing pipeline

When a manifest is loaded, it goes through:

1. **YAML parse**: raw text to JS object (`@ikary-manifest/loader`)
2. **Meta stripping**: `$schema` and unresolved `$ref` removed
3. **Structural validation**: Zod schema checks types, required fields, patterns
4. **Semantic validation**: business rules: unique keys, valid references, lifecycle consistency
5. **Compilation**: normalization, field derivation, scope registry (`@ikary-manifest/engine`)
