# Premium Blocks Lab

Isolated IKARY cell used as a design and primitive sandbox. Six cell-local
premium primitives live here; three example screens compose them into real
dashboards, detail views, and filtered workspaces.

## What lives here

```
samples/premium-blocks-lab/
  manifest.json              # Cell spec — entities, pages, slot bindings
  ikary-primitives.yaml      # Cell-local primitive registry
  primitives/
    dashboard-hero/
    kpi-cluster/
    trend-breakdown-section/
    entity-detail-hero/
    timeline-audit-rail/
    filtered-workspace/
  screens/                   # Programmatic compositions (for the studio)
  PROMOTION.md               # Which primitives are promotion candidates
```

## Running the cell

From the repo root:

```bash
# Build the workspace so dist/ is available
pnpm build

# Start the preview server against this cell
IKARY_MANIFEST_PATH=samples/premium-blocks-lab/manifest.json \
  pnpm --filter @ikary/cell-preview-server dev
```

The preview server picks up `ikary-primitives.yaml` via its Vite plugin and
registers every primitive listed there before the app boots. Open
`http://localhost:4500/` for the live cell or `/__primitive-studio/` for the
per-primitive studio.

## Screens

| Path | Demonstrates |
| --- | --- |
| `/overview` | `dashboard-hero`, `kpi-cluster`, `trend-breakdown-section`, `timeline-audit-rail` |
| `/accounts/:id` | `entity-detail-hero`, `kpi-cluster`, `timeline-audit-rail` |
| `/pipeline` | `filtered-workspace`, `kpi-cluster` |

## Why isolated

Building primitives here first gives us a fast iteration loop against a real
composed manifest. Only primitives that earn their keep over several demos get
promoted into `libs/cell-primitives/` with proper TS-first anatomy. See
`PROMOTION.md` for the current promotion slate.
