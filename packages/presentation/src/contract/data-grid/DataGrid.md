# Data Grid Contract

**Version:** 1.0  
**Scope:** ikary-ui  
**Status:** Mandatory

---

This document defines the canonical **DataGrid** primitive for IKARY.

DataGrid is the standard tabular renderer used by **List Page** when an entity collection is displayed in grid form.

Think:

```
ListPage<Entity> -> DataGrid
```

DataGrid is not a route container.  
DataGrid is not responsible for collection fetching, URL state, filter orchestration, or pagination ownership.

All List Pages using tabular representation must use the shared `DataGrid` primitive.  
Custom table implementations are forbidden.

---

## 1. Philosophy

DataGrid is the canonical tabular representation of an entity collection.

It must be:

- Predictable
- Dense
- Readable
- Controlled
- Enterprise-oriented
- Accessible
- Observable
- Non-creative

DataGrid is a **presentation primitive**, not a page primitive.

It renders collection data passed by List Page and emits controlled UI interactions back to List Page.

It must never become the source of truth for:

- collection query state
- URL state
- filter state
- pagination state
- fetch lifecycle

No experimental table UX patterns are allowed.

---

## 2. Responsibility Boundary

### 2.1 DataGrid owns

DataGrid is responsible for:

- tabular rendering
- header rendering
- row rendering
- cell rendering through typed wrappers
- selection UI affordances when enabled
- sort UI affordances when enabled
- row-level actions rendering
- loading row rendering
- empty-grid shell rendering if instructed
- controlled pagination UI rendering if instructed
- keyboard and accessibility behavior inside the grid

### 2.2 DataGrid does not own

DataGrid must not own:

- route state
- URL synchronization
- collection fetching
- filter orchestration
- canonical search behavior
- canonical pagination state
- canonical sort state
- bulk action orchestration
- permission policy definition
- entity query composition

Those belong to **List Page**.

---

## 3. Canonical Relationship with List Page

DataGrid is a controlled renderer used by List Page.

List Page owns:

- items query
- filters
- search
- sort state
- pagination state
- URL synchronization
- bulk selection lifecycle
- loading / empty / no-results / error orchestration

DataGrid receives controlled props and emits events such as:

- `onSortChange`
- `onSelectionChange`
- `onRowOpen`
- `onPageChange`
- `onPageSizeChange`

> **Important:** DataGrid may render pagination controls, but pagination state is owned by List Page.

---

## 4. When to Use DataGrid

DataGrid should be the default renderer when:

- the collection is medium or large
- users need dense scanning across rows
- comparison across columns is important
- sorting across fields is important
- tabular readability is stronger than card readability

DataGrid should not be the default when:

- the collection is naturally very small
- each record contains grouped information better read vertically
- a CardList provides significantly better usability

In such cases, List Page may use `CardList` instead.

---

## 5. Structure

Canonical structure:

```
DataGrid
  ├── Grid Surface
  │    ├── Header Row
  │    │    ├── Optional Selection Header Cell
  │    │    ├── Column Headers
  │    │    └── Optional Action Header Cell
  │    │
  │    ├── Body
  │    │    ├── Data Rows
  │    │    ├── Loading Rows
  │    │    ├── Empty Rows (optional shell)
  │    │    └── Error Row Surface (optional shell)
  │    │
  │    └── Footer Region (optional)
  │         ├── Page Info
  │         ├── Page Size Control
  │         └── Pagination Controls
```

Filtering is not inside DataGrid.  
Search is not inside DataGrid.  
Bulk actions are not inside DataGrid.

These belong to List Page.

---

## 6. Data Model

DataGrid renders a collection of records with declarative columns.

Minimum conceptual model:

```typescript
type DataGridColumn<T> = {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'datetime'
    | 'boolean'
    | 'status'
    | 'badge'
    | 'link'
    | 'enum'
    | 'currency'
    | 'custom'
    | 'actions';
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
  width?: number | 'auto';
  hidden?: boolean;
  cell: (item: T) => unknown;
};

type DataGridProps<T> = {
  rows: T[];
  columns: DataGridColumn<T>[];
  loading?: boolean;
  selectable?: boolean;
  selectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sort?: {
    field?: string;
    direction?: 'asc' | 'desc';
  };
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  onRowOpen?: (row: T) => void;
};
```

DataGrid must remain controlled by props.

---

## 7. Columns

Columns must be:

- declarative
- typed
- stable
- consistently aligned
- wrapper-based
- reusable across pages when appropriate

Column rendering must not rely on arbitrary inline heavy JSX logic.

### 7.1 Column requirements

Every column should define:

- stable key
- visible label
- type
- width or minimum width guidance
- alignment when relevant
- sortable capability when relevant

### 7.2 Allowed column types

Allowed canonical column types:

- `text`
- `number`
- `date`
- `datetime`
- `boolean`
- `status`
- `badge`
- `link`
- `enum`
- `currency`
- `custom`
- `actions`

Any custom column must still use a shared wrapper pattern and must not bypass primitive rules.

### 7.3 Width rules

Columns must use predictable width rules.

They should have:

