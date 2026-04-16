# Promotion assessment

Each cell-local primitive listed below has a candidacy rating plus the concrete
work needed to move it into `libs/cell-primitives/` with the mature TS-first
anatomy (`.types.ts`, `.adapter.ts`, `.resolver.ts`, `.register.ts`,
`.example.ts`, barrel `index.ts`, and a `.md` spec).

## Proposed scope model

IKARY currently recognizes two primitive sources: `core` and `custom`. This
lab suggests a finer third category during promotion review:

| Scope | Where it lives | When to use |
| --- | --- | --- |
| `cell` | `cells/<cell>/primitives/` | First draft, tied to one cell's data model |
| `shared` | `libs/cell-primitives-shared/` (proposed) | Reused by 2+ cells but not yet core-worthy |
| `core` | `libs/cell-primitives/src/primitives/` | General-purpose, documented, stable |

Cells already live fully at `cell` scope via
`apps/cell-preview-server/vite.config.ts`'s virtual-module plugin. The
`shared` tier is a lightweight second step before committing to `core`.

## Per-primitive assessment

### dashboard-hero — Promote (candidate)
A screen-opening hero with a title, subtitle, metadata strip, and three slot
regions (`actions`, `secondary`, `aside`) is a universally useful pattern.
Work before promotion:

- Move presentation schema out to `libs/cell-presentation/src/contract/dashboard-hero/DashboardHeroPresentationSchema.ts`.
- Split props into a `types.ts` + `adapter.ts` pair.
- Add a spec doc describing density, layout modes, and accessibility rules.

No customer-specific assumptions in the current draft.

### kpi-cluster — Promote (strong candidate)
Grid of KPI tiles with trend deltas is common. Work:

- Rename the `variant` field to match the core tokens (`default | subtle | emphasis`).
- Document how `trend.direction` maps to the up/down icon set.
- Decide whether currency formatting belongs in the primitive or the resolver.

### trend-breakdown-section — Hold (promote later)
Strong visual but charts are opinionated. Before promotion:

- Keep the component free of any concrete chart lib dep; inject the chart as
  a slot (which it already does).
- Decide whether the `breakdown` slot's row schema should be part of the
  primitive or handled by a sibling `kpi-cluster` binding.
- Add keyboard and screen-reader story for the breakdown list.

### entity-detail-hero — Promote (candidate)
Detail-screen hero used for any "one thing" page. Work:

- Promote the badge shape into a shared badge primitive rather than inlining
  it. Currently renders badges inline.
- Decide the canonical shape of `facts` vs generic `details` rows.
- Add an optional `avatar` resolver so URLs can be supplied by a data layer
  instead of the manifest.

### timeline-audit-rail — Hold (promote later)
The rail layout itself is reusable, but the "audit" naming leaks a use case.
Before promotion:

- Rename to `timeline-rail` and move audit-specific semantics into the
  consumer.
- Consider whether group headers should be a separate primitive.
- Add a virtualization strategy for long histories (out of scope for the
  cell draft).

### filtered-workspace — Promote (strong candidate)
Toolbar + content + aside with empty/loading states is a frequent pattern.
Work:

- Promote the toolbar chip shape into a shared chip primitive.
- Add a strict schema for the current filter model rather than accepting any
  array of pills.
- Decide the default empty-state body copy language source (should be
  resolver-provided, not hardcoded).

## Proposed future CLI flow

```bash
# Create inside a cell (current behavior):
ikary primitive add filtered-workspace --scope cell

# Move from cell to shared without losing history:
ikary primitive promote filtered-workspace --from cell --to shared

# Move from shared to core after review:
ikary primitive promote filtered-workspace --from shared --to core
```

`promote` would:
1. Copy the primitive directory to the target scope.
2. Rewrite register imports so the registry picks up the new path.
3. Update `ikary-primitives.yaml` (cell or shared registry) accordingly.
4. Leave a tombstone doc in the source scope linking to the new location.

This is a sketch. The current lab does not build any of that. It only keeps
the code organized so a future implementation is a straight refactor.
