---
applyTo: "libs/cell-primitives/src/runtime/**/*,libs/cell-primitives/src/registry/**/*,libs/cell-primitives/src/query/**/*,libs/cell-primitives/src/context/**/*,libs/cell-primitives/src/resolver/**/*,libs/cell-renderer/src/**/*,libs/cell-data/src/**/*,libs/cell-runtime-core/src/**/*,apps/cell-runtime-api/src/**/*,apps/cell-preview-server/src/**/*,apps/cli/src/**/*"
excludeAgent: "cloud-agent"
---

Review this PR as runtime and integration code.

Prioritize:
- adapter, resolver, registry, and service boundaries stay intact; avoid hidden coupling between manifests, runtime state, and rendered behavior
- registry and routing correctness: primitive lookup, version resolution, action wiring, entity paths, and page or entity linkage
- error handling and fallbacks for invalid manifests, unknown primitives, resolver failures, missing records, version conflicts, and transport faults
- extensibility for custom primitives, custom adapters, live vs mock data modes, and future runtimes

Good looks like:
- services and controllers separate validation, persistence, audit, and transport concerns
- runtime helpers are deterministic and do not hide invalid state
- entity runtime preserves soft-delete, audit, rollback, and `expectedVersion` conflict behavior
- CLI, preview, runtime API, and shared scaffolds stay in sync when commands, ports, or templates change

Flag regressions:
- resolver or query code doing work that belongs in services, adapters, or hooks
- registry changes that break latest or version resolution or custom override behavior
- runtime code assuming a field, route, auth header, or adapter response always exists
- copied constants, catalogs, or templates drifting across runtime surfaces

Ignore:
- micro-optimizations without evidence
- styling comments when the real risk is correctness, coupling, or extensibility
