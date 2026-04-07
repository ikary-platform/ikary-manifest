---
outline: deep
---

# YAML Schemas

Language-neutral schemas for IKARY cell manifests, written as [JSON Schema](https://json-schema.org/) in YAML. Organised by domain under `manifests/`.

## Schema map

### Root (entry points)

| Path | Describes |
|------|-----------|
| `cell-manifest.schema.yaml` | Top-level manifest (apiVersion, kind, metadata, spec) |
| `metadata.schema.yaml` | Manifest metadata (key, name, version) |
| `cell-spec.schema.yaml` | Spec body (mount, entities, pages, navigation, roles) |

### `shared/`

| Path | Describes |
|------|-----------|
| `shared/mount.schema.yaml` | Mount point (path, landing page) |

### `entities/`

| Path | Describes |
|------|-----------|
| `entities/entity-definition.schema.yaml` | Full entity (fields, relations, lifecycle, capabilities...) |
| `entities/field-definition.schema.yaml` | Field types, nested objects (recursive) |
| `entities/field-validation.schema.yaml` | Field-level validation rules container |
| `entities/field-rule.schema.yaml` | Single validation rule |
| `entities/display.schema.yaml` | Field display configuration |
| `entities/relation-definition.schema.yaml` | Relation types (belongs_to, has_many, many_to_many, self, polymorphic) |
| `entities/computed-field.schema.yaml` | Computed fields (expression, conditional, aggregation) |
| `entities/lifecycle.schema.yaml` | State machine definition |
| `entities/lifecycle-transition.schema.yaml` | Single state transition |
| `entities/capability-definition.schema.yaml` | Capabilities (transition, mutation, workflow, export, integration) |
| `entities/capability-input.schema.yaml` | Capability input parameters |
| `entities/event.schema.yaml` | Audit event configuration |
| `entities/policy.schema.yaml` | Entity and field access policies |
| `entities/entity-validation.schema.yaml` | Entity-level rules and cross-entity validators |

### `pages/`

| Path | Describes |
|------|-----------|
| `pages/page-definition.schema.yaml` | Page types and data bindings |

### `navigation/`

| Path | Describes |
|------|-----------|
| `navigation/navigation.schema.yaml` | Navigation menu (recursive groups) |

### `roles/`

| Path | Describes |
|------|-----------|
| `roles/role-definition.schema.yaml` | Roles and permission scopes |

### `app-shell/`

| Path | Describes |
|------|-----------|
| `app-shell/app-shell.schema.yaml` | Shell layout, branding, regions |

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

- **TypeScript**: `@ikary/contract` via Zod + custom validators
- **Python**: to be implemented natively

## Relationship to Zod schemas

The TypeScript Zod schemas in `@ikary/contract` are the runtime validation authority. These YAML schemas are the human-readable, language-neutral reference that mirrors the Zod definitions. When in doubt, the Zod schemas are canonical.
