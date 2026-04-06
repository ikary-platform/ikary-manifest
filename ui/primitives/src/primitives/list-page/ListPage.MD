# List Page Contract

**Version:** 1.0  
**Scope:** ikary-ui  
**Status:** Mandatory

---

This document defines the canonical **List Page** primitive for IKARY.

A List Page is the standard route-level container used to render a **collection of a single entity type**.

Think:

```
List<Entity> -> List Page
```

A List Page is not used for:

- rendering a single entity record
- rendering a dashboard or overview page
- rendering mixed collections of different entity types
- rendering arbitrary custom collection UIs outside the shared primitive system

The List Page is the canonical enterprise pattern for browsing, searching, filtering, sorting, paginating, selecting, and acting on entity collections.

---

## 1. Philosophy

List Page is the canonical representation of an entity collection.

It must be:

- Predictable
- URL-driven
- Server-oriented
- Enterprise-oriented
- Accessible
- Observable
- Non-creative

List Page is a **stateful route container**.

It owns:

- collection query state
- URL synchronization
- server query composition
- loading / empty / error orchestration
- pagination state
- filtering state
- search state
- sorting state
- bulk selection lifecycle
- page-level and bulk actions

List Page delegates collection rendering to one of two presentation primitives:

- `DataGrid`
- `CardList`

These presentation primitives are renderers, not route containers.

---

## 2. Core Responsibility Boundary

### 2.1 List Page owns

List Page is responsible for:

- entity collection fetching
- route-level state
- URL query parameter synchronization
- search query state
- filter state
- sort state
- pagination state
- selected item state
- active view mode state
- empty / no-results / loading / error state orchestration
- page-level actions
- bulk actions
- permission-aware action visibility
- observability emission

### 2.2 DataGrid and CardList own

DataGrid and CardList are responsible for:

- visual rendering of the collection
- row or card presentation
- item interaction affordances
- selection UI affordances
- sort UI affordances where relevant
- item-level action affordances
- pagination control rendering if configured by List Page

They do **not** own:

- fetching
- route state
- URL state
- server query logic
- canonical pagination rules
- canonical filter logic

---

## 3. Canonical Rule on Pagination

### 3.1 Ownership

Pagination state is owned by **List Page**.

That includes:

- current page
- page size
- total count
- total pages
- server query parameters
- URL synchronization
- reset rules when filters/search/sort change

### 3.2 Rendering

Pagination controls may be rendered:

- by List Page directly, or
- by DataGrid / CardList as controlled subcomponents

But the state remains controlled by List Page.

### 3.3 Why

Pagination is a collection-query concern, not a renderer concern.

If DataGrid or CardList own pagination:

- URL consistency breaks
- switching between DataGrid and CardList becomes harder
- server query orchestration gets duplicated
- behavior becomes inconsistent across pages

Therefore the canonical rule is:

> **List Page controls pagination. Renderers only display it.**

---

## 4. Scope

A List Page always represents:

- one entity definition
- one collection endpoint or query definition
- one canonical route
- one consistent layout shell

A List Page may support:

- DataGrid rendering
- CardList rendering
- optionally a user-switchable view mode

A List Page must never render two fundamentally different collection paradigms at the same time.

---

## 5. Structure

Canonical structure:

```
List Page
  ├── Page Header
  │    ├── Title
  │    ├── Subtitle (optional)
  │    ├── Page Actions (optional)
  │
  ├── Filter Bar
  │    ├── Search Input (optional)
  │    ├── Bulk Command Bar (conditional)
  │    ├── Filter Controls (optional)
  │    ├── View Mode Toggle (optional)
  │    ├── Secondary Collection Actions (optional)
  │
  ├── List State Region
  │    ├── Loading State
  │    ├── Error State
  │    ├── Empty State
  │    ├── No Results State
  │    └── Collection Renderer
  │          ├── DataGrid
  │          └── CardList
  │
  └── Pagination Region
       ├── Page Info
       ├── Page Size Control (optional)
       └── Pagination Controls
```

---

## 6. Page Header

The Page Header is declarative and consistently aligned.

It must support:

- title
- subtitle or description (optional)
- page-level actions (optional)

Page-level actions apply to the collection as a whole, not selected items.

Examples: Create, Export, Import, Refresh.

Page Header actions must be permission-aware.

---

## 7. Filter Bar

The Filter Bar is the canonical interaction surface for collection state changes.

It may include:

- search input
- filter controls
- sort shortcuts if desired
- bulk command bar when selection exists
- view mode toggle when enabled

The Filter Bar belongs to List Page, not to DataGrid or CardList.

### 7.1 Search

Search is route-driven and server-aware.

Search must:

- be represented in the URL
- trigger server-side query updates
- reset page to 1 when changed
- support debounced input when appropriate

### 7.2 Filters

Filters are route-driven and server-aware.

Filters must:

