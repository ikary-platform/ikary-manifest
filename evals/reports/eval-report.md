# IKARY Eval Report

Generated: 2026-04-16T16:12:34.185Z
Profile: fixture

## Summary

Total cases: 28
Completed: 27
Failed: 0
Needs clarification: 0
Skipped: 1
Average score: 0.94
Pass rate: 100.0%

## Pipelines

| Key | Total | Completed | Failed | Clarification | Skipped | Avg Score | Pass Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline.no-rag | 7 | 7 | 0 | 0 | 0 | 0.95 | 100.0% |
| legacy.studio-replay | 7 | 7 | 0 | 0 | 0 | 0.93 | 100.0% |
| legacy.try-api | 7 | 6 | 0 | 0 | 1 | 0.91 | 100.0% |
| refactored.default | 7 | 7 | 0 | 0 | 0 | 0.99 | 100.0% |

## Suites

| Key | Total | Completed | Failed | Clarification | Skipped | Avg Score | Pass Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| clarification | 4 | 3 | 0 | 0 | 1 | 0.92 | 100.0% |
| context | 4 | 4 | 0 | 0 | 0 | 0.95 | 100.0% |
| create | 4 | 4 | 0 | 0 | 0 | 0.91 | 100.0% |
| e2e | 4 | 4 | 0 | 0 | 0 | 0.94 | 100.0% |
| fix | 4 | 4 | 0 | 0 | 0 | 1.00 | 100.0% |
| retrieval | 4 | 4 | 0 | 0 | 0 | 0.92 | 100.0% |
| update | 4 | 4 | 0 | 0 | 0 | 0.97 | 100.0% |

## Task Families

| Key | Total | Completed | Failed | Clarification | Skipped | Avg Score | Pass Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| clarification | 4 | 3 | 0 | 0 | 1 | 0.92 | 100.0% |
| context | 4 | 4 | 0 | 0 | 0 | 0.95 | 100.0% |
| create | 4 | 4 | 0 | 0 | 0 | 0.91 | 100.0% |
| e2e | 4 | 4 | 0 | 0 | 0 | 0.94 | 100.0% |
| fix | 4 | 4 | 0 | 0 | 0 | 1.00 | 100.0% |
| retrieval | 4 | 4 | 0 | 0 | 0 | 0.92 | 100.0% |
| update | 4 | 4 | 0 | 0 | 0 | 0.97 | 100.0% |

## Scorers

| Scorer | Avg Score | Pass Rate | Failures |
| --- | ---: | ---: | ---: |
| assumptionsScorer | 0.85 | 85.2% | 4 |
| clarificationDecisionScorer | 0.89 | 88.9% | 3 |
| clarificationQuestionShapeScorer | 1.00 | 100.0% | 0 |
| contextAssemblyScorer | 0.52 | 48.1% | 14 |
| e2eSuccessScorer | 1.00 | 100.0% | 0 |
| expectedEntitiesScorer | 1.00 | 100.0% | 0 |
| expectedPagesScorer | 1.00 | 100.0% | 0 |
| expectedPrimitivesScorer | 1.00 | 100.0% | 0 |
| expectedRelationsScorer | 1.00 | 100.0% | 0 |
| forbiddenItemsScorer | 1.00 | 100.0% | 0 |
| parseValidScorer | 1.00 | 100.0% | 0 |
| preservationScorer | 1.00 | 100.0% | 0 |
| requiredFieldsScorer | 1.00 | 100.0% | 0 |
| retrievalAlignmentScorer | 0.78 | 77.8% | 6 |
| runtimeScorer | 1.00 | 100.0% | 0 |
| schemaValidScorer | 1.00 | 100.0% | 0 |
| semanticValidScorer | 1.00 | 100.0% | 0 |

## Clarification

Asked cases: 0
Resumed cases: 0
Successful after clarification: 0

## Retrieval And Context

Average retrieval hits: 2.50
Cases with retrieval hits: 14
Average assembled context size: 1826.29 chars

## Latency And Cost

Average latency: 18.18 ms
Max latency: 52.00 ms
Total cost: $0.00
Total input tokens: 846
Total output tokens: 33874

## Common Failure Reasons

- Retrieved Context (9)
- Task Type: create (7)
- projects/01-task-tracker (6)
- Use sensible CRUD defaults unless the prompt explicitly requests otherwise. (4)
- Expected shouldAsk=true but got status completed. (3)
- Prompt: (2)
- Existing Manifest (2)
- Task Type: update (2)

## Worst Cases

- legacy.try-api / create.task-tracker: completed @ 0.84 — projects/01-task-tracker
- baseline.no-rag / retrieval.task-tracker: completed @ 0.88 — projects/01-task-tracker
- legacy.try-api / e2e.task-tracker: completed @ 0.88 — projects/01-task-tracker
- legacy.try-api / retrieval.task-tracker: completed @ 0.88 — projects/01-task-tracker
- legacy.studio-replay / clarification.minimal-crm: completed @ 0.88 — Task Type: create
- baseline.no-rag / create.task-tracker: completed @ 0.91 — projects/01-task-tracker
- legacy.try-api / context.task-tracker: completed @ 0.91 — Task Type: create
- legacy.studio-replay / context.task-tracker: completed @ 0.91 — Task Type: create
- legacy.studio-replay / create.task-tracker: completed @ 0.91 — Task Type: create
- refactored.default / clarification.minimal-crm: completed @ 0.94 — Expected shouldAsk=true but got status completed.
