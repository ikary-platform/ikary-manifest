---
'@ikary/system-mcp': minor
'@ikary/system-ai': minor
'@ikary/cell-ai': minor
'@ikary/try-api': minor
---

Three layered changes that take the Haiku 4.5 eval suite from 0.67 avg / 18%
pass rate to 0.944 avg / 100% pass rate across all four pipelines.

**Executor and prompt consolidation.** Three manifest executors
(`SystemAiManifestTaskExecutor`, `EvalSystemAiManifestTaskExecutor`,
`LegacyStudioTaskExecutor`) and three system prompts collapse into one
executor rendering a single `cell-ai/manifest` prompt. Per-pipeline
differences (retrieval, clarification, framing) live in each pipeline's
`ContextAssembler`.

**MCP integration via new `@ikary/system-mcp` library.** The executor fetches
the canonical schema via `get_manifest_schema` on startup and injects it into
the system prompt. Every generation is post-validated via `validate_manifest`;
on failure the executor runs a bounded fix loop driven by
`explain_validation_errors`. Endpoint resolution tries `IKARY_MCP_URL` first,
then `localhost:4502`, then `public.ikary.co`; falls back to in-code Zod
validation when every endpoint is unreachable so evals never hard-fail on
infrastructure.

**Rate-limit handling.** New `RateLimitedException` surfaces HTTP 429
distinctly; the runner honors `Retry-After` and retries the same model up to
`AI_RATE_LIMIT_MAX_RETRIES_SAME_MODEL` times before rotating. The Anthropic
provider wraps the system prompt with `cache_control: ephemeral` when above
the 4096-token minimum and parses `cache_creation_input_tokens` /
`cache_read_input_tokens` into new telemetry fields. The eval runner gains
`--rate-limit-delay-ms` for inter-case pacing. Jittered exponential backoff
between fix-loop retries avoids burst patterns that trip acceleration limits.

New env knobs: `MANIFEST_VALIDATION_MAX_FIX_ATTEMPTS`, `IKARY_MCP_URL`,
`IKARY_MCP_LOCAL_URL`, `IKARY_MCP_PUBLIC_URL`, `AI_PROMPT_CACHE_ENABLED`,
`AI_RATE_LIMIT_RETRY_AFTER_MAX_MS`, `AI_RATE_LIMIT_MAX_RETRIES_SAME_MODEL`,
`AI_RATE_LIMIT_BACKOFF_BASE_MS`, `EVAL_RATE_LIMIT_DELAY_MS`.
