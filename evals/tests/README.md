# evals/tests

Vitest tests for the eval harness infrastructure. Run with `pnpm evals:test`.

## Test files

| File | Covers |
|---|---|
| `clarification-flow.test.ts` | Clarification replay: pipeline asks a question, runner replays with answers, scorer validates the decision. |
| `html-renderer.test.ts` | HTML report: structure, headline stats, per-case rendering, XSS escaping, status badges, empty state, system prompt/raw response blocks, anchor links. |
| `load-cases.test.ts` | Dynamic case loading: validates that all `*.case.ts` files in `evals/cases/` parse against `evalCaseSchema`. |
| `normalization.test.ts` | Result normalization between pipeline output and `EvalCaseExecution` records. |
| `scorers-and-reporting.test.ts` | Scorer execution and report generation: runs all 17 scorers on a fixture case, builds a report, and validates the aggregate shape. |
