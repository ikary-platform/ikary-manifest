# Entity Schemas

YAML schemas (JSON Schema syntax) for the entity domain.

## Files

| Schema | Describes |
|--------|-----------|
| `entity-definition.schema.yaml` | Full entity (fields, relations, lifecycle, capabilities, policies, validation) |
| `field-definition.schema.yaml` | Field types and nested objects (recursive, max depth 3) |
| `field-validation.schema.yaml` | Field-level validation rules container |
| `field-rule.schema.yaml` | Single validation rule (required, regex, email, date, ...) |
| `display.schema.yaml` | Field display configuration (text, badge, status, currency, ...) |
| `relation-definition.schema.yaml` | Relation types (belongs_to, has_many, many_to_many, self, polymorphic) |
| `computed-field.schema.yaml` | Computed fields (expression, conditional, aggregation) |
| `lifecycle.schema.yaml` | State machine definition (states, transitions) |
| `lifecycle-transition.schema.yaml` | Single state transition (guards, hooks) |
| `capability-definition.schema.yaml` | Capabilities (transition, mutation, workflow, export, integration) |
| `capability-input.schema.yaml` | Capability input parameters |
| `event.schema.yaml` | Audit event configuration |
| `policy.schema.yaml` | Entity and field access policies |
| `entity-validation.schema.yaml` | Entity-level rules and cross-entity validators |

## Cross-references

Schemas reference each other using relative paths:

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

## Example entity files

Standalone entity YAML files that conform to `entity-definition.schema.yaml` live in
`manifests/examples/entities/`. They reference this schema via:

```yaml
$schema: "../../entities/entity-definition.schema.yaml"

key: customer
name: Customer
pluralName: Customers
fields:
  - key: name
    type: string
    name: Name
```
