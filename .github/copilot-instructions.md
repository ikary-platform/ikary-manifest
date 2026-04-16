# GitHub Copilot code review instructions

This repo is Ikary Manifest: a pnpm/turbo monorepo for declarative Cell manifests, validation and compilation, React primitives and rendering, a NestJS runtime API, CLI tooling, and docs.

Keep these architecture boundaries in mind:
- `manifests/` is the language-neutral YAML source of truth.
- `libs/cell-contract` + `libs/cell-loader` + `libs/cell-engine` own load, validate, and compile.
- `libs/cell-presentation` + `libs/cell-primitives` + `libs/cell-renderer` + `libs/cell-data` own UI contracts and runtime rendering.
- `libs/cell-runtime-core` + `apps/cell-runtime-api` own entity CRUD, schema management, audit, rollback, and runtime persistence.
- `apps/cli` and `apps/mcp-server` expose authoring, validation, registry, and scaffold workflows.
- `apps/docs` should match actual commands, APIs, ports, and repo conventions.

Prioritize comments that catch:
- manifest/schema compatibility breaks or drift between structural validation, semantic validation, and compilation
- runtime bugs at adapter, resolver, registry, query, service, or controller boundaries
- public behavior drift across CLI, API, MCP, docs, examples, and tests
- missing regression coverage for changed behavior
- scaffold or catalog drift when primitive-related files change

Severity:
- blocker: merge would break core validation, compilation, CRUD/runtime flows, or clearly ship wrong public behavior
- major: likely runtime bug, compatibility break, missing validation, or cross-surface drift
- minor: maintainability or consistency issue with plausible future bugs
- nit: wording or style only; use sparingly

Review style:
- Prefer a few concrete, actionable findings over broad commentary.
- Cite the file(s), explain the impact, and suggest the smallest likely fix or test.
- Avoid noisy comments about formatting, import order, generated/build output, or `.changeset` wording unless directly relevant.
- Ignore legacy or playground-only polish unless the PR changes shipped behavior or repo conventions.
