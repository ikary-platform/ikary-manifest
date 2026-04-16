---
applyTo: "libs/cell-primitives/src/primitives/**/*,libs/cell-primitives/src/index.ts,libs/cell-primitives/src/registry.ts,libs/cell-primitive-contract/src/**/*,libs/cell-primitive-studio/src/**/*,apps/cli/src/commands/primitive-*.ts,apps/mcp-server/src/data/primitive-catalog.ts"
excludeAgent: "cloud-agent"
---

Review this PR as primitive-system code.

Prioritize:
- primitive shape stays consistent across component, adapter, resolver, register file, examples, and scaffold/template updates
- contract props stay declarative; live state and handlers stay in runtime inputs
- loading, empty, and error states are preserved instead of assuming happy-path data
- registry keys, labels, categories, versions, overrides, and catalog entries stay aligned

Good looks like:
- components render resolved props; mapping logic lives in adapter and resolver layers
- resolvers are thin and deterministic; adapters translate and default, not fetch or orchestrate
- inputs and actions keep basic accessibility: labels, button semantics, disabled state, readable fallback text
- scaffolded files and validation commands remain internally consistent

Flag regressions:
- raw contract parsing duplicated inside JSX
- missing registration or export wiring
- catalog or scaffold drift across `apps/cli`, `libs/cell-primitive-contract`, and `apps/mcp-server`
- breaking prop, key, category, or version changes without compatibility handling

Ignore:
- backend controller or persistence concerns unless primitive changes actually affect runtime contracts
- visual taste debates if composition, states, and behavior are correct
