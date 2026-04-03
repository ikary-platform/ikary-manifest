# Schemas

Language-neutral YAML schemas for Ikary cell manifests, using [JSON Schema](https://json-schema.org/) syntax written in YAML.

## File map

| File | Describes |
|------|-----------|
| [`cell-manifest.schema.yaml`](./cell-manifest.schema.yaml) | Top-level manifest (apiVersion, kind, metadata, spec) |
| [`metadata.schema.yaml`](./metadata.schema.yaml) | Manifest metadata (key, name, version) |
| [`cell-spec.schema.yaml`](./cell-spec.schema.yaml) | Spec body (mount, entities, pages, navigation, roles) |
| [`mount.schema.yaml`](./mount.schema.yaml) | Mount point (path, landing page) |
| [`entity-definition.schema.yaml`](./entity-definition.schema.yaml) | Entity (fields, relations, lifecycle, capabilities...) |
| [`field-definition.schema.yaml`](./field-definition.schema.yaml) | Field types, nested objects |
| [`field-validation.schema.yaml`](./field-validation.schema.yaml) | Field-level validation rules container |
| [`field-rule.schema.yaml`](./field-rule.schema.yaml) | Single validation rule |
| [`display.schema.yaml`](./display.schema.yaml) | Field display configuration |
| [`relation-definition.schema.yaml`](./relation-definition.schema.yaml) | Relation types (belongs_to, has_many, ...) |
| [`computed-field.schema.yaml`](./computed-field.schema.yaml) | Computed fields (expression, conditional, aggregation) |
| [`lifecycle.schema.yaml`](./lifecycle.schema.yaml) | State machine definition |
| [`lifecycle-transition.schema.yaml`](./lifecycle-transition.schema.yaml) | Single state transition |
| [`capability-definition.schema.yaml`](./capability-definition.schema.yaml) | Capabilities (transition, mutation, workflow, ...) |
| [`capability-input.schema.yaml`](./capability-input.schema.yaml) | Capability input parameters |
| [`event.schema.yaml`](./event.schema.yaml) | Audit event configuration |
| [`policy.schema.yaml`](./policy.schema.yaml) | Entity and field access policies |
| [`entity-validation.schema.yaml`](./entity-validation.schema.yaml) | Entity-level rules and cross-entity validators |
| [`page-definition.schema.yaml`](./page-definition.schema.yaml) | Page types and data bindings |
| [`navigation.schema.yaml`](./navigation.schema.yaml) | Navigation menu (recursive groups) |
| [`role-definition.schema.yaml`](./role-definition.schema.yaml) | Roles and permission scopes |
| [`app-shell.schema.yaml`](./app-shell.schema.yaml) | Shell layout, branding, regions |

## Cross-references

Schemas reference each other using the standard JSON Schema `$ref` keyword with relative file paths:

```yaml
# In entity-definition.schema.yaml
fields:
  type: array
  items:
    $ref: "./field-definition.schema.yaml"
```

## Structural vs semantic validation

These schemas cover **structural** validation: types, required fields, enum values, patterns.

**Semantic** rules (unique entity keys, valid lifecycle transitions, relation consistency) are enforced at runtime by each language's validator:
- TypeScript: `@ikary-manifest/contract` via Zod + semantic validators
- Python: to be implemented natively

## Relationship to Zod schemas

The TypeScript Zod schemas in `@ikary-manifest/contract` are the runtime validation authority. These YAML schemas are the human-readable, language-neutral reference that mirrors the Zod definitions. When in doubt, the Zod schemas are canonical.
