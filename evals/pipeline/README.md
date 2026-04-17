# evals/pipeline

Pipeline adapters and their supporting components. Each adapter implements `EvalPipelineAdapter` and wraps one of the manifest generation flows for comparison.

All adapters share one executor (`SystemAiManifestTaskExecutor` from `@ikary/cell-ai/server`) and one prompt (`cell-ai/manifest`). Adapters differ only in their `KnowledgeProvider`, `ContextAssembler`, and `ClarificationPolicy`.

## Adapters

| Name | Knowledge provider | Context assembler | Description |
|---|---|---|---|
| `refactored.default` | `DefaultKnowledgeProvider` (blueprint retrieval) | `DefaultContextAssembler` | The target pipeline: modular retrieval + context + clarification + execution + validation. |
| `baseline.no-rag` | `NoopKnowledgeProvider` (returns nothing) | `DefaultContextAssembler` | Same as refactored.default with retrieval disabled. Regression baseline. |
| `legacy.try-api` | none (prompt built inline) | inline | Replays the public try-api streaming generation path through `ManifestGeneratorService`. Skips the clarification suite. |
| `legacy.studio-replay` | `DefaultKnowledgeProvider` | `LegacyStudioContextAssembler` | Studio-inspired replay using a verbose multi-phase context assembly. |

## Supporting files

| File | Purpose |
|---|---|
| `common.ts` | Shared factories: `createBlueprintLoader`, `createSystemAiTaskRunner`, `createDefaultModularPipeline`, `createManifestExecutor`, `getPromptRegistry`, `getPromptService`. |
| `types.ts` | `EvalPipelineAdapter`, `EvalPipelineContext`, `EvalPipelineResult` interfaces. |
| `index.ts` | `createPipelineRegistry` returns the four adapters in execution order. |
| `noop-knowledge.provider.ts` | Returns an empty array for retrieval. Used by `baseline.no-rag`. |
| `always-proceed-clarification.policy.ts` | Always returns `proceed` with no questions. |
| `legacy-studio-context.assembler.ts` | Verbose context assembly modeled after the legacy Studio's multi-phase shape. The studio framing lives here, in the user message, not in a separate system prompt. |
