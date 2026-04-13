# ActivityFeed Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `ActivityFeed` primitive for Micro OS.

`ActivityFeed` is the canonical recent-activity and operational timeline primitive for dashboards, overview pages, and embedded activity surfaces.

> It is not an audit log. It is not a comments thread. It is not a chat surface. It is not a workflow inbox. Those concerns belong elsewhere.

---

## 1. Philosophy

`ActivityFeed` exists to answer:

- What happened recently
- Who did it
- What it affected
- What may require attention next

It should:

- Surface recent operational activity clearly
- Remain readable and scannable
- Provide human-friendly event summaries
- Support quick drill-down into related records
- Remain lighter and more curated than a compliance audit log

---

## 2. Usage

`ActivityFeed` may be used for:

- Dashboard recent activity
- Workspace overview
- Team activity stream
- Domain activity summary
- Entity-related activity preview
- Operational timeline widgets

**Examples:**

- Recent customer updates
- Newly created invoices
- Status changes
- Approvals completed
- Tasks assigned
- Documents uploaded
- Alerts triggered

`ActivityFeed` should be the canonical surface for readable operational recency.

---

## 3. Core Responsibilities

**`ActivityFeed` owns:**

- Feed title and optional subtitle
- Ordered list of activity items
- Item-level activity presentation
- Optional local actions such as "View all"
- Local render-state handling
- Compact recency-oriented display

**`ActivityFeed` must not own:**

- Compliance-grade event storage
- Exhaustive audit filtering
- Backend event reconstruction logic
- Threaded discussion behavior
- Workflow assignment management
- Page-level dashboard layout

---

## 4. ActivityFeed vs AuditLog

`ActivityFeed` and `AuditLog` are not interchangeable.

| Use `ActivityFeed` when the goal is | Use `AuditLog` when the goal is |
| ----------------------------------- | ------------------------------- |
| Operational awareness               | Compliance                      |
| Readable recency                    | Exhaustiveness                  |
| Dashboard usefulness                | Traceability                    |
| Curated recent events               | Formal system transparency      |
|                                     | Filterable event history        |

`ActivityFeed` should feel lighter and more human-readable than `AuditLog`.

---

## 5. Core Principles

### 5.1 Human-readable first

Each activity item should read naturally.

| ✅ Prefer                           | ❌ Avoid             |
| ----------------------------------- | -------------------- |
| Alice approved invoice INV-2026-014 | `invoice.approved`   |
| Bob uploaded 3 attachments          | `attachment.created` |
| Customer Acme Corp was created      | `entity.updated`     |

Machine event types may exist as metadata, but must not be the main presentation text.

### 5.2 Recency-oriented

`ActivityFeed` is primarily about recent and relevant events. The feed should be ordered by recency unless explicitly configured otherwise. Newest first is the default.

### 5.3 Curated, not exhaustive

A good activity feed is selective. It should highlight meaningful activity, not every low-level state mutation. `ActivityFeed` must not become a noisy system dump.

### 5.4 Actionable context

A user should be able to understand who acted, what happened, what record or area was affected, and whether they can open the related item.

---

## 6. Visual Structure

```
ActivityFeed
  ├── Header
  │   ├── Title
  │   ├── Optional subtitle
  │   └── Optional actions
  └── Feed List
      ├── Activity Item
      ├── Activity Item
      └── Activity Item
```

The component must remain compact and timeline-like without becoming visually heavy.

---

## 7. Header

The header is **recommended**. It may contain a title, optional subtitle, and optional local actions.

| ✅ Examples of local actions |
| ---------------------------- |
| View all                     |
| Refresh                      |
| Open activity page           |

These are feed-scoped actions, not page-level actions.

---

## 8. Activity Item Structure

```
ActivityItem
  ├── optional icon / tone marker
  ├── primary summary
  ├── optional secondary metadata row
  │   ├── actor
  │   ├── timestamp
  │   └── optional target/entity label
  └── optional item action / link
```

The summary must remain the most important part.

---

## 9. Required Item Meaning

Every activity item should communicate, directly or indirectly, an actor, an action, a target or context, and a time reference. If one of these is unavailable, the item should still remain understandable.

