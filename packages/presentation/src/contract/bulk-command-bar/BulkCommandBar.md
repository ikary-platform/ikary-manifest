# BulkCommandBar Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `BulkCommandBar` primitive for Micro OS.

`BulkCommandBar` is the canonical selection-action surface for collection pages and collection-backed sections.

> It is not a page header. It is not a filter bar. It is not a pagination control. It is not a row action renderer. Those concerns belong to other primitives.

---

## 1. Philosophy

`BulkCommandBar` exists to let the user perform actions on the current selection clearly, safely, and predictably.

It should:

- Appear only when a selection exists
- Summarize the current selection clearly
- Expose bulk actions in a structured and constrained way
- Remain separate from page-level actions
- Remain separate from query/filter controls
- Remain separate from collection rendering

---

## 2. Usage

`BulkCommandBar` may be used in:

- List pages
- Data grid collection views
- Card-list collection views
- Relation sections with selectable items
- Embedded collection panels with multi-selection

**Examples:**

- Delete selected invoices
- Archive selected customers
- Assign selected tasks
- Export selected records
- Apply status change to selected rows

`BulkCommandBar` should be the canonical surface for actions on selected items.

---

## 3. Relationship to Other Primitives

### 3.1 `PageHeader`

| `PageHeader` owns  | `BulkCommandBar` owns                 |
| ------------------ | ------------------------------------- |
| Page identity      | Actions on the current selection only |
| Page title         |                                       |
| Page subtitle      |                                       |
| Page-level actions |                                       |

Do not place page-level actions inside `BulkCommandBar`.

### 3.2 `FilterBar`

`FilterBar` owns search, filters, sort, and query refinement. `BulkCommandBar` owns actions on selected items. Do not place query controls inside `BulkCommandBar`.

### 3.3 Collection Renderer

The collection renderer owns row/card rendering, row selection UI, item display, and item actions. `BulkCommandBar` does not render items and does not own row selection mechanics.

### 3.4 Pagination

Pagination owns page changes, page navigation, and page size changes. `BulkCommandBar` must not replace pagination.

---

## 4. When to Use

**Use `BulkCommandBar` when:**

- The surface supports multi-selection
- One or more selected items can be acted on together
- Actions apply to the selection as a set

**Do not use `BulkCommandBar` when:**

- The surface does not support selection
- Only page-level actions are needed
- Only per-row actions are needed
- The visible controls are query/filter related

---

## 5. Core Principles

### 5.1 Controlled selection surface

`BulkCommandBar` is a controlled primitive. It reflects selection state provided by the owning page, controller, or collection runtime. It does not own selection state itself.

### 5.2 Selection-first visibility

`BulkCommandBar` should be hidden when there is no active selection.

> Default rule: if `selectedCount = 0`, do not render the bar.

This keeps the page visually calm when selection is inactive.

### 5.3 Safe bulk actions

Bulk actions can have broad impact. The primitive should make those actions visible and accessible, but destructive actions must remain clearly identifiable and confirmable.

### 5.4 Separation of concerns

Keep these concerns separate: page actions, selection actions, filter/query controls, row/item actions, and pagination. `BulkCommandBar` must not become a dumping ground.

---

## 6. Canonical Responsibilities

**`BulkCommandBar` may own:**

- Selection count summary
- Optional selection scope summary
- Visible bulk actions
- Overflow bulk actions
- Clear selection action
- Optional select-all-results action
- Lightweight action loading/disabled states

**`BulkCommandBar` must not own:**

- Page identity
- Page primary action
- Filters and query controls
- Selection mechanics inside rows/cards
- Backend execution logic
- Pagination rendering

---

## 7. Visual Structure

```
BulkCommandBar
  ├── selection summary
  │   ├── selected count
  │   └── optional scope summary
  ├── visible actions
  ├── optional overflow actions
  └── clear selection action
```

The structure must remain compact, readable, and action-oriented.

