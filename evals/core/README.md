# evals/core

Shared infrastructure for the eval runner: schemas, data loading, scoring, aggregation, and report generation.

## Modules

| File | Purpose |
|---|---|
| `case-schema.ts` | Zod schemas for eval cases, scorer results, and the `EvalCaseExecution` interface. |
| `load-cases.ts` | Scans `cases/` for `*.case.ts` files, dynamically imports each, and validates against `evalCaseSchema`. |
| `task-input.ts` | Normalizes an `EvalCase` into a `ManifestTaskInput` for pipeline consumption. |
| `normalization.ts` | Normalizes raw pipeline results into scored `EvalCaseExecution` records. |
| `aggregation.ts` | Computes weighted scores and groups executions by arbitrary dimension (pipeline, suite, scorer). |
| `weights.ts` | `DEFAULT_SCORER_WEIGHTS` record mapping each scorer name to its weight. |
| `runner-schema.ts` | Zod schema for CLI runner options (`profile`, `verbose`, `pipelines`, `suites`, etc.). |
| `reporting.ts` | `buildEvalReport` aggregates executions into an `EvalReport`. `renderMarkdownReport` renders the markdown table output. |
| `html-renderer.ts` | `renderHtmlReport` produces a self-contained HTML file with aggregation cards, filters, and per-case detail. |
