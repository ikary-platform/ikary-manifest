---
applyTo: "libs/cell-contract/src/**/*,libs/cell-loader/src/**/*,libs/cell-engine/src/**/*,libs/cell-presentation/src/**/*,manifests/**/*.yaml,manifests/**/*.md,scripts/generate-json-schema.ts,apps/mcp-server/src/services/validation.service.ts,apps/mcp-server/src/services/json-schema.service.ts,apps/mcp-server/src/api/validation.controller.ts,apps/mcp-server/src/api/json-schema.controller.ts"
excludeAgent: "cloud-agent"
---

Review this PR as contract and schema code.

Prioritize:
- structural schemas, semantic validators, examples, and generated schema outputs stay semantically aligned
- naming stays stable and meaningful across YAML schemas, Zod types, API responses, and docs-facing identifiers
- backward compatibility risks are called out: renamed keys, tighter validation, changed defaults, or changed error field shapes
- layer boundaries stay clean: loader owns I/O, contract owns validation, engine owns normalization and derivation

Good looks like:
- Zod validates shape; semantic rules validate meaning and cross-reference integrity
- validation errors point to the right field or path and stay actionable
- engine derivations preserve manifest intent instead of silently hiding invalid input
- `manifests/` stays the language-neutral source of truth; generated JSON Schema is treated as structural-only output

Flag regressions:
- schema or validator changes without updated examples or tests
- normalization that accepts invalid input instead of rejecting it
- drift between YAML schemas, Zod schemas, semantic rules, and MCP validation surfaces
- inconsistent enum, key, or casing choices across related files

Ignore:
- renderer or styling concerns unless the contract change makes them incorrect
- wording nits in schema docs unless they misdescribe the actual contract