- be represented in the URL
- use typed definitions
- reset page to 1 when changed
- support canonical serialization

### 7.3 Sort

Sort is route-driven and server-aware.

Sort must:

- be represented in the URL
- support typed sortable fields only
- reset page only if required by product rule (default is no reset)
- remain consistent across view modes

### 7.4 Bulk Command Bar

Bulk command bar is shown only when one or more items are selected.

Bulk command bar actions apply only to the current selection.

Selection is not URL-driven. Selection is transient client state.

---

## 8. View Modes

List Page supports the following view modes:

- `grid`
- `cards`

A page may be:

- grid-only
- cards-only
- switchable between both

The default should be explicitly configured.

If a page allows switching view modes, the selected view mode must be reflected in the URL.

### 8.1 Selection of view mode

Recommended default behavior:

- Use DataGrid for medium or large collections
- Use CardList for small or low-cardinality collections
- Use switchable mode only when there is clear user value

---

## 9. Low-Cardinality Entity Exception

For entities where the expected number of records is naturally bounded and small, CardList may replace DataGrid as the default renderer.

Typical examples:

- API keys
- integrations
- licenses
- environments
- connection profiles

CardList is appropriate when:

- the collection is naturally small
- each record has several fields that benefit from grouped vertical layout
- dense columnar representation reduces readability

Guidance: typically around 10 or fewer records, but the true deciding factor is readability and expected usage pattern.

Even when using CardList, the List Page must still support:

- search if relevant
- filters if relevant
- pagination when the result set can grow
- loading / empty / error / no-results states
- consistent navigation to detail page

---

## 10. Canonical State Model

List Page owns the following canonical state:

```typescript
type ListPageState = {
  entityKey: string;
  viewMode: 'grid' | 'cards';
  searchQuery: string;
  filters: Record<string, unknown>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    pageSize: number;
    totalItems?: number;
    totalPages?: number;
  };
  selection: {
    selectedIds: string[];
  };
};
```

State rules:

- `searchQuery` is URL-driven
- `filters` are URL-driven
- `sort` is URL-driven
- `viewMode` is URL-driven when switchable
- `pagination.page` is URL-driven
- `pagination.pageSize` is URL-driven when user-adjustable
- `selection.selectedIds` is transient and must not be URL-driven

---

## 11. URL Contract

List Page must use a canonical URL format.

Recommended route query parameters:

- `q` → search query
- `page` → current page
- `pageSize` → page size
- `sort` → sort field
- `order` → `asc` or `desc`
- `view` → `grid` or `cards`
- `filter.<key>` → filter value

Example:

```
/customers?q=acme&page=2&pageSize=25&sort=createdAt&order=desc&view=grid&filter.status=active
```

URL rules:

- URL must fully represent the queryable collection state
- opening the same URL must reproduce the same collection view
- invalid URL parameters must be sanitized
- unsupported filters or sorts must be ignored safely
- changing search or filters resets `page=1`
- changing page size resets `page=1`

---

## 12. Data Contract

List Page assumes a server-capable collection query.

Minimum expected response shape:

```typescript
type ListResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
```

The backend must support, when configured:

- pagination
- sorting
- filtering
- search

Client-side filtering-only is forbidden as the canonical behavior for real collections.

Client-side post-processing is allowed only for lightweight presentation concerns that do not alter collection truth.

---

## 13. Fetching Behavior

List Page is responsible for collection fetching.

Fetching must react to:

- route changes
- search changes
- filter changes
- sort changes
- pagination changes
- explicit refresh

Collection fetching should use the platform query layer.

List Page must not duplicate fetch logic inside DataGrid or CardList.

---

## 14. Rendering Contract

List Page passes controlled props into the renderer.

Example conceptual shape:

```typescript
type CollectionRendererProps<T> = {
  items: T[];
  loading: boolean;
  selection: {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  };
  sort?: {
    field?: string;
    direction?: 'asc' | 'desc';
    onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  onItemOpen?: (id: string) => void;
};
```

Important: the renderer receives controlled state and never becomes source of truth for collection query state.

---

## 15. Selection Model

Selection belongs to List Page but is transient client state.

Selection rules:

- selection is cleared when data identity changes substantially unless explicitly preserved
- selection is not encoded in URL
- selection powers the bulk command bar
- selection may support single and multi-select
- selection UI must be shared and consistent across DataGrid and CardList

---

## 16. Actions

List Page must distinguish between three action types.

### 16.1 Page actions

These apply to the collection as a whole.

Examples: Create, Import, Export, Refresh.

### 16.2 Bulk actions

These apply to selected records.

Examples: Delete selected, Archive selected, Assign owner, Change status.

### 16.3 Item actions

These apply to a single record.

Examples: Open, Edit, Duplicate, Delete.

Item actions belong visually to DataGrid or CardList, but authorization and action definition should remain declarative at page or entity config level.

