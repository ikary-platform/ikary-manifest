# MetricCard Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `MetricCard` primitive for Micro OS.

`MetricCard` is the canonical KPI / summary metric primitive for dashboards, overview pages, and compact operational summaries.

> It is not a chart. It is not a report. It is not a generic content card. It is not responsible for dashboard layout. Those concerns belong elsewhere.

---

## 1. Philosophy

`MetricCard` exists to communicate one important number or status quickly and clearly.

It should:

- Surface one primary metric prominently
- Remain scannable at a glance
- Provide lightweight supporting context
- Support trend or delta when meaningful
- Remain compact and reusable

---

## 2. Usage

`MetricCard` may be used for:

- KPI strips
- Dashboard overview sections
- Compact summary panels
- Operational counters
- Financial summary cards
- Risk or health summary cards

**Examples:**

- Revenue this month
- Open invoices
- Overdue tasks
- New customers
- SLA breaches
- Active users
- High-risk alerts

`MetricCard` should be the canonical surface for summary metrics.

---

## 3. Core Responsibilities

**`MetricCard` owns:**

- Metric label
- Primary value
- Optional subtitle/context
- Optional trend/delta
- Optional tone/status emphasis
- Optional icon
- Optional action/navigation affordance
- Local render-state handling if provided

**`MetricCard` must not own:**

- KPI computation logic
- Dashboard grid placement
- Heavy visualization logic
- Multi-series analytics
- Business-specific trend calculation rules

---

## 4. Core Principles

### 4.1 One card, one metric

A `MetricCard` should focus on one primary metric. Do not overload one card with multiple unrelated values.

### 4.2 Scannability

The card should be understandable in seconds. A user should quickly identify what the metric is, the current value, and whether it is improving, worsening, or stable if such context is shown.

### 4.3 Calm hierarchy

The visual hierarchy should be:

1. Label
2. Value
3. Optional delta
4. Optional subtitle/context

The card should feel calm and enterprise-oriented.

### 4.4 Context over decoration

Supportive elements such as icons, trends, and tones should help interpretation. They must not overwhelm the metric itself.

---

## 5. Visual Structure

```
MetricCard
  ├── optional header row
  │   ├── label
  │   ├── optional icon
  │   └── optional action affordance
  ├── primary value
  ├── optional delta / trend row
  └── optional subtitle / helper text
```

The structure must remain lightweight and recognizable.

---

## 6. Label

The label is **required**. It must describe the metric clearly and briefly.

| ✅ Good            | ❌ Avoid |
| ------------------ | -------- |
| Revenue this month | Data     |
| Open invoices      | Summary  |
| Overdue tasks      | Stats    |
| New customers      |          |

---

## 7. Value

The value is **required**. It is the primary content of the card.

| ✅ Examples |
| ----------- |
| `€128,400`  |
| `43`        |
| `12.4%`     |
| `7`         |

The value may be rendered as text, number, currency, or percentage according to upstream formatting. `MetricCard` itself must not perform domain-specific KPI computation.

---

## 8. Subtitle

The subtitle is **optional**. It provides lightweight supporting context and must remain secondary to the value.

| ✅ Examples         |
| ------------------- |
| vs last month       |
| in the last 7 days  |
| requiring attention |
| across all teams    |

---

## 9. Delta / Trend

Delta is **optional**. Use it when trend context helps interpret the metric.

| ✅ Examples |
| ----------- |
| `+12.4%`    |
| `-8`        |
| `No change` |

Delta should support a direction: `up`, `down`, or `neutral`. Direction does not necessarily imply good or bad without business context. The UI may apply tone or iconography, but must not make unsupported assumptions.

---

## 10. Tone

`MetricCard` may support a tone to communicate semantic emphasis.

| Tone      | When to use            |
| --------- | ---------------------- |
| `default` | No special emphasis    |
| `success` | Positive emphasis      |
| `warning` | Warning emphasis       |
| `danger`  | Risk emphasis          |
| `info`    | Informational emphasis |

> Tone must remain supportive. It must not replace the actual metric value or label.

---

## 11. Icon

An icon is **optional**. Use it only when it improves scanning or categorization. The icon must remain secondary to the metric — do not use icons decoratively without meaning.

| ✅ Examples       |
| ----------------- |
| Revenue icon      |
| Alert triangle    |
| User count        |
| Invoice indicator |
| Task indicator    |

---

## 12. Action Affordance

`MetricCard` may support a lightweight action affordance such as a link to a detail page, a related list, a dashboard drill-down, or a lightweight action trigger.

Action affordance must remain secondary to the metric. Do not turn `MetricCard` into a button-heavy component.

---

## 13. Variants

| Variant    | When to use                             |
| ---------- | --------------------------------------- |
| `default`  | Standard dashboard metric card          |
| `compact`  | Smaller summary card for denser layouts |
| `emphasis` | Especially important or hero KPIs       |