---

## 8. Selection Summary

The bar must clearly communicate the current selection.

It should show how many items are selected and optionally the selection scope if relevant.

| ✅ Examples                    |
| ------------------------------ |
| 3 selected                     |
| 12 selected on this page       |
| 50 selected across all results |

The summary should be concise and immediately understandable.

---

## 9. Selection Scope

| Scope         | Meaning                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| `page`        | Selection applies only to the currently loaded page or visible result set slice |
| `all-results` | Selection applies across the full result set, not just the visible page         |

> `page` should be the default V1 behavior. `all-results` is valid but should only be implemented when the platform can model it clearly and safely.

---

## 10. Bulk Actions

Bulk actions must be explicit and serializable.

```ts
type BulkCommandBarAction = {
  key: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'secondary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  confirm?: {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
};
```

**Rules:**

- `key` must be stable
- `label` must be human-readable
- `variant = destructive` must be visually and semantically clear
- Destructive actions should generally require confirmation
- Actions must remain selection-scoped
- Use plain serializable strings — do not use ReactNode labels in the canonical contract

---

## 11. Visible Actions and Overflow

The bar may support visible actions and overflow actions.

**Recommended default:**

- Show up to 2–3 visible actions
- Place the remainder in overflow

Overflow keeps the bar compact and prevents action sprawl. The exact threshold may follow repo conventions, but the primitive should preserve a clean hierarchy.

---

## 12. Clear Selection

`BulkCommandBar` should support a clear selection affordance.

This action must:

- Be always easy to find
- Exit the selection state cleanly
- Not be confused with destructive record actions

| ✅ Examples     |
| --------------- |
| Clear selection |
| Deselect all    |

> This action affects UI selection state, not domain data.

---

## 13. Select All Results

`BulkCommandBar` may support an explicit `selectAllResultsAction`. Use it only when the platform can safely model cross-result selection.

| ✅ Examples              |
| ------------------------ |
| Select all 1,248 results |
| All results selected     |

This action is optional. For V1, it is acceptable to omit actual cross-result behavior and stay page-only.

> Use `selectAllResultsAction` consistently everywhere — do not use mixed naming variants.

---

## 14. Variants

| Variant   | When to use                                             |
| --------- | ------------------------------------------------------- |
| `list`    | Default for full list pages                             |
| `section` | Embedded collection sections or related-record surfaces |

Variants may affect spacing and density, but not the core semantics.

---

## 15. Density

| Value         | Use for                                                      |
| ------------- | ------------------------------------------------------------ |
| `comfortable` | Full list pages, wide layouts, prominent collection surfaces |
| `compact`     | Embedded sections, dense layouts, narrow surfaces            |

---

## 16. States

| State            | Meaning                                          |
| ---------------- | ------------------------------------------------ |
| `hidden`         | No selection exists (`selectedCount = 0`)        |
| `active`         | One or more items are selected                   |
| `action-loading` | One or more bulk actions are temporarily loading |
| `disabled`       | Specific actions are disabled by upstream logic  |

### 16.1 `hidden`

No selection exists. Default rule: `selectedCount = 0` → hidden.

### 16.2 `active`

One or more items are selected.

### 16.3 `action-loading`

One or more bulk actions may be temporarily loading. This must remain localized to the action — it must not replace the whole bar with a page-level loader.

### 16.4 `disabled`

Specific actions may be disabled due to authorization, selection content, or business rules determined upstream.

---

## 17. Authorization and Availability

`BulkCommandBar` may receive actions that are already filtered or disabled by upstream authorization logic. The primitive may render only allowed actions, or disabled but visible actions if the platform intentionally does so.

> The primitive itself must not own authorization policy. Authorization decisions belong upstream.

---

## 18. Accessibility

`BulkCommandBar` must:

- Expose clear selection summary text
- Ensure all actions are keyboard accessible
- Ensure overflow interactions are accessible
- Ensure destructive actions are clearly communicated
- Not rely only on color to communicate danger or disabled state

