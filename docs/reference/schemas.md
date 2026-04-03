---
outline: deep
---

# YAML Schemas

Language-neutral schemas for IKARY cell manifests, written as [JSON Schema](https://json-schema.org/) in YAML. Located in `manifests/schemas/`.

## Schema map

### Manifest level

| Schema | Describes |
|--------|-----------|
| `cell-manifest.schema.yaml` | Top-level manifest (apiVersion, kind, metadata, spec) |
| `metadata.schema.yaml` | Manifest metadata (key, name, version) |
| `cell-spec.schema.yaml` | Spec body (mount, entities, pages, navigation, roles) |
| `mount.schema.yaml` | Mount point (path, landing page) |

### Entity level

| Schema | Describes |
|--------|-----------|
| `entity-definition.schema.yaml` | Full entity (fields, relations, lifecycle, capabilities...) |
| `field-definition.schema.yaml` | Field types, nested objects (recursive) |
| `field-validation.schema.yaml` | Field-level validation rules container |
| `field-rule.schema.yaml` | Single validation rule |
| `display.schema.yaml` | Field display configuration |
| `relation-definition.schema.yaml` | Relation types (belongs_to, has_many, many_to_many, self, polymorphic) |
| `computed-field.schema.yaml` | Computed fields (expression, conditional, aggregation) |
| `lifecycle.schema.yaml` | State machine definition |
| `lifecycle-transition.schema.yaml` | Single state transition |
| `capability-definition.schema.yaml` | Capabilities (transition, mutation, workflow, export, integration) |
| `capability-input.schema.yaml` | Capability input parameters |
| `event.schema.yaml` | Audit event configuration |
| `policy.schema.yaml` | Entity and field access policies |
| `entity-validation.schema.yaml` | Entity-level rules and cross-entity validators |

### UI level

| Schema | Describes |
|--------|-----------|
| `page-definition.schema.yaml` | Page types and data bindings |
| `navigation.schema.yaml` | Navigation menu (recursive groups) |
| `role-definition.schema.yaml` | Roles and permission scopes |
| `app-shell.schema.yaml` | Shell layout, branding, regions |

## Cross-references

Schemas reference each other using the standard JSON Schema `$ref` keyword:

```yaml
# In entity-definition.schema.yaml
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

## Structural vs semantic validation

These schemas cover **structural** validation: types, required fields, enum values, patterns.

**Semantic** rules (unique entity keys, valid lifecycle transitions, relation consistency) are enforced at runtime by each language's validator:

- **TypeScript**: `@ikary-manifest/contract` via Zod + custom validators
- **Python**: to be implemented natively

## Relationship to Zod schemas

The TypeScript Zod schemas in `@ikary-manifest/contract` are the runtime validation authority. These YAML schemas are the human-readable, language-neutral reference that mirrors the Zod definitions. When in doubt, the Zod schemas are canonical.