| ✅ Examples                                 |
| ------------------------------------------- |
| Alice approved invoice INV-2026-014         |
| 3 files were uploaded to Acme Corp          |
| New customer created                        |
| Task "Review contract" was assigned to Marc |

---

## 10. Actor Semantics

`actor` is **optional but strongly recommended**.

| ✅ Examples     |
| --------------- |
| Alice Martin    |
| System          |
| Salesforce Sync |
| API Client      |

`ActivityFeed` should be able to render events without a human actor, but actor context is valuable.

---

## 11. Timestamp Semantics

Timestamp is **strongly recommended**. The feed should support readable recency display.

| ✅ Examples      |
| ---------------- |
| 2 minutes ago    |
| Today at 09:14   |
| Yesterday        |
| 2026-03-12 09:14 |

Formatting may follow platform conventions, but timestamps must remain understandable and consistent.

---

## 12. Target / Entity Context

An activity item may include a target label or entity context to improve scannability and drill-down usefulness.

| ✅ Examples          |
| -------------------- |
| Invoice INV-2026-014 |
| Customer Acme Corp   |
| Project Atlas        |
| Contract Renewal Q2  |

---

## 13. Tone and Iconography

Items may support tone and icon to aid scanning. They must not overpower the summary text.

| Tone      | When to use                  |
| --------- | ---------------------------- |
| `default` | Neutral updates              |
| `info`    | Informational context        |
| `success` | Approved or completed events |
| `warning` | Escalations or warnings      |
| `danger`  | Failed or high-risk events   |

---

## 14. Item Actions

An activity item may support a lightweight action or link such as "Open invoice", "View customer", "Open task", or "See details". This action must remain secondary to the activity summary. Do not overload each item with many controls.

---

## 15. Feed Actions

The feed itself may support a small number of header-level actions.

| ✅ Examples          |
| -------------------- |
| View all             |
| Refresh              |
| Open activity center |

> Recommended maximum: one primary local action, optionally one secondary local action.

---

## 16. Variants

| Variant    | When to use                                           |
| ---------- | ----------------------------------------------------- |
| `default`  | Standard dashboard and overview feed                  |
| `compact`  | Smaller feed for denser layouts and side panels       |
| `timeline` | When chronological flow should be visually emphasized |

Variants may affect spacing and item chrome, but not the core semantics.

---

## 17. Density

| Value         | Use for                                                                       |
| ------------- | ----------------------------------------------------------------------------- |
| `comfortable` | Main dashboard activity widget, overview pages, full-width operational panels |
| `compact`     | Side panels, secondary dashboard widgets, dense admin screens                 |

---

## 18. Item Count and Limits

`ActivityFeed` may support a display limit. Typical V1 ranges: 5, 10, or 20 items.

A dashboard feed should usually be a preview, not a full infinite history surface. If more activity exists, prefer a `View all` action.

---

## 19. Local Render States

`ActivityFeed` may support local render-state handling.

| State     | Meaning                           |
| --------- | --------------------------------- |
| `loading` | Feed items are being fetched      |
| `empty`   | No recent activity is available   |
| `error`   | Feed failed to load independently |

> A failed activity feed must not collapse the whole dashboard.

---

## 20. Empty Semantics

A feed may validly have no recent activity. This should be presented calmly — an empty feed is not an error.

| ✅ Examples                        |
| ---------------------------------- |
| No recent activity                 |
| No updates yet                     |
| No activity in the selected period |

---

## 21. Error Semantics

If a feed fails to load independently, it may show a scoped error state and allow a lightweight retry if the UI pattern supports it, while keeping the rest of the page usable. `ActivityFeed` must not own backend retry logic beyond UI affordance.

---

## 22. Accessibility

`ActivityFeed` must:

- Render a clear title when used with a header
- Keep item summaries readable and semantic
- Make feed-level and item-level actions keyboard accessible
- Not rely only on color to communicate tone
- Make local loading/empty/error states understandable to assistive technologies

---

## 23. Behavior

`ActivityFeed` is a presentational recent-activity primitive.

