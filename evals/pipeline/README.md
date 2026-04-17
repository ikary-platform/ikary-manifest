# evals/pipeline

Pipeline adapters and their supporting components. Each adapter implements `EvalPipelineAdapter` and wraps one of the manifest generation flows for comparison.

## Adapters

| Name | Executor | Knowledge provider | Description |
|---|---|---|---|
| `refactored.default` | `EvalSystemAiManifestTaskExecutor` | `DefaultKnowledgeProvider` (blueprint retrieval) | The target pipeline: modular retrieval + context + clarification + execution + validation. |
| `baseline.no-rag` | `EvalSystemAiManifestTaskExecutor` | `NoopKnowledgeProvider` (returns nothing) | Same as refactored.default with retrieval disabled. Regression baseline. |
| `legacy.try-api` | `ManifestGeneratorService` (coupled) | none (prompt is built inline) | Replays the public try-api streaming generation path. Skips the clarification suite. |
| `legacy.studio-replay` | `LegacyStudioTaskExecutor` | `DefaultKnowledgeProvider` | Studio-inspired replay using a verbose multi-phase context assembly prompt. |

## Supporting files

| File | Purpose |
|---|---|
| `common.ts` | Shared factory functions: `createBlueprintLoader`, `createSystemAiTaskRunner`, `createDefaultModularPipeline`, `createManifestExecutor`, `getPromptRegistry`, `getPromptService`. |
| `types.ts` | `EvalPipelineAdapter`, `EvalPipelineContext`, `EvalPipelineResult` interfaces. |
| `index.ts` | `createPipelineRegistry` returns the four adapters in execution order. |
| `noop-knowledge.provider.ts` | Returns an empty array for retrieval. Used by `baseline.no-rag`. |
| `always-proceed-clarification.policy.ts` | Always returns `proceed` with no questions. |
| `legacy-studio-context.assembler.ts` | Verbose context assembly modeled after the legacy Studio's multi-phase prompt shape. |
| `legacy-studio-task.executor.ts` | Task executor that uses the `evals/legacy-studio-task` prompt from the prompt registry. |
| `system-ai-manifest-task.executor.ts` | Task executor that uses the `cell-ai/manifest-task` prompt. Same as the production executor but constructed without NestJS DI. |