Variants may affect spacing and typography, but not the core semantics.

---

## 14. Density

| Value         | Use for                                                             |
| ------------- | ------------------------------------------------------------------- |
| `comfortable` | Standard dashboard KPI strips, overview pages, executive dashboards |
| `compact`     | Dense operational dashboards, side panels, embedded summary areas   |

---

## 15. Local Render States

`MetricCard` may support local render-state handling for when one KPI is loading or unavailable without collapsing the whole dashboard.

| State     | Meaning                              |
| --------- | ------------------------------------ |
| `loading` | Metric value is being fetched        |
| `empty`   | No meaningful value is available yet |
| `error`   | Metric failed to load independently  |

> Do not escalate one metric failure to a page-level failure.

---

## 16. Empty Semantics

A metric may sometimes have no meaningful value yet.

| ✅ Examples           |
| --------------------- |
| No data yet           |
| No activity recorded  |
| No baseline available |

This should be treated calmly. A local empty state must not feel like an error.

---

## 17. Error Semantics

If a metric fails to load independently, the card may show a scoped error state while the rest of the dashboard remains usable. The card must not own backend retry logic beyond an optional UI affordance.

---

## 18. Accessibility

`MetricCard` must:

- Render a clear metric label
- Preserve semantic text for value and subtitle
- Make any action affordance keyboard accessible
- Not rely only on color to communicate tone or trend
- Keep local states understandable to assistive technologies

---

## 19. Behavior

`MetricCard` is a presentational summary primitive.

It may expose interaction hooks according to repo conventions, such as click, action click, navigation through `href`, and action dispatch through `actionKey`.

It must not own:

- KPI calculation
- Polling logic
- Backend fetching logic
- Dashboard layout logic
- Business-specific metric semantics

---

## 20. Canonical Schema Shape

```ts
type MetricCardAction = {
  label: string;
  href?: string;
  actionKey?: string;
};

type MetricCardPresentation = {
  variant?: 'default' | 'compact' | 'emphasis';
  density?: 'comfortable' | 'compact';
  label: string;
  value: string;
  subtitle?: string;
  delta?: string;
  deltaDirection?: 'up' | 'down' | 'neutral';
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  icon?: string;
  action?: MetricCardAction;
  renderState?: {
    kind: 'loading' | 'empty' | 'error';
    state: unknown;
  };
};
```

---

## 21. Field Semantics

### 21.1 `variant`

Defines the card emphasis level: `default`, `compact`, or `emphasis`.

### 21.2 `density`

Defines visual compactness.

### 21.3 `label`

Required metric label.

### 21.4 `value`

Required primary metric value.

### 21.5 `subtitle`

Optional supporting context.

### 21.6 `delta`

Optional trend or change string.

### 21.7 `deltaDirection`

Optional trend direction: `up`, `down`, or `neutral`.

### 21.8 `tone`

Optional semantic emphasis tone.

### 21.9 `icon`

Optional icon identifier.

### 21.10 `action`

Optional lightweight action or navigation affordance.

> At least one of `href` or `actionKey` should be present when `action` is provided.

### 21.11 `renderState`

Optional local metric-card render state.

> Use only for card-scoped loading/empty/error.

---

## 22. Default Rendering Rules

Recommended defaults:

- Render label first
- Render value prominently
- Render delta only when meaningful
- Render subtitle below value/delta
- Keep icon subtle
- Keep action affordance lightweight
- Keep local state scoped to the card

---

## 23. Examples

### 23.1 Revenue KPI

```yaml
label: Revenue this month
value: €128,400
delta: +12.4%
deltaDirection: up
tone: success
```

### 23.2 Open invoices

```yaml
label: Open invoices
value: 43
subtitle: Awaiting payment
```

### 23.3 High-risk alerts

```yaml
label: High-risk alerts
value: 7
tone: danger
icon: alert-triangle
```

### 23.4 Compact operational card

```yaml
variant: compact
density: compact
label: Overdue tasks
value: 12
```

### 23.5 Scoped loading state

```yaml
label: New customers
value: —
renderState:
  kind: loading
  state: {}
```

---

## 24. Governance

`MetricCard` is the canonical summary-metric primitive.

All KPI-like summary cards should converge toward this primitive instead of inventing ad hoc metric cards across dashboards and overview pages. Consistency is mandatory.

---

## 25. Implementation Notes

**Implementation should prefer:**

- Strong text hierarchy
- Compact and readable layout
- Optional but restrained trend/tone support
- Scoped local states
- Reuse across dashboards, overview pages, and summary panels

**Implementation must avoid:**

- Chart-heavy behavior
- Multi-metric overload
- Decorative card noise
- Backend-coupled KPI logic
- One-off custom KPI card designs per page

> `MetricCard` is generic and reusable by design.
