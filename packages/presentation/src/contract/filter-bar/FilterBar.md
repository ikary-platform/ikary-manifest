# FilterBar Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `FilterBar` primitive for Micro OS.

`FilterBar` is the canonical query-control surface for collection pages and collection-backed sections.

> It is not a page header. It is not a bulk action surface. It is not a pagination control. It is not a collection renderer. Those concerns belong to other primitives.

---

## 1. Philosophy

`FilterBar` exists to let the user refine a collection clearly, predictably, and efficiently.

It should:

- Expose collection query controls in one canonical surface
- Separate filtering concerns from page actions
- Separate query concerns from bulk selection actions
- Remain lightweight and composable
- Support enterprise collection workflows without becoming a full search product

---

## 2. Usage

`FilterBar` may be used in:

- List pages
- Relation sections with collection querying
- Card-list collection views
- Data-grid collection views
- Embedded collection widgets
- Search/result surfaces with structured filters

**Examples:**

- Customer list page
- Invoice list page
- Related attachments section
- Order history tab
- Task widget with filtering

`FilterBar` should be the canonical place for user-driven query refinement.

---

## 3. Relationship to Other Primitives

### 3.1 `PageHeader`

| `PageHeader` owns  | `FilterBar` owns           |
| ------------------ | -------------------------- |
| Page title         | Search input               |
| Subtitle           | Filter inputs              |
| Page identity      | Sort controls              |
| Page-level actions | Clear/reset query controls |

Do not place page-level actions inside `FilterBar`.

### 3.2 `BulkCommandBar`

`BulkCommandBar` owns actions on selected rows/items. `FilterBar` owns controls that refine which items are shown. Do not place selection actions inside `FilterBar` and do not make `FilterBar` depend on row selection.

### 3.3 Collection Renderer

The collection renderer owns row/card rendering, selection UI, and item display. `FilterBar` does not render collection content.

### 3.4 Pagination

Pagination owns page changes, page size changes, and navigation across result pages. `FilterBar` may influence query state, but it does not replace pagination.

---

## 4. When to Use

**Use `FilterBar` when:**

- The surface renders a collection
- The user benefits from refining the visible result set
- Search, filters, or sort meaningfully change results
- Query controls should remain visible and reusable

**Do not use `FilterBar` when:**

- The surface is a single-record page with no collection query
- There are no user-facing query controls
- Only bulk selection actions are needed
- The surface is purely static

---

## 5. Core Principles

### 5.1 Query-first

`FilterBar` is about refining the result set. Every control in `FilterBar` must directly contribute to query behavior. Avoid unrelated controls.

### 5.2 Separation of concerns

Keep these concerns separate: page actions, selection actions, query controls, and pagination. `FilterBar` must not become a dumping ground.

### 5.3 Progressive density

`FilterBar` should support both a simple surface for common cases and a denser enterprise surface for richer filtering. Even in dense mode, it should remain structured and scannable.

### 5.4 Fast comprehension

A user should quickly understand what they can search, which filters are active, how to reset them, and how results are being sorted.

### 5.5 Composability

`FilterBar` must compose cleanly with `PageHeader`, `BulkCommandBar`, `DataGrid`, `CardList`, `Pagination`, and `RenderStateBoundary`.

---

## 6. Canonical Responsibilities

**`FilterBar` may own:**

- Free-text search
- Quick filters
- Structured filters
- Sort control
- Active filter summary
- Clear/reset control
- Optional advanced filter toggle

**`FilterBar` must not own:**

- Page identity
- Page primary action
- Selection count actions
- Item rendering
- Pagination rendering
- Backend query execution logic

---

## 7. Visual Structure

```
FilterBar
  ├── primary query row
  │   ├── optional search control
  │   ├── optional quick filter controls
  │   ├── optional sort control
  │   └── optional advanced filter trigger
  ├── optional active filter summary row
  │   ├── active filter chips / pills
  │   └── clear/reset control
  └── optional advanced filter region
```

The exact arrangement may vary by density and viewport, but the structure must remain recognizable.

---

## 8. Query Areas

### 8.1 Search

Search is **optional**. Use it when a free-text query is meaningful for the collection.