---

## 17. Navigation

A List Page must support navigation to record detail pages.

Navigation may be exposed through:

- row click
- explicit link
- card click
- explicit action button

Navigation must remain accessible and predictable.

Canonical preference:

- allow direct entity navigation using stable URLs
- do not rely on hidden click zones without clear affordance

---

## 18. Mandatory States

List Page must define and render the following states.

### 18.1 Loading state

Shown while collection query is pending.

Should use skeleton rows, skeleton cards, or platform-standard loading placeholders.

### 18.2 Empty state

Shown when the collection has no records at all (no filters applied, server returns zero records).

Should support:

- explanatory text
- optional create/import primary action

### 18.3 No-results state

Shown when records exist in general but the current search/filter combination returns zero items.

Should support:

- explanation
- clear filters action
- clear search action

### 18.4 Error state

Shown when collection fetch fails.

Should support:

- clear failure message
- retry action
- non-destructive behavior

These states belong to List Page orchestration, not to the renderer alone.

---

## 19. Accessibility

List Page must be accessible by default.

It must support:

- keyboard navigation
- visible focus states
- semantic landmarks where appropriate
- accessible labels for search and filters
- accessible bulk action controls
- accessible pagination controls
- accessible sort affordances
- clear empty and error state messaging

DataGrid-specific sort indicators belong to DataGrid. List Page still owns the semantic sort state.

---

## 20. Responsive Behavior

Responsive behavior must be deterministic.

Recommended rules:

- Filter Bar may wrap or collapse secondary controls
- DataGrid may allow horizontal overflow when needed
- CardList may be preferred on narrower layouts if configured
- page actions may collapse into overflow menu when necessary

Responsive adaptation must not change the canonical collection semantics.

---

## 21. Authorization Awareness

List Page must be permission-aware.

The following may vary by permission:

- visibility of page actions
- visibility of bulk actions
- visibility of item actions
- availability of selection
- create access
- export access
- edit or delete access

Authorization must not be implemented as arbitrary inline JSX logic per page. It must be driven by shared permission-aware patterns.

---

## 22. Observability

List Page must emit structured events.

Minimum events:

- `list_view_loaded`
- `list_search_changed`
- `list_filter_changed`
- `list_sort_changed`
- `list_page_changed`
- `list_page_size_changed`
- `list_view_mode_changed`
- `list_bulk_selection_changed`
- `list_bulk_action_triggered`
- `list_item_opened`

Recommended event payload:

- `route`
- `workspaceId`
- `cellId`
- `entityType`
- `rendererType`
- `page`
- `pageSize`
- `searchQueryPresent`
- `activeFilterCount`
- `sortField`
- `sortDirection`
- `selectedCount`
- `resultCount`

---

## 23. Forbidden Patterns

The following are forbidden:

- infinite scroll as canonical list behavior
- renderer-owned pagination state
- renderer-owned query state
- client-side filtering as the primary collection truth for large or real datasets
- ad hoc custom collection UIs instead of shared DataGrid or CardList
- inline heavy JSX logic for cell/card business rules
- mixing multiple collection paradigms chaotically on one page
- non-shareable collection state hidden only in component memory
- page-specific URL conventions that break canonical list URLs

---

## 24. Recommended Defaults

Unless explicitly configured otherwise:

- renderer defaults to `grid`
- page defaults to `1`
- pageSize defaults to `25`
- search is debounced
- changing search resets page to `1`
- changing filters resets page to `1`
- changing pageSize resets page to `1`
- selection is cleared when query result identity changes
- collection state is reflected in URL

---

## 25. Definition of Done

A List Page is compliant if:

- it uses the shared List Page primitive
- it represents a collection of a single entity type
- fetching is controlled by List Page
- search, filters, sort, and pagination are route-driven
- pagination state is owned by List Page
- DataGrid or CardList only render controlled state
- loading, empty, no-results, and error states are implemented
- permissions are respected
- observability is emitted
- URLs are shareable and reproducible
- no forbidden patterns are used

---

## 26. Canonical Summary

The List Page is the canonical route container for rendering an entity collection.

**It owns:**

- URL state
- query state
- fetching
- pagination
- filters
- search
- sort
- selection lifecycle
- state orchestration

**It delegates rendering to:**

- DataGrid
- CardList

It does not allow those renderers to become the source of truth for collection state.

---

## 27. Final Rule on Pagination

To answer the architectural question directly:

**List Page owns pagination.**

**DataGrid / CardList may:**

- render pagination controls
- render page counts
- emit `onPageChange`
- emit `onPageSizeChange`

**DataGrid / CardList must not:**

- fetch next page themselves
- invent their own pagination state
- keep internal page state as source of truth
- encode pagination differently from the page URL

The clean architecture is:

```
List Page          =  owns pagination state
DataGrid / CardList  =  controlled pagination UI
```
