# evals/scorers

Deterministic scorers. Each returns a `ScorerResult` with `score` (0 to 1), `passed` (boolean), `diagnostics` (string array), and optional `evidence`.

The aggregate score for a case is a weighted average using `DEFAULT_SCORER_WEIGHTS` from `evals/core/weights.ts`. Higher weight means more influence on the final number.

## Scorers

| Scorer | Weight | Pass condition | Purpose |
|---|---|---|---|
| `parseValidScorer` | 10 | Manifest parses as valid JSON. | Catches raw syntax errors in model output. |
| `schemaValidScorer` | 15 | Manifest passes the CellManifestV1 Zod schema. | Validates structural contract compliance. |
| `semanticValidScorer` | 20 | Manifest passes semantic checks (e.g. relation targets exist). | Catches cross-reference inconsistencies. |
| `runtimeScorer` | 20 | Manifest compiles via `compileCellApp`. | Validates the manifest is renderable by the Cell engine. |
| `expectedEntitiesScorer` | 10 | All entities listed in `expected.entities` are present. | Tests domain coverage. |
| `expectedRelationsScorer` | 5 | All relations listed in `expected.relations` are present. | Tests foreign-key wiring. |
| `expectedPagesScorer` | 5 | All pages listed in `expected.pages` are present. | Tests page coverage. |
| `expectedPrimitivesScorer` | 5 | All primitives listed in `expected.primitives` are present. | Tests primitive-type coverage. |
| `requiredFieldsScorer` | 5 | Manifest has required top-level fields (spec.entities, spec.pages, spec.navigation.items). | Catches truncated output. |
| `forbiddenItemsScorer` | 5 | None of the items listed in `expected.forbiddenItems` appear. | Catches unwanted entities or pages. |
| `preservationScorer` | 10 | All items listed in `expected.preservationRules` survive a fix/update. | Tests that unrelated structures are not deleted. |
| `retrievalAlignmentScorer` | 10 | Retrieved items match `expected.expectedRetrievalItems`. | Tests RAG accuracy. |
| `contextAssemblyScorer` | 10 | Assembled context contains `expected.expectedContextItems`. | Tests prompt-building correctness. |
| `clarificationDecisionScorer` | 10 | The pipeline asked/proceeded as expected by `expected.clarification.shouldAsk`. | Tests clarification policy. |
| `clarificationQuestionShapeScorer` | 5 | Clarification questions include the required IDs from `expected.clarification.requiredQuestionIds`. | Tests question structure. |
| `assumptionsScorer` | 5 | At least one assumption is recorded when expected. | Tests that the pipeline documents its choices. |
| `e2eSuccessScorer` | 10 | The pipeline completed without errors and the manifest passed validation. | Rollup scorer for full-pipeline health. |

## Adding a scorer

1. Create a file in this folder exporting a function with signature `(execution, testCase) => ScorerResult`.
2. Register it in `index.ts` by adding it to the `DEFAULT_SCORERS` array.
3. Add its weight in `evals/core/weights.ts`.