- `minWidth` for readability
- explicit alignment for numeric and action columns
- stable layout under loading state
- no chaotic resize behavior by default

Free-form user-resizable columns are not part of the canonical baseline unless explicitly introduced later as a platform capability.

---

## 8. Cell Rendering

Cells must render through shared typed wrappers.

No arbitrary business logic should be embedded directly in table cells.

Cell rendering should be:

- concise
- reusable
- permission-aware where relevant
- visually consistent across cells

### 8.1 Text cells

Text cells should:

- truncate predictably when needed
- support full value exposure via tooltip when appropriate
- avoid multi-line expansion by default unless explicitly configured

### 8.2 Number and currency cells

Numeric cells should:

- align right by default
- use shared formatting
- avoid inconsistent decimal and locale rendering

### 8.3 Date and datetime cells

Date cells should:

- use shared formatting utilities
- be locale-aware when the platform defines locale behavior
- remain stable across loading and refresh states

### 8.4 Boolean cells

Boolean cells should:

- use canonical boolean rendering
- not rely on raw `true`/`false` strings unless explicitly intended

### 8.5 Status and badge cells

Status-like cells must use shared badge primitives.

Rules:

- use `InfoBadge` for informational labels
- use `HintBadge` only when explanation via tooltip is required
- use interactive badge variants only for explicit navigation or filtering behavior
- badge cells must not look clickable unless they are actually interactive
- mutation actions are forbidden inside badge cells

### 8.6 Link cells

Link cells are used for explicit entity navigation.

They must:

- be visually identifiable as links
- be keyboard accessible
- not depend solely on row click

### 8.7 Actions cells

Action columns must be limited and predictable.

They may include:

- open
- edit
- duplicate
- delete
- overflow menu actions

They must not become mini toolbars containing uncontrolled complex workflows.

---

## 9. Entity Navigation

Entity navigation must remain explicit.

At least one visible field — typically the entity name/title column — should be rendered as a link to the Detail Page.

Rules:

- row click is optional
- explicit link remains mandatory for discoverability and accessibility
- row click must not be the only navigation mechanism
- link-based navigation should use stable entity URLs

---

## 10. Sorting

DataGrid may render sortable column headers.

Sorting state is owned by List Page.

### 10.1 Canonical sorting rules

Default canonical behavior:

- single-column sorting only
- multi-sort forbidden unless the platform adds explicit support later
- sort changes emit to List Page
- List Page updates URL and refetches data

### 10.2 DataGrid sorting behavior

DataGrid **may:**

- show sortable header affordances
- show active sort direction indicators
- emit `onSortChange`

DataGrid **must not:**

- mutate internal sort state as source of truth
- encode sort directly in URL
- refetch on its own

### 10.3 Sort indicator behavior

Sort indicators must be:

- clear
- visible
- accessible
- consistent across all grids

---

## 11. Pagination

Pagination is controlled by List Page.

### 11.1 Ownership

DataGrid does not own pagination state.

That means DataGrid must not own:

- current page
- page size
- total count source of truth
- query serialization
- reset rules

### 11.2 Rendering

If pagination is enabled, DataGrid may render:

- page number display
- total count
- page size selector
- first / previous / next / last controls

But these are controlled UI controls only.

### 11.3 Rules

Pagination UI must:

- reflect controlled props
- emit `onPageChange`
- emit `onPageSizeChange` when applicable
- never manage hidden internal page state
- never fetch by itself

Infinite scroll is forbidden.

---

## 12. Selection

Selection is optional but standardized.

If selection is enabled:

- first column must be reserved for selection
- row checkboxes must be consistent
- header checkbox may support "select all on page"
- selection must be visibly clear
- selection UI must not conflict with row navigation

Selection state is owned by List Page.

### 12.1 Selection rules

Selection must:

- be transient
- apply to current page items unless broader behavior is explicitly designed later
- be cleared when query identity changes unless explicit preservation logic exists
- not leak across entities or routes

DataGrid may render selection controls, but must not become the canonical owner of selection behavior.

---

## 13. Bulk Actions

Bulk actions belong to List Page, not inside DataGrid itself.

DataGrid may visually coexist with a bulk command bar above the grid, but it does not define bulk action behavior.

Bulk actions must:

- be disabled or hidden when no selection exists
- respect permissions
- require confirmation for destructive actions
- follow shared Button and confirmation contracts

---

## 14. Inline Editing

Inline editing is forbidden by default.

Default canonical state: no inline editing.

If inline editing is introduced in the future, it must:

- use dedicated shared form primitives
- preserve validation rules
- preserve audit logging
- preserve permission checks
- be explicitly approved as a platform feature

Inline mutation from arbitrary cells is forbidden.

---

## 15. Loading Behavior

DataGrid must support controlled loading rendering.

### 15.1 Initial load

On initial load:

- preserve table shell
- preserve header structure
- show loading rows or skeleton rows
- avoid layout jumping

### 15.2 Refetch and pagination transitions

On page change or query refresh:

- preserve header layout
- replace row content with loading rows or skeleton rows when needed
- avoid full-screen spinner-only experience inside the grid region

### 15.3 Loading design goal

The grid should feel stable during transitions.

---

