# DashboardPage Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `DashboardPage` primitive for Micro OS.

`DashboardPage` is the canonical overview page for a workspace, cell, domain area, or major entity context.

> It is not a generic landing page. It is not a marketing page. It is not a freeform widget canvas. It is not a report builder. Those concerns belong elsewhere.

---

## 1. Philosophy

`DashboardPage` exists to answer, at a glance:

- What matters right now
- What changed recently
- What needs attention
- What the user should do next

It should:

- Provide a clear operational overview
- Surface key metrics prominently
- Surface recent activity and current work
- Support action-oriented navigation
- Remain structured and enterprise-oriented

---

## 2. Usage

`DashboardPage` may be used for:

- Workspace dashboard
- Cell dashboard
- Team dashboard
- Domain dashboard
- Operational home page
- Role-based overview page

**Examples:**

- Finance dashboard
- Customer operations dashboard
- Compliance dashboard
- Support dashboard
- Project portfolio dashboard

`DashboardPage` should be the canonical overview surface for operational work.

---

## 3. Core Responsibilities

**`DashboardPage` owns:**

- Page shell
- Page header
- Dashboard layout zones
- Prominent KPI/metric area
- Widget composition
- Page-level dashboard actions
- Dashboard-level render-state handling

**`DashboardPage` must not own:**

- Widget-specific backend fetching logic
- Ad hoc chart framework design
- Freeform drag-and-drop builder behavior in V1
- Arbitrary personalization system in V1
- Deep report authoring behavior

---

## 4. Dashboard Philosophy

| A good dashboard is | A dashboard must not become |
| ------------------- | --------------------------- |
| Informative         | A dumping ground            |
| Actionable          | A noisy wall of cards       |
| Calm                | A mini BI tool              |
| Hierarchical        | A decorative collage        |
| Scannable           |                             |

Every widget must justify its existence.

---

## 5. Canonical Layout Structure

```
DashboardPageLayout
  ├── Header
  ├── KPI Strip
  ├── Primary Content Grid
  │   ├── Primary Widgets
  │   └── Secondary Widgets
  └── Optional Footer Area
```

The exact responsive arrangement may vary, but the zone hierarchy must remain recognizable.

---

## 6. Header Contract

The header is **mandatory**.

It must contain:

1. Title
2. Optional subtitle
3. Optional page-level actions

| ✅ Page-level action examples |
| ----------------------------- |
| Refresh dashboard             |
| Create record                 |
| Export summary                |
| Open reports                  |
| Configure view                |

These are page-level actions, not widget-level actions.

---

## 7. KPI Strip

The KPI strip is **strongly recommended**. It is the primary summary zone of the dashboard and should contain a small set of high-value summary widgets, typically `MetricCard`.

**Recommended V1 range:** 3–6 KPI cards.

| ✅ Examples        |
| ------------------ |
| Revenue this month |
| Open invoices      |
| High-risk alerts   |
| New customers      |
| Tasks overdue      |

Do not overload the KPI strip with too many cards.

---

## 8. Primary Content Grid

Below the KPI strip, the dashboard should present a structured grid of widgets supporting both primary and secondary widgets.

### 8.1 Primary widgets

Larger, higher-priority operational surfaces.

| ✅ Examples               |
| ------------------------- |
| Recent activity           |
| Work queue                |
| Approvals awaiting action |
| Open incidents            |
| Top opportunities         |

### 8.2 Secondary widgets

Supportive context surfaces.

| ✅ Examples          |
| -------------------- |
| Small trend card     |
| Reminders            |
| Announcements        |
| Health summary       |
| Compact list preview |

---

## 9. Widget Philosophy

Widgets are composable dashboard units.

**A widget should:**

- Have a clear title
- Have a clear purpose
- Fit one job
- Support scoped loading/error/empty states
- Remain compact and understandable

> A widget must not become a mini-application inside the dashboard.

---

## 10. Canonical Widget Types

A V1 dashboard may compose widgets such as:

- Metric widget
- Activity widget
- List widget
- Card-list widget
- Status/health widget
- Alert widget
- Compact chart widget if already standardized in the platform

