# relation-definition.schema.yaml LLD

## 1. Purpose

Language-neutral JSON Schema definition for RelationDefinition, declared in [`relation-definition.schema.yaml`](./relation-definition.schema.yaml). The schema validates entity relationship declarations using a discriminated union on the `relation` field. This LLD is for code generation tasks: it tells generators what to validate, what to compose, and what not to invent.

## 2. Owned Responsibilities

- Validate the discriminated union across five relation types: `belongs_to`, `has_many`, `many_to_many`, `self`, `polymorphic`.
- Enforce required and optional property rules per relation variant.
- Constrain `key` to lowercase snake_case via pattern `^[a-z][a-z0-9_]*$`.
- Reject unknown properties through `additionalProperties: false` on every variant.

## 3. Out of Scope

- UI rendering of relation selectors or form controls.
- Backend persistence, migration generation, or referential integrity enforcement.
- Transport encoding or API serialization.
- Business logic beyond structural validation of the relation shape.

## 4. Runtime Inputs

- `key` -- unique identifier for the relation (required, all variants).
- `relation` -- discriminator: `belongs_to` | `has_many` | `many_to_many` | `self` | `polymorphic` (required, all variants).
- `entity` -- target entity name (required for belongs_to, has_many, many_to_many).
- `foreignKey` -- foreign key field name (required for has_many; optional for belongs_to).
- `required` -- boolean flag (optional, belongs_to only).
- `through` -- join table name (required for many_to_many).
- `sourceKey` -- source-side join key (required for many_to_many).
- `targetKey` -- target-side join key (required for many_to_many).
- `kind` -- self-relation sub-kind: `belongs_to` | `has_many` | `many_to_many` (required for self).
- `typeField` -- polymorphic type discriminator field (required for polymorphic).
- `idField` -- polymorphic ID field (required for polymorphic).
- `allowedEntities` -- array of allowed entity names (optional, polymorphic only).
- `label` -- display label (optional, all variants).
- `createPolicy` -- `create` | `attach` | `create-or-attach` (optional, belongs_to only).
- `displayField` -- field used for display (optional, belongs_to only).

## 5. Primitive Composition

Self-contained. Uses `oneOf` internally to express the discriminated union. No child `$ref` schemas.

## 6. Render-State Mapping

Schema-layer unit. Does not own UI render-state.

## 7. Interaction Model

Declarative. Data fields are emitted, not executed.

## 8. Routing Model

No routing side effects owned.

## 9. Files to Generate or Update

- YAML schema: `manifests/entities/relation-definition.schema.yaml`.
- Human doc: `manifests/entities/relation-definition.schema.md`.
- LLM doc: `manifests/entities/relation-definition.schema.llm.md`.
- TS mirror: `src/contract/entity/relation/RelationDefinitionSchema.ts`.

## 10. Repo Constraints

- Kebab-case file naming for YAML schemas and docs.
- JSON Schema Draft 2020-12 (`$schema` header).
- `$ref` composition for child schemas when applicable.
- `additionalProperties: false` on every object variant.