If confirmation is used, that interaction must also be accessible.

---

## 19. Behavior

`BulkCommandBar` is a presentational and action-surface primitive.

It may expose interaction hooks or action dispatch through canonical action keys, but it must not own:

- Selection state storage
- Backend execution
- Confirmation business logic beyond UI affordance
- Authorization policy
- Page query state
- Row rendering

The owning surface remains responsible for orchestration.

---

## 20. Canonical Schema Shape

```ts
type BulkCommandBarAction = {
  key: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'secondary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  confirm?: {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
};

type BulkCommandBarPresentation = {
  variant?: 'list' | 'section';
  density?: 'comfortable' | 'compact';
  selectedCount: number;
  scope?: 'page' | 'all-results';
  summaryLabel?: string;
  actions: BulkCommandBarAction[];
  overflowActions?: BulkCommandBarAction[];
  clearSelectionAction?: {
    label: string;
    actionKey?: string;
  };
  selectAllResultsAction?: {
    label: string;
    actionKey?: string;
  };
};
```

---

## 21. Field Semantics

### 21.1 `variant`

Defines the display context: `list` or `section`.

### 21.2 `density`

Defines the visual compactness.

### 21.3 `selectedCount`

Required selected item count. If `selectedCount = 0`, the primitive should normally not render.

### 21.4 `scope`

Optional selection scope: `page` or `all-results`.

### 21.5 `summaryLabel`

Optional override for the default summary text. Use sparingly.

### 21.6 `actions`

Primary visible bulk actions. This array is required, even if empty in some orchestration states.

### 21.7 `overflowActions`

Optional secondary/overflow actions.

### 21.8 `clearSelectionAction`

Optional explicit action to clear current selection. Strongly recommended.

### 21.9 `selectAllResultsAction`

Optional action for cross-result selection. Only meaningful when such behavior exists upstream.

---

## 22. Default Rendering Rules

Recommended defaults:

- Hide the bar when `selectedCount = 0`
- Render the summary on the leading side
- Render visible actions next
- Render overflow last among bulk actions
- Render clear selection as a distinct non-destructive affordance
- Use confirmation for destructive bulk actions
- Prefer page-only selection for V1

---

## 23. Examples

### 23.1 Basic page selection

```yaml
selectedCount: 3
scope: page
actions:
  - key: archive
    label: Archive
  - key: export
    label: Export
clearSelectionAction:
  label: Clear selection
```

### 23.2 Destructive action

```yaml
selectedCount: 12
actions:
  - key: delete
    label: Delete selected
    variant: destructive
    confirm:
      title: Delete selected records
      description: This action cannot be undone.
      confirmLabel: Delete
      cancelLabel: Cancel
```

### 23.3 Overflow actions

```yaml
selectedCount: 8
actions:
  - key: assign
    label: Assign
  - key: archive
    label: Archive
overflowActions:
  - key: export
    label: Export
  - key: markReviewed
    label: Mark as reviewed
```

### 23.4 Cross-result affordance

```yaml
selectedCount: 50
scope: page
selectAllResultsAction:
  label: Select all 1,248 results
```

---

## 24. Governance

`BulkCommandBar` is a foundational collection-action primitive.

All selection-based action surfaces should converge toward this primitive instead of inventing ad hoc bulk-action toolbars across list pages and sections. Consistency is mandatory.

---

## 25. Implementation Notes

**Implementation should prefer:**

- Clear selection summary
- Compact action layout
- Safe destructive action treatment
- Clean separation from page actions and filters
- Reuse across list pages and collection sections

**Implementation must avoid:**

- Page-level action leakage
- Query/filter controls inside the bar
- Ownership of selection state
- Backend-coupled behavior
- Custom one-off bulk toolbars per page

> `BulkCommandBar` is generic and reusable by design.