| ✅ Examples            |
| ---------------------- |
| Customer name          |
| Invoice number         |
| Email                  |
| Generic keyword search |

Search should be simple and discoverable.

### 8.2 Quick filters

Quick filters are **optional**. Use them for common, high-frequency refinements.

| ✅ Examples     |
| --------------- |
| Status          |
| Type            |
| Owner           |
| Date preset     |
| Archived yes/no |

Quick filters should stay compact.

### 8.3 Structured filters

Structured filters are **optional**. Use them for explicit field-based refinement.

| ✅ Examples              |
| ------------------------ |
| Country = Belgium        |
| Amount > 1000            |
| Created after 2026-01-01 |
| Owner in {A, B}          |

Structured filters may appear inline or in an advanced region.

### 8.4 Sort

Sort is **optional but recommended** for most collections.

| ✅ Examples       |
| ----------------- |
| Newest first      |
| Oldest first      |
| Name A–Z          |
| Amount descending |

Sort must remain clearly separate from filters.

### 8.5 Active filter summary

Active filter summary is **optional but strongly recommended** once more than one refinement can be active.

It should show:

- What is currently applied
- What can be removed individually
- How to clear everything

---

## 9. Variants

| Variant   | When to use                                          |
| --------- | ---------------------------------------------------- |
| `list`    | Default for full collection pages                    |
| `section` | Embedded collection sections such as related records |
| `widget`  | Compact dashboard or panel contexts                  |

Variants may affect density and layout, but not the core semantics.

---

## 10. Density

| Value         | Use for                                                      |
| ------------- | ------------------------------------------------------------ |
| `comfortable` | Full list pages, wide admin surfaces, richer query scenarios |
| `compact`     | Embedded sections, dense layouts, widgets, narrow surfaces   |

---

## 11. Search Semantics

If search is enabled, it should support:

- A visible query input
- A stable placeholder
- Controlled query value
- Optional submit-on-enter behavior if that matches repo conventions
- Optional debounce only if query orchestration upstream already supports it

> `FilterBar` itself must not hardcode fetch timing policy.

---

## 12. Filter Semantics

Filters must be explicit and typed. Supported filter control types may include:

- `text`
- `select`
- `multi-select`
- `checkbox`
- `toggle`
- `date`
- `date-range`
- `number`
- `enum`
- `relation lookup`

Only use control types already canonical in the repo. Each filter should map to a clear query key.

---

## 13. Sort Semantics

Sort options must be explicit and human-readable.

```ts
type FilterBarSortOption = {
  value: string;
  label: string;
};
```

| ✅ Examples      |
| ---------------- |
| `createdAt:desc` |
| `createdAt:asc`  |
| `name:asc`       |

Do not hide sort state.

---

## 14. Active Filter Summary Semantics

When active filters are shown, the summary should support human-readable labels, optional per-filter removal, and a clear-all action.

| ✅ Examples               |
| ------------------------- |
| Status: Draft             |
| Country: Belgium          |
| Created after: 2026-01-01 |

Do not expose raw query syntax directly to the user.

---

## 15. Advanced Filters

Advanced filters are **optional**. Use them when:

- The query surface is too dense for one row
- Many fields are filterable
- Novice and expert use cases must coexist

Advanced filters may be displayed via an expandable inline region, drawer, or popover/panel. Follow repo conventions. Do not invent multiple unrelated advanced-filter patterns.

---

## 16. States

| State      | Meaning                                             |
| ---------- | --------------------------------------------------- |
| `default`  | No query controls are currently applied             |
| `active`   | One or more query controls are currently applied    |
| `loading`  | Collection query is refreshing                      |
| `disabled` | Filter surface or specific controls are unavailable |

### 16.1 `active`

One or more query controls are currently applied.

### 16.2 `loading`

The filter surface may show a lightweight loading indicator when the collection query is refreshing. This must remain subtle — `FilterBar` is not a page-level loading surface.

### 16.3 `disabled`

The filter surface or specific controls may be disabled when interaction is unavailable.

---

## 17. Accessibility

`FilterBar` must:

