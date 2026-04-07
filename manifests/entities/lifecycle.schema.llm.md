# lifecycle.schema.yaml LLD

## 1. Purpose

Language-neutral JSON Schema definition for LifecycleDefinition, declared in [`lifecycle.schema.yaml`](./lifecycle.schema.yaml). The schema validates state-machine declarations for an entity, including allowed states and transitions. This LLD is for code generation tasks: it tells generators what to validate, what to compose, and what not to invent.

## 2. Owned Responsibilities

- Validate the top-level lifecycle object with required fields: `field`, `initial`, `states`, `transitions`.
- Enforce that `states` is a non-empty array of unique strings.
- Enforce that `transitions` is a non-empty array of transition objects.
- Delegate transition validation to the referenced child schema.
- Reject unknown properties through `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of lifecycle state diagrams or transition controls.
- Backend state-machine execution or guard evaluation.
- Transport encoding or API serialization.
- Business logic beyond structural validation of the lifecycle shape.

## 4. Runtime Inputs

- `field` -- entity field that stores the lifecycle state (required, string).
- `initial` -- starting state value; must be one of the declared states (required, string).
- `states` -- array of allowed state values (required, non-empty, unique items).
- `transitions` -- array of transition definitions (required, non-empty, each validated by `lifecycle-transition.schema.yaml`).

## 5. Primitive Composition

- `$ref: "./lifecycle-transition.schema.yaml"` -- validates each item in the `transitions` array.

## 6. Render-State Mapping

Schema-layer unit. Does not own UI render-state.

## 7. Interaction Model

Declarative. Data fields are emitted, not executed.

## 8. Routing Model

No routing side effects owned.

## 9. Files to Generate or Update

- YAML schema: `manifests/entities/lifecycle.schema.yaml`.
- Human doc: `manifests/entities/lifecycle.schema.md`.
- LLM doc: `manifests/entities/lifecycle.schema.llm.md`.
- TS mirror: `src/contract/entity/lifecycle/LifecycleDefinitionSchema.ts`.

## 10. Repo Constraints

- Kebab-case file naming for YAML schemas and docs.
- JSON Schema Draft 2020-12 (`$schema` header).
- `$ref` composition for child schemas when applicable.
- `additionalProperties: false` on every object variant.
