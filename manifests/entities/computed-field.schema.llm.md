# computed-field.schema.yaml LLD

## 1. Purpose

Language-neutral JSON Schema definition for ComputedFieldDefinition, declared in [`computed-field.schema.yaml`](./computed-field.schema.yaml). The schema validates derived field declarations using a discriminated union on the `formulaType` field. This LLD is for code generation tasks: it tells generators what to validate, what to compose, and what not to invent.

## 2. Owned Responsibilities

- Validate the discriminated union across three formula types: `expression`, `conditional`, `aggregation`.
- Enforce required and optional property rules per formula variant.
- Constrain `key` to lowercase snake_case via pattern `^[a-z][a-z0-9_]*$`.
- Constrain `type` to allowed computed value types: `number`, `string`, `boolean`, `date`, `datetime`.
- Reject unknown properties through `additionalProperties: false` on every variant.

## 3. Out of Scope

- UI rendering of computed field previews or formula editors.
- Backend expression evaluation or aggregation execution.
- Transport encoding or API serialization.
- Business logic beyond structural validation of the computed field shape.

## 4. Runtime Inputs

- `key` -- unique identifier for the computed field (required, all variants).
- `name` -- display name (required, all variants).
- `type` -- value type: `number` | `string` | `boolean` | `date` | `datetime` (required, all variants).
- `formulaType` -- discriminator: `expression` | `conditional` | `aggregation` (required, all variants).
- `expression` -- formula expression string (required for expression variant).
- `condition` -- condition expression string (required for conditional variant).
- `then` -- value when condition is true (required for conditional variant).
- `else` -- value when condition is false (required for conditional variant).
- `relation` -- target relation key (required for aggregation variant).
- `operation` -- aggregation operation: `sum` | `count` | `avg` | `min` | `max` (required for aggregation variant).
- `field` -- aggregated field name (aggregation variant; required for sum/avg/min/max, forbidden for count).
- `filter` -- filter expression for aggregation (optional, aggregation only).
- `dependencies` -- array of field keys this computed field depends on (optional, all variants).
- `helpText` -- descriptive help text (optional, all variants).

## 5. Primitive Composition

Self-contained. Uses `oneOf` internally to express the discriminated union. No child `$ref` schemas.

## 6. Render-State Mapping

Schema-layer unit. Does not own UI render-state.

## 7. Interaction Model

Declarative. Data fields are emitted, not executed.

## 8. Routing Model

No routing side effects owned.

## 9. Files to Generate or Update

- YAML schema: `manifests/entities/computed-field.schema.yaml`.
- Human doc: `manifests/entities/computed-field.schema.md`.
- LLM doc: `manifests/entities/computed-field.schema.llm.md`.
- TS mirror: `src/contract/entity/field/ComputedFieldDefinitionSchema.ts`.

## 10. Repo Constraints

- Kebab-case file naming for YAML schemas and docs.
- JSON Schema Draft 2020-12 (`$schema` header).
- `$ref` composition for child schemas when applicable.
- `additionalProperties: false` on every object variant.
