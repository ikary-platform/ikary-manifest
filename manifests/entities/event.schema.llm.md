# event.schema.yaml LLD

## 1. Purpose

Language-neutral JSON Schema definition for EventDefinition, declared in [`event.schema.yaml`](./event.schema.yaml). The schema validates audit event configuration for entity mutations. This LLD is for code generation tasks: it tells generators what to validate, what to compose, and what not to invent.

## 2. Owned Responsibilities

- Validate the event configuration object with optional fields: `exclude`, `names`.
- Enforce that `exclude` is an array of unique strings when present.
- Validate `names` as an object with optional `created`, `updated`, `deleted` string properties.
- Reject unknown properties through `additionalProperties: false` on both the root and `names` objects.

## 3. Out of Scope

- UI rendering of event configuration forms.
- Backend event emission, audit logging, or change tracking execution.
- Transport encoding or API serialization.
- Business logic beyond structural validation of the event shape.

## 4. Runtime Inputs

- `exclude` -- array of field keys excluded from change tracking (optional, unique items).
- `names` -- object overriding default event names (optional).
- `names.created` -- custom event name for entity creation (optional, string).
- `names.updated` -- custom event name for entity update (optional, string).
- `names.deleted` -- custom event name for entity deletion (optional, string).

## 5. Primitive Composition

Self-contained. No child `$ref` schemas.

## 6. Render-State Mapping

Schema-layer unit. Does not own UI render-state.

## 7. Interaction Model

Declarative. Data fields are emitted, not executed.

## 8. Routing Model

No routing side effects owned.

## 9. Files to Generate or Update

- YAML schema: `manifests/entities/event.schema.yaml`.
- Human doc: `manifests/entities/event.schema.md`.
- LLM doc: `manifests/entities/event.schema.llm.md`.
- TS mirror: `src/contract/entity/event/EventDefinitionSchema.ts`.

## 10. Repo Constraints

- Kebab-case file naming for YAML schemas and docs.
- JSON Schema Draft 2020-12 (`$schema` header).
- `$ref` composition for child schemas when applicable.
- `additionalProperties: false` on every object variant.
