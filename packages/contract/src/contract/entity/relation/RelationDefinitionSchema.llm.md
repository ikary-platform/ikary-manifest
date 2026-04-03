# RelationDefinitionSchema LLD

## 1. Purpose

RelationDefinitionSchema defines the canonical runtime contract shape for this unit in the IKARY core contract layer. This LLD is implementation-oriented and optimized for generation tasks: it tells Codex what to validate, what to compose, and what not to invent. Use this file as prompt context when creating or updating schema files, validators, adapters, resolvers, and integration wiring that depend on this contract. The schema is authoritative and all generated code MUST respect strict validation rules, enum values, discriminators, and refinement constraints declared in the source file.

## 2. Owned Responsibilities

- Validate raw payloads into deterministic, typed contract data.
- Enforce required/optional field semantics and strict object behavior.
- Preserve nested schema composition across manifest/entity boundaries.
- Keep contract evolution additive and backward compatible by default.

## 3. Out of Scope

- UI rendering logic and component-level presentation behavior.
- Backend transport, persistence, mutation, or workflow execution.
- Business-side orchestration beyond schema-declared constraints.
- Any alternate contract architecture outside the existing repo pattern.

## 4. Runtime Inputs

- Unknown node/payload value entering runtime validation.
- `key` from the validated contract payload.
- `relation` from the validated contract payload.
- `entity` from the validated contract payload.
- Optional integration context from callers (never hardcoded in schema).

## 5. Primitive Composition

- Composes nested schemas: `RelationBaseSchema`.
- Depends on `zod` validation and the folder-level `index.ts` export wiring.
- Keeps composition declarative; does not execute child runtime behavior.

## 6. Render-State Mapping

- This is a contract-layer unit, so it does not own UI render-state orchestration.
- If consumed by runtime surfaces, loading/empty/error mapping is owned by higher primitives.
- Contract output is neutral data used by render-state-capable components upstream.

## 7. Interaction Model

- Interaction is declarative: data fields and keys are emitted, not executed here.
- Action-like identifiers (if present) are pass-through metadata for runtime handlers.
- The contract remains controlled by caller-provided data and callbacks.

## 8. Routing Model

- No direct routing side effects are owned by this contract.
- Route/path values (if any) are validated as contract data only.
- Routing orchestration is handled by host runtime/page primitives.

## 9. Files to Generate or Update

- Schema source: `libs/cell-contract-core/src/contract/entity/relation/RelationDefinitionSchema.ts`.
- Human contract doc: `RelationDefinitionSchema.md`.
- LLM contract doc: `RelationDefinitionSchema.llm.md`.
- Samples file: `RelationDefinitionSchema.samples.json` (minimum 5 valid examples).
- Folder index exports should include the schema and supporting artifacts when required by local convention.

## 10. Repo Constraints

- Follow IKARY repo naming: PascalCase schema filenames with `Schema` suffix.
- Do not introduce parallel validation patterns outside current `zod` usage.
- Keep extensions deterministic, minimal, and contract-compatible with existing imports.
- Respect AGENTS governance: no architecture drift, no ad hoc schema systems, no hidden behavior.
