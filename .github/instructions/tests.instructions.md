---
applyTo: "**/*.spec.ts,**/*.spec.tsx,**/*.test.ts,**/*.test.tsx,**/vitest.config.ts,vitest.workspace.ts,scripts/check-docs-freshness.mjs,scripts/check-docs-command-smoke.mjs"
excludeAgent: "cloud-agent"
---

Review this PR as test and verification code.

Prioritize:
- changed behavior has regression coverage at the right level: unit, integration, or e2e
- tests assert contract or runtime semantics, not just snapshots or happy-path formatting
- fixtures match real manifest and runtime shapes and fail for the right reasons
- test configs and helper scripts still reflect how the repo is actually run

Good looks like:
- contract changes update semantic validation tests
- runtime and API changes cover CRUD, audit, rollback, version conflicts, and error paths
- docs or CLI changes update smoke and freshness checks when public commands or outputs change
- tests stay deterministic and avoid hidden global state, timing, or order coupling

Flag regressions:
- behavior changes with no changed tests
- tests that only exercise mocks while skipping the real contract or runtime boundary
- brittle assertions on formatting when the real value is behavior, shape, or error category
- expanded coverage exclusions or lowered thresholds used to avoid testing the change

Ignore:
- requests for more tests when a pure refactor is already well covered
- minor test style preferences if the assertions are clear and durable