> Do not require charts for a good V1 dashboard. A strong V1 dashboard can be excellent without chart-heavy design.

---

## 11. Recommended V1 Composition

A good V1 dashboard should usually include:

- A page header
- 3–6 metric cards
- 1 recent activity widget
- 1 work/list widget
- 1 status or attention widget

This is enough to feel complete without becoming noisy.

---

## 12. Widget Header Structure

```
Widget
  ├── Widget Header
  │   ├── Title
  │   ├── Optional subtitle
  │   └── Optional local actions
  └── Widget Body
```

| ✅ Widget-scoped action examples |
| -------------------------------- |
| Refresh                          |
| View all                         |
| Open details                     |
| Add item                         |

These actions are widget-scoped, not page-scoped.

---

## 13. Widget Layout Sizes

| Size     | Best for                                                          |
| -------- | ----------------------------------------------------------------- |
| `small`  | KPI cards, compact alerts, compact health cards                   |
| `medium` | Activity feed, short lists, operational summaries                 |
| `large`  | Main work queue, larger list previews, primary operational widget |

The runtime may map size to responsive grid spans.

---

## 14. Density

| Value         | Use for                                                                              |
| ------------- | ------------------------------------------------------------------------------------ |
| `comfortable` | Default dashboard pages, larger desktop surfaces, executive/managerial views         |
| `compact`     | Denser operational dashboards, embedded overview screens, space-constrained contexts |

> Default should generally be `comfortable`.

---

## 15. Variants

| Variant           | Meaning                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `workspace`       | High-level overview across a workspace                           |
| `cell`            | Operational overview of one cell/app area                        |
| `domain`          | Functional area overview such as finance, support, or compliance |
| `entity-overview` | Dashboard-like overview scoped to one major entity context       |

Variants may affect copy and widget mix, but not the core page semantics.

---

## 16. Render-State Handling

`DashboardPage` must support canonical page-level render-state handling.

| State     | When to use                                                    |
| --------- | -------------------------------------------------------------- |
| `loading` | The dashboard cannot yet render its overall shell meaningfully |
| `error`   | The dashboard fails at page level                              |
| `empty`   | The dashboard has no meaningful content to show at all         |

> Most empty conditions should remain widget-scoped rather than page-scoped.

---

## 17. Widget-Scoped States

Each widget should support scoped render states where appropriate.

**Examples:**

- One widget loading while others are available
- One widget empty while others have content
- One widget failed while the rest of the dashboard remains usable

> Widget failures must not automatically collapse the whole dashboard. This is a critical rule.

---

## 18. Actions

### 18.1 Page-level actions

Page-level actions belong in the `DashboardPage` header.

| ✅ Examples         |
| ------------------- |
| Refresh all         |
| Create record       |
| Open reporting      |
| Configure dashboard |

### 18.2 Widget-level actions

Widget-level actions belong inside the widget header.

| ✅ Examples |
| ----------- |
| View all    |
| Refresh     |
| Add task    |
| Open queue  |

Do not mix page-level and widget-level actions.

---

## 19. Refresh Behavior

`DashboardPage` may support refresh behavior.

**Recommended rules:**

- Page-level refresh should be explicit
- Widget-level refresh may be local
- Avoid constant aggressive auto-refresh in V1
- Preserve user trust with stable loading behavior

Do not create a dashboard that constantly jumps or repaints.

---

## 20. Personalization

V1 recommendation:

- Do not require drag-and-drop personalization
- Do not require per-user dashboard builders
- Do not require arbitrary widget marketplace composition

A good V1 dashboard should be opinionated and stable. Limited configurability may be added later.

---

## 21. Responsive Behavior

`DashboardPage` must remain usable across viewport sizes.

**Rules:**

- KPI strip may wrap
- Widget grid may collapse to fewer columns
- Large widgets may stack vertically
- Hierarchy must remain understandable

Do not rely on desktop-only composition assumptions.

---

## 22. Accessibility

`DashboardPage` must:

