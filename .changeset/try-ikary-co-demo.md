---
"@ikary/cell-primitives": minor
"@ikary/system-ai": minor
"@ikary/cell-ai": minor
"@ikary/try-api": minor
"@ikary/try-demo": minor
---

Add `try.ikary.co` public demo, powered by two new libraries reusable across every Ikary surface:

- **`@ikary/system-ai`**: provider router (OpenRouter + multi-key rotation), sanitization stack (prompt-injection, PII, input-size), budget primitives. No cell knowledge.
- **`@ikary/cell-ai`**: cell-domain intelligence. Streaming manifest generator, string-literal-aware partial-JSON assembler, blueprint loader over `manifests/examples/`. Depends on `@ikary/cell-contract`.
- **`@ikary/cell-primitives`**: new `ThemeToggle` primitive (controlled or uncontrolled) with matching `useTheme` hook. Placed under `src/chrome/` to separate app-chrome primitives from manifest-driven ones.
- **`apps/try-api`**: NestJS service wiring the libs behind an SSE `/chat/stream` endpoint, a `/demo/status` kill-switch probe, and `/blueprints` fallback endpoints. Cloud Run ready.
- **`apps/try-demo`**: Vite + Tailwind SPA. Chat interface + live `CellAppRenderer` preview, animated onboarding background, blueprint-only fallback when AI is disabled, Run-locally slide panel. Cloudflare Pages ready.

The default model chain prefers free OpenRouter models (`gpt-oss-120b:free`, `qwen3-next`, `gemma-4-31b`) with `anthropic/claude-sonnet-4-5` as last-resort fallback, demonstrating that declarative manifest generation runs on a free tier.