It may expose interaction hooks according to repo conventions, such as item click, item action click, feed action click, navigation through `href`, and action dispatch through `actionKey`.

It must not own:

- Event sourcing logic
- Backend fetching logic
- Audit reconstruction logic
- Threaded discussion logic
- Dashboard layout logic

---

## 24. Canonical Schema Shape

```ts
type ActivityFeedAction = {
  label: string;
  href?: string;
  actionKey?: string;
};

type ActivityFeedItem = {
  key: string;
  summary: string;
  actor?: string;
  timestamp?: string;
  targetLabel?: string;
  icon?: string;
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger';
  href?: string;
  actionKey?: string;
};

type ActivityFeedPresentation = {
  variant?: 'default' | 'compact' | 'timeline';
  density?: 'comfortable' | 'compact';
  title?: string;
  subtitle?: string;
  items: ActivityFeedItem[];
  limit?: number;
  action?: ActivityFeedAction;
  renderState?: {
    kind: 'loading' | 'empty' | 'error';
    state: unknown;
  };
};
```

---

## 25. Field Semantics

### 25.1 `variant`

Defines the feed presentation style: `default`, `compact`, or `timeline`.

### 25.2 `density`

Defines visual compactness.

### 25.3 `title`

Optional feed title.

### 25.4 `subtitle`

Optional supporting context below the title.

### 25.5 `items`

Required ordered activity items.

### 25.6 `limit`

Optional display limit for visible items.

### 25.7 `action`

Optional feed-level action such as `View all`.

> At least one of `href` or `actionKey` should be present when `action` is provided.

### 25.8 `renderState`

Optional feed-scoped render state.

> Use only for local loading/empty/error.

---

## 26. Item Field Semantics

### 26.1 `key`

Required stable item identifier.

### 26.2 `summary`

Required human-readable activity summary.

### 26.3 `actor`

Optional actor display label.

### 26.4 `timestamp`

Optional readable timestamp value.

### 26.5 `targetLabel`

Optional related record or context label.

### 26.6 `icon`

Optional icon identifier.

### 26.7 `tone`

Optional semantic tone.

### 26.8 `href`

Optional navigation target.

### 26.9 `actionKey`

Optional action dispatch key.

---

## 27. Default Rendering Rules

Recommended defaults:

- Order items newest first
- Render summary as the primary text
- Render actor and timestamp as secondary metadata
- Keep item actions lightweight
- Prefer a short preview with `View all`
- Keep local state scoped to the feed

---

## 28. Examples

### 28.1 Dashboard recent activity

```yaml
title: Recent activity
items:
  - key: item-1
    summary: Alice approved invoice INV-2026-014
    actor: Alice Martin
    timestamp: 2 minutes ago
    tone: success
  - key: item-2
    summary: Bob uploaded 3 files to Acme Corp
    actor: Bob Chen
    timestamp: 18 minutes ago
  - key: item-3
    summary: New customer created
    timestamp: Today at 09:14
```

### 28.2 Compact side panel feed

```yaml
variant: compact
density: compact
title: Latest updates
limit: 5
```

### 28.3 Timeline-style feed

```yaml
variant: timeline
items:
  - key: item-1
    summary: Contract Renewal Q2 was approved
    tone: success
  - key: item-2
    summary: Payment received for INV-2026-014
    tone: success
  - key: item-3
    summary: Customer status changed to Active
```

### 28.4 Scoped empty state

```yaml
title: Recent activity
items: []
renderState:
  kind: empty
  state: {}
```

---

## 29. Governance

`ActivityFeed` is the canonical recent-activity primitive.

All dashboard-style recent activity surfaces should converge toward this primitive instead of inventing ad hoc feeds and timelines across overview pages. Consistency is mandatory.

---

## 30. Implementation Notes

**Implementation should prefer:**

- Readable event summaries
- Compact but clear item layout
- Scoped local states
- Lightweight drill-down affordances
- Reuse across dashboards, overview pages, and embedded panels

**Implementation must avoid:**

- Audit-log heaviness
- Noisy raw event dumps
- Threaded comment behavior
- Backend-coupled event logic
- One-off feed designs per dashboard

> `ActivityFeed` is generic and reusable by design.
