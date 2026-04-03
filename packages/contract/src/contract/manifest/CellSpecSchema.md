# CellSpecSchema Contract

## Purpose

CellSpecSchema is the canonical contract schema for this unit inside `cell-contract-core`. It defines the structural payload expected by runtime composition and validation layers. The schema is the source of truth for shape, required fields, enum bounds, and strict-mode behavior.

## Responsibilities

- Define deterministic payload validation with Zod.
- Enforce required and optional fields exactly as declared in `CellSpecSchema.ts`.
- Capture nested contract composition through imported schemas.
- Provide a stable contract surface for manifest/entity orchestration.

## Non-Goals

- No UI rendering concerns.
- No backend execution logic or side effects.
- No transport/client orchestration.
- No business process implementation beyond schema constraints.

## Contract Surface

- Primary schema file: `libs/cell-contract-core/src/contract/manifest/CellSpecSchema.ts`.
- Companion LLM brief: `CellSpecSchema.llm.md`.
- Runtime samples: `CellSpecSchema.samples.json`.
- Imported schema dependencies: `AppShellDefinitionSchema`, `CellMountDefinitionSchema`, `EntityDefinitionSchema`, `NavigationDefinitionSchema`, `PageDefinitionSchema`, `RoleDefinitionSchema`.

## Validation Notes

- Use strict payload parsing where defined by the schema.
- Keep enum and discriminated-union values canonical.
- Preserve existing refine/superRefine constraints when extending fields.
- Treat unknown keys as invalid when strict mode is enabled.

## Samples

Use `CellSpecSchema.samples.json` as deterministic examples for tests, prompt context, and schema regression checks. All samples in that file MUST parse successfully against `CellSpecSchema`.