## 16. Empty and No-Data Rendering

List Page owns the distinction between:

- empty state
- no-results state
- error state

DataGrid may render the surface allocated by List Page for these states if the composition pattern chooses to place them inside the grid shell.

### 16.1 Empty shell rules

If DataGrid is instructed to render an empty surface:

- it must not render a blank broken table
- it must preserve layout dignity
- it must not hide active filters or query context if outside the grid

---

## 17. Error Rendering

Error orchestration belongs to List Page.

If DataGrid is used to visually host the error surface inside the content region, it must:

- remain visually consistent
- allow retry action passthrough
- not collapse unpredictably

DataGrid must not own retry logic itself.

---

## 18. Performance Rules

DataGrid must be efficient by default.

It must:

- support server-driven collections
- not require the full dataset in memory
- avoid unnecessary full-grid re-renders
- preserve stable column structure
- support large row counts via pagination
- allow virtualization later if needed, but not require it in the canonical baseline

Canonical assumption: pagination, filtering, and sorting are server-driven.  
Client-side full-dataset tables are not the default enterprise behavior.

---

## 19. Accessibility

DataGrid must be accessible by default.

It must support:

- keyboard navigation
- clear focus states
- proper semantic roles
- accessible header labeling
- accessible sort controls
- accessible checkbox selection
- accessible action menus
- link discoverability for entity navigation

Sort indicators and interactive headers must remain understandable for assistive technologies.

---

## 20. Responsive Behavior

DataGrid must degrade predictably on narrower widths.

Allowed responsive behaviors:

- horizontal overflow
- column truncation
- column hiding if explicitly configured
- action column compaction
- denser mobile fallback only if platform-approved

Responsive behavior must not silently change business semantics.

If the collection is fundamentally better represented vertically on smaller layouts, that decision belongs to List Page or responsive page configuration, not ad hoc per-grid hacks.

---

## 21. Authorization Awareness

DataGrid must respect permissions passed to it.

Permission-sensitive behaviors may include:

- visibility of action column
- visibility of row actions
- edit vs read-only action availability
- delete visibility
- selection availability

Authorization rules must be declarative and shared, not embedded as arbitrary one-off JSX conditions inside cells.

---

## 22. Observability

DataGrid participates in collection observability.

List Page remains the primary orchestration emitter, but DataGrid may contribute interaction events.

Recommended events emitted by the list experience include:

- `list_view_loaded`
- `list_sort_changed`
- `list_page_changed`
- `list_page_size_changed`
- `list_bulk_selection_changed`
- `list_item_opened`

Recommended payload fields:

- `route`
- `workspaceId`
- `cellId`
- `entityType`
- `rendererType`
- `page`
- `pageSize`
- `sortField`
- `sortDirection`
- `selectedCount`
- `resultCount`

DataGrid-specific interactions should not bypass the canonical list observability model.

---

## 23. Forbidden Patterns

The following are forbidden:

- custom ad hoc table implementations
- DataGrid-owned URL state
- DataGrid-owned pagination state
- DataGrid-owned fetch logic
- filters embedded inside column headers as the primary canonical filter model
- client-side full-dataset filtering as the primary truth for real datasets
- arbitrary heavy JSX business logic inside cells
- row mutation without confirmation
- row click as the only navigation mechanism
- uncontrolled inline editing
- multiple inconsistent table styles across the platform
- infinite scroll as canonical grid behavior

---

## 24. Recommended Defaults

Unless explicitly configured otherwise:

- DataGrid is the default renderer for list pages
- sorting is single-column only
- name/title column is a link
- pagination controls are shown when paginated data exists
- numeric columns are right-aligned
- action column is compact and right-aligned
- loading uses skeleton rows
- empty and error surfaces remain visually contained
- selection is off unless required by bulk actions

---

## 25. Definition of Done

A DataGrid is compliant if:

- it uses the shared DataGrid primitive
- it is used as a renderer under List Page
- columns are declarative and typed
- sorting UI is controlled
- pagination UI is controlled
- filtering remains outside the grid
- navigation is explicit
- selection is standardized when enabled
- inline editing is absent by default
- loading state is stable
- accessibility is respected
- observability integrates with the canonical list model
- no forbidden patterns are used

---

## 26. Canonical Summary

The DataGrid is the canonical tabular renderer for entity collections in IKARY.

**It owns:**

- tabular presentation
- header rendering
- row rendering
- controlled sort affordances
- controlled selection affordances
- controlled pagination rendering
- item-level action rendering

**It does not own:**

- fetch orchestration
- URL state
- query composition
- filter state
- pagination state
- sort source of truth

Those belong to List Page.

---

## 27. Final Rule on Pagination and Sorting

To make the architectural boundary explicit:

**DataGrid may:**

- render sortable headers
- render active sort indicators
- emit `onSortChange`
- render pagination controls
- emit `onPageChange`
- emit `onPageSizeChange`

**DataGrid must not:**

- own sort as source of truth
- own pagination as source of truth
- refetch data itself
- encode URL state
- orchestrate filtering

The clean architecture is:

```
List Page  =  owns query state
DataGrid   =  controlled tabular renderer
```
