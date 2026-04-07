# capability-input.schema.yaml LLD

## 1. Purpose

Language-neutral JSON Schema definition for CapabilityInputDefinition, declared in [`capability-input.schema.yaml`](./capability-input.schema.yaml). The schema validates input parameter declarations for entity capabilities. This LLD is for code generation tasks: it tells generators what to validate, what to compose, and what not to invent.

## 2. Owned Responsibilities

- Validate the input object with required fields: `key`, `type`.
- Constrain `type` to allowed input kinds: `string`, `text`, `number`, `boolean`, `date`, `select`, `entity`.
- Enforce that `options` is present and non-empty when `type` is `select`.
- Enforce that `entity` is present when `type` is `entity`.
- Reject unknown properties through `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of input forms, dropdowns, or entity pickers.
- Backend input parsing, coercion, or default value resolution.
- Transport encoding or API serialization.
- Business logic beyond structural validation of the input shape.

## 4. Runtime Inputs

- `key` -- unique identifier for the input (required, string).
- `type` -- input kind: `string` | `text` | `number` | `boolean` | `date` | `select` | `entity` (required, string enum).
- `label` -- display label (optional, string).
- `required` -- whether the input must be provided (optional, boolean).
- `defaultValue` -- default value for the input (optional, any type).
- `options` -- array of allowed values (required when `type` is `select`; unique items, minimum 1).
- `entity` -- target entity name (required when `type` is `entity`; string).

## 5. Primitive Composition

Self-contained. No child `$ref` schemas.

## 6. Render-State Mapping

Schema-layer unit. Does not own UI render-state.

## 7. Interaction Model

Declarative. Data fields are emitted, not executed.

## 8. Routing Model

No routing side effects owned.

## 9. Files to Generate or Update

- YAML schema: `manifests/entities/capability-input.schema.yaml`.
- Human doc: `manifests/entities/capability-input.schema.md`.
- LLM doc: `manifests/entities/capability-input.schema.llm.md`.
- TS mirror: `src/contract/manifest/capability/CapabilityInputDefinitionSchema.ts`.

## 10. Repo Constraints

- Kebab-case file naming for YAML schemas and docs.
- JSON Schema Draft 2020-12 (`$schema` header).
- `$ref` composition for child schemas when applicable.
- `additionalProperties: false` on every object variant.
