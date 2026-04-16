# IKARY Eval Framework

This folder contains a deterministic evaluation and refactoring harness for IKARY manifest generation, fixing, updating, retrieval, context assembly, and clarification handling.

## Goals

- Evaluate manifest workflows like a compiler/runtime benchmark, not a vague LLM taste test.
- Make the current AI flow comparable across modular and legacy pipelines.
- Keep provider/model routing centralized in `libs/system-ai`.
- Keep retrieval, context assembly, clarification, execution, and validation separable so we can refactor safely.

## Architecture

The reusable manifest workflow contracts live in `libs/cell-ai/src/server/pipeline`.

- `KnowledgeProvider`
  Responsible for retrieval from blueprints, schema catalogs, or future RAG sources.
- `ContextAssembler`
  Converts task input, retrieved references, and optional existing manifests into compact execution context.
- `ClarificationPolicy`
  Decides whether to proceed, ask a structured question, or fail fast.
- `ManifestTaskExecutor`
  Executes `create`, `fix`, or `update` in a model-agnostic way.
- `ValidationPipeline`
  Runs parse, schema, semantic, compile, and optional runtime checks.

The centralized AI runtime lives in `libs/system-ai`.

- `AiTaskRunner` is the only real AI execution gateway.
- Providers, models, routing, and fallback chains are configured by env/profile in `system-ai`.
- Consumers never pass provider/model directly into manifest task APIs.

## Folder Layout

- `cases/`
  Typed eval cases grouped by suite.
- `fixtures/`
  Reusable manifests and helper fixtures.
- `providers/`
  Fixture/mock execution helpers and profile-facing wrappers.
- `pipeline/`
  Pipeline adapters and comparison baselines.
- `scorers/`
  Deterministic scorer modules.
- `core/`
  Case schema, normalization, aggregation, reporting, and runner helpers.
- `reports/`
  Generated `eval-report.json` and `eval-report.md`.
- `scripts/`
  CLI entrypoints.
- `tests/`
  Eval harness tests.

## Shipped Pipeline Configurations

- `refactored.default`
  Modular retrieval + context + clarification + execution + validation.
- `baseline.no-rag`
  Same core pipeline with retrieval disabled.
- `legacy.try-api`
  Replay of the coupled try-api generation path.
- `legacy.studio-replay`
  Studio-inspired replay using a more verbose legacy orchestration prompt shape.

## Clarification Modes

The runner supports two modes.

- `disabled`
  Default for deterministic CI. Pipelines proceed with defaults and record assumptions.
- `enabled`
  Pipelines may return a structured clarification envelope and, if the case includes answers, the runner replays the task with those answers applied.

Structured clarification shape:

```json
{
  "status": "needs_clarification",
  "questions": [
    {
      "id": "scope-depth",
      "question": "How detailed should the generated application be?",
      "reason": "The prompt is too short to infer the expected domain depth.",
      "options": ["minimal", "standard", "extended"]
    }
  ]
}
```

## Adding A Case

Add a `*.case.ts` file under `evals/cases/<suite>/`.

Each case should include:

- `id`
- `suite`
- `type`
- `input.prompt`
- optional `input.taskType`
- optional `input.manifest`
- optional `input.clarificationAnswers`
- `expected`
- `metadata`

Use realistic prompts and deterministic expectations. Prefer entity/page/relation identifiers and preservation rules over exact string snapshots.

## Adding A Scorer

1. Create a scorer in `evals/scorers/`.
2. Return `{ scorer, score, passed, diagnostics, evidence }`.
3. Register it in `evals/scorers/index.ts`.
4. Add a default weight in `evals/core/weights.ts` if it should contribute to the aggregate score.

## Adding A Provider Or Profile

Real AI providers belong in `libs/system-ai`, not in `evals`.

To add a new provider or routing profile:

1. Add the provider adapter in `libs/system-ai/src/server/providers/`.
2. Register it in `ProviderRouter`.
3. Extend env/profile handling in `libs/system-ai/src/server/runtime-config.ts`.
4. Run evals with `--profile=<name>` or `AI_PROFILE=<name>`.

## Running Locally

Compile the relevant libraries and run the harness:

```bash
pnpm evals:run
pnpm evals:run -- --suite=e2e
pnpm evals:run -- --type=create
pnpm evals:run -- --pipeline=refactored.default,baseline.no-rag
pnpm evals:run -- --tag=dashboard
pnpm evals:run -- --clarification-mode=enabled --suite=clarification
```

Refresh the Markdown report from the latest JSON report:

```bash
pnpm evals:report
```

Run only the eval harness tests:

```bash
pnpm evals:test
```

## Running In CI

Default CI usage should keep runtime mode at `compile-only` and clarification mode at `disabled` unless the job is dedicated to clarification replay.

Example:

```bash
pnpm evals:run -- --profile=fixture --runtime-mode=compile-only
```

## Validation And Runtime Hooks

Current validation stages reuse existing repo logic:

- `parseManifest`
- `validateManifestSemantics`
- `compileCellApp`

The default runtime evidence is compile-only so it stays fast and deterministic in CI. The runner surface already includes `runtimeMode` so preview/build hooks can be added later without changing the case or scorer model.

## Promptfoo

Promptfoo is intentionally not the core harness. If we add it later, it should call into this runner and reuse these scorers rather than replacing domain scoring with generic LLM judging.