- Preserve accessible control semantics
- Ensure all interactive controls are keyboard accessible
- Keep search, filters, and sort understandable to assistive technologies
- Not rely only on color to communicate active filters
- Preserve clear labels for structured filters

If advanced filters can expand/collapse, that interaction must be accessible.

---

## 18. Behavior

`FilterBar` is a presentational and query-input primitive.

It may expose events according to repo conventions, such as search query change, filter value change, sort change, clear all, remove active filter, and advanced toggle change.

It must not own:

- Backend querying
- Pagination execution
- Result rendering
- Bulk action state
- Page routing policy beyond explicit link/control behavior already standardized in the repo

---

## 19. Canonical Schema Shape

```ts
type FilterBarControlType =
  | 'text'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'toggle'
  | 'date'
  | 'date-range'
  | 'number';

type FilterBarOption = {
  value: string;
  label: string;
};

type FilterBarFilter = {
  key: string;
  label: string;
  type: FilterBarControlType;
  value?: unknown;
  placeholder?: string;
  options?: FilterBarOption[];
  disabled?: boolean;
};

type FilterBarActiveFilter = {
  key: string;
  label: string;
  valueLabel: string;
};

type FilterBarPresentation = {
  variant?: 'list' | 'section' | 'widget';
  density?: 'comfortable' | 'compact';
  search?: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
  };
  filters?: FilterBarFilter[];
  sort?: {
    value?: string;
    placeholder?: string;
    options: FilterBarOption[];
    disabled?: boolean;
  };
  activeFilters?: FilterBarActiveFilter[];
  clearAction?: {
    label: string;
    actionKey?: string;
  };
  advancedFilters?: {
    enabled?: boolean;
    open?: boolean;
    label?: string;
  };
  loading?: boolean;
};
```

---

## 20. Field Semantics

### 20.1 `variant`

Defines the display context: `list`, `section`, or `widget`.

### 20.2 `density`

Defines the visual compactness.

### 20.3 `search`

Optional free-text query control.

### 20.4 `filters`

Optional structured filter controls.

### 20.5 `sort`

Optional sort control.

### 20.6 `activeFilters`

Optional user-facing summary of applied filters.

### 20.7 `clearAction`

Optional clear/reset action.

### 20.8 `advancedFilters`

Optional advanced filter region state.

### 20.9 `loading`

Optional lightweight loading indicator for query refresh.

---

## 21. Filter Field Rules

Each filter in `filters` must:

- Have a stable `key`
- Have a user-facing `label`
- Declare a canonical `type`
- Use `options` only when the filter type requires options
- Remain query-focused and not business-decorative

Do not include fields that do not map to query behavior.

---

## 22. Examples

### 22.1 Simple list page

```yaml
search:
  placeholder: Search customers
sort:
  options:
    - value: createdAt:desc
      label: Newest first
    - value: name:asc
      label: Name A–Z
```

### 22.2 List page with quick filters

```yaml
search:
  placeholder: Search invoices
filters:
  - key: status
    label: Status
    type: select
  - key: archived
    label: Archived
    type: checkbox
sort:
  options:
    - value: date:desc
      label: Newest first
    - value: date:asc
      label: Oldest first
```

### 22.3 Embedded related records section

```yaml
variant: section
density: compact
search:
  placeholder: Search attachments
```

### 22.4 Active filters summary

```yaml
activeFilters:
  - key: status
    label: Status
    valueLabel: Draft
  - key: country
    label: Country
    valueLabel: Belgium
clearAction:
  label: Clear filters
```

---

## 23. Governance

`FilterBar` is a foundational runtime primitive.

All collection query-control surfaces should converge toward this primitive instead of inventing ad hoc filter rows across list pages and sections. Consistency is mandatory.

---

## 24. Implementation Notes

**Implementation should prefer:**

- Clear separation from page actions and bulk actions
- Simple query-control composition
- Accessible search/filter/sort behavior
- Predictable active-filter display
- Reuse across list pages, sections, and widgets

**Implementation must avoid:**

- Page-level action buttons mixed into the filter row
- Selection action leakage
- Backend-coupled query execution logic
- Over-engineered search experiences
- One-off filter UIs for each page

> `FilterBar` is generic and reusable by design.
