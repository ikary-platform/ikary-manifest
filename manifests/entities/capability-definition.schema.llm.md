# capability-definition.schema.yaml LLD

## 1. Purpose

Language-neutral JSON Schema definition for CapabilityDefinition, declared in [`capability-definition.schema.yaml`](./capability-definition.schema.yaml). The schema validates entity capability declarations using a discriminated union on the `type` field. This LLD is for code generation tasks: it tells generators what to validate, what to compose, and what not to invent.

## 2. Owned Responsibilities

- Validate the discriminated union across five capability types: `transition`, `mutation`, `workflow`, `export`, `integration`.
- Enforce required and optional property rules per capability variant.
- Constrain `scope` to allowed values: `entity`, `selection`, `global`.
- Delegate input validation to the referenced child schema.
- Reject unknown properties through `additionalProperties: false` on every variant.

## 3. Out of Scope

- UI rendering of capability buttons, menus, or confirmation dialogs.
- Backend capability execution, workflow orchestration, or export generation.
- Transport encoding or API serialization.
- Business logic beyond structural validation of the capability shape.

## 4. Runtime Inputs

- `key` -- unique identifier for the capability (required, all variants).
- `type` -- discriminator: `transition` | `mutation` | `workflow` | `export` | `integration` (required, all variants).
- `description` -- human-readable description (optional, all variants).
- `icon` -- icon identifier (optional, all variants).
- `visible` -- controls default visibility (optional, boolean, all variants).
- `confirm` -- whether to show a confirmation prompt (optional, boolean, all variants).
- `scope` -- action scope: `entity` | `selection` | `global` (optional, all variants).
- `inputs` -- array of input definitions, each validated by `capability-input.schema.yaml` (optional, all variants).
- `transition` -- lifecycle transition key to fire (required for transition variant).
- `updates` -- object of field updates to apply (required for mutation variant).
- `workflow` -- workflow identifier to trigger (required for workflow variant).
- `format` -- export format: `pdf` | `csv` | `xlsx` | `json` (required for export variant).
- `provider` -- integration provider identifier (required for integration variant).
- `operation` -- integration operation name (optional, integration variant).

## 5. Primitive Composition

- `$ref: "./capability-input.schema.yaml"` -- validates each item in the `inputs` array.

## 6. Render-State Mapping

Schema-layer unit. Does not own UI render-state.

## 7. Interaction Model

Declarative. Data fields are emitted, not executed.

## 8. Routing Model

No routing side effects owned.

## 9. Files to Generate or Update

- YAML schema: `manifests/entities/capability-definition.schema.yaml`.
- Human doc: `manifests/entities/capability-definition.schema.md`.
- LLM doc: `manifests/entities/capability-definition.schema.llm.md`.
- TS mirror: `src/contract/manifest/capability/CapabilityDefinitionSchema.ts`.

## 10. Repo Constraints

- Kebab-case file naming for YAML schemas and docs.
- JSON Schema Draft 2020-12 (`$schema` header).
- `$ref` composition for child schemas when applicable.
- `additionalProperties: false` on every object variant.