- Render a clear page title
- Preserve semantic widget structure
- Make all actions keyboard accessible
- Keep loading/error/empty states understandable to assistive technologies
- Not rely only on color or layout for meaning

Widgets must remain individually understandable.

---

## 23. Canonical Schema Shape

```ts
type DashboardPageAction = {
  key: string;
  label: string;
  icon?: string;
  href?: string;
  actionKey?: string;
  disabled?: boolean;
  variant?: 'default' | 'secondary' | 'destructive';
};

type DashboardWidgetAction = {
  key: string;
  label: string;
  icon?: string;
  href?: string;
  actionKey?: string;
  disabled?: boolean;
};

type DashboardWidget = {
  key: string;
  title: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  renderer: {
    key: string;
  };
  actions?: DashboardWidgetAction[];
  renderState?: {
    kind: 'loading' | 'empty' | 'error';
    state: unknown;
  };
};

type DashboardPagePresentation = {
  variant?: 'workspace' | 'cell' | 'domain' | 'entity-overview';
  density?: 'comfortable' | 'compact';
  title: string;
  subtitle?: string;
  actions?: DashboardPageAction[];
  kpis?: DashboardWidget[];
  primaryWidgets?: DashboardWidget[];
  secondaryWidgets?: DashboardWidget[];
  renderState?: {
    kind: 'loading' | 'error' | 'empty';
    state: unknown;
  };
};
```

---

## 24. Field Semantics

### 24.1 `variant`

Defines the dashboard context: `workspace`, `cell`, `domain`, or `entity-overview`.

### 24.2 `density`

Defines visual compactness.

### 24.3 `title`

Required dashboard page title.

### 24.4 `subtitle`

Optional helper text beneath the title.

### 24.5 `actions`

Optional page-level dashboard actions.

### 24.6 `kpis`

Optional KPI strip widgets. Strongly recommended for most dashboards.

### 24.7 `primaryWidgets`

Optional primary content widgets.

### 24.8 `secondaryWidgets`

Optional supporting widgets.

### 24.9 `renderState`

Optional root dashboard render-state.

> Use only for page-level loading/error/empty, not as a substitute for widget-local state.

---

## 25. Default Rendering Rules

Recommended defaults:

- Render page header first
- Render KPI strip next
- Render primary widgets before secondary widgets
- Keep widget headers consistent
- Keep local widget states scoped
- Keep page-level actions in the header only
- Prefer stable, opinionated widget composition in V1

---

## 26. Examples

### 26.1 Finance dashboard

```yaml
title: Finance Dashboard
kpis:
  - title: Revenue this month
  - title: Open invoices
  - title: Overdue payments
  - title: Cash collected
primaryWidgets:
  - title: Recent invoices
  - title: Payment activity
secondaryWidgets:
  - title: Alerts
  - title: Approval queue
```

### 26.2 Support operations dashboard

```yaml
title: Support Operations
kpis:
  - title: Open tickets
  - title: SLA breaches
  - title: Resolved today
primaryWidgets:
  - title: Unassigned tickets
  - title: Recent activity
secondaryWidgets:
  - title: Escalations
  - title: Team health
```

### 26.3 Empty startup dashboard

```yaml
title: Customer Dashboard
renderState:
  kind: empty
  state: {}
```

---

## 27. Governance

`DashboardPage` is the canonical operational overview page.

All dashboard-like overview surfaces should converge toward this primitive instead of inventing ad hoc homepages and widget layouts across cells and domains. Consistency is mandatory.

---

## 28. Implementation Notes

**Implementation should prefer:**

- Strong hierarchy
- Limited but valuable widget composition
- Scoped widget states
- Stable layout zones
- Reuse of `metric_card`, `activity_feed`, `card-list`, `data-grid`, and canonical state primitives

**Implementation must avoid:**

- Uncontrolled widget sprawl
- Page-level collapse because one widget failed
- Drag-and-drop builder behavior in V1
- Decorative analytics noise
- One-off dashboard layouts per module

> `DashboardPage` is generic and reusable by design.
