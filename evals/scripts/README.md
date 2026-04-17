# evals/scripts

CLI entrypoints for running evals and regenerating reports.

## run.ts

Runs the eval harness end to end: loads cases, executes each case across selected pipelines, scores the results, and writes JSON + Markdown + HTML reports.

```bash
pnpm evals:run                                         # fixture profile, all cases, all pipelines
pnpm evals:run -- --profile=live --case=create.task-tracker  # single case against a real provider
pnpm evals:run -- --verbose                            # print each prompt/response to stdout
pnpm evals:run -- --pipeline=refactored.default --suite=create
```

CLI flags:

| Flag | Default | Description |
|---|---|---|
| `--profile` | `fixture` (or `AI_PROFILE` env) | Provider profile. `fixture` uses mock responses. |
| `--pipeline` | all | Comma-separated list of pipeline adapters to run. |
| `--suite` | all | Comma-separated list of suites to include. |
| `--type` | all | Comma-separated list of task types. |
| `--case` | all | Comma-separated list of case IDs. |
| `--tag` | all | Comma-separated list of tags (cases must match all). |
| `--clarification-mode` | `disabled` | `enabled` replays clarification answers from the case. |
| `--runtime-mode` | `compile-only` | `preview` adds runtime preview checks. |
| `--verbose` | false | Print each LLM interaction (system prompt, user message, response) to stdout. |
| `--reports-dir` | `evals/reports` | Output directory. |
| `--cases-dir` | `evals/cases` | Cases directory. |

## report.ts

Re-renders the Markdown and HTML reports from the existing `eval-report.json`. Does not re-run any cases.

```bash
pnpm evals:report
```
