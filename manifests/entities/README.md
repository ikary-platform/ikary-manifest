# Entity Definitions

Standalone entity YAML files that can be composed into Cell manifests.

Each file defines a single entity and declares its schema with `$schema`:

```yaml
$schema: "../schemas/entity-definition.schema.yaml"

key: customer
name: Customer
pluralName: Customers
fields:
  - key: name
    type: string
    name: Name
```

Manifests reference entity files using `$ref`:

```yaml
# In a cell manifest
spec:
  entities:
    - $ref: "../entities/customer.entity.yaml"
    - $ref: "../entities/invoice.entity.yaml"
```
