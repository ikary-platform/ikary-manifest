# lifecycle-transition.schema.yaml LLD

## 1. Purpose

Language-neutral JSON Schema definition for LifecycleTransitionDefinition, declared in [`lifecycle-transition.schema.yaml`](./lifecycle-transition.schema.yaml). The schema validates a single state transition within a lifecycle. This LLD is for code generation tasks: it tells generators what to validate, what to compose, and what not to invent.

## 2. Owned Responsibilities

- Validate a transition object with required fields: `key`, `from`, `to`.
- Accept optional metadata: `label`, `guards`, `hooks`, `event`.
- Enforce that `guards` and `hooks` are arrays of unique strings.
- Reject unknown properties through `additionalProperties: false`.

## 3. Out of Scope

- UI rendering of transition buttons or confirmation dialogs.
- Backend guard evaluation or hook execution.
- Transport encoding or API serialization.
- Business logic beyond structural validation of the transition shape.

## 4. Runtime Inputs

- `key` -- unique identifier for the transition (required, string).
- `from` -- source state; must reference a declared state (required, string).
- `to` -- target state; must reference a declared state (required, string).
- `label` -- display label for the transition (optional, string).
- `guards` -- array of guard identifiers evaluated before the transition fires (optional, unique items).
- `hooks` -- array of hook identifiers executed when the transition fires (optional, unique items).
- `event` -- domain event name emitted on transition (optional, string).

## 5. Primitive Composition

Self-contained. No child `$ref` schemas.

## 6. Render-State Mapping

Schema-layer unit. Does not own UI render-state.

## 7. Interaction Model

Declarative. Data fields are emitted, not executed.

## 8. Routing Model

No routing side effects owned.

## 9. Files to Generate or Update

- YAML schema: `manifests/entities/lifecycle-transition.schema.yaml`.
- Human doc: `manifests/entities/lifecycle-transition.schema.md`.
- LLM doc: `manifests/entities/lifecycle-transition.schema.llm.md`.
- TS mirror: `src/contract/manifest/lifecycle/LifecycleTransitionDefinitionSchema.ts`.

## 10. Repo Constraints

- Kebab-case file naming for YAML schemas and docs.
- JSON Schema Draft 2020-12 (`$schema` header).
- `$ref` composition for child schemas when applicable.
- `additionalProperties: false` on every object variant.
