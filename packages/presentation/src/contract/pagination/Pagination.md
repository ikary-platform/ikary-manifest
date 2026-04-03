# Pagination Contract

**Version:** 1.0  
**Scope:** ikary-ui  
**Status:** Mandatory

---

This document defines the canonical **Pagination** primitive for IKARY.

Pagination is the standard page-navigation control used by **List Page** to move through paginated entity collections.

Think:

```
ListPage<Entity> -> Pagination
```

Pagination is not a route container.  
Pagination is not responsible for collection fetching, URL ownership, filtering ownership, sorting ownership, or selection ownership.

Pagination is a controlled primitive that renders page movement and page size controls for a collection already orchestrated by List Page.

All List Pages with paginated collections must use the shared `Pagination` primitive.  
Custom ad hoc pagination implementations are forbidden.

---

## 1. Philosophy

Pagination is the canonical interaction surface for moving through segmented collection results.

It must be:

- Predictable
- Controlled
- Compact
- Readable
- Enterprise-oriented
- Accessible
- Observable
- Non-creative

Pagination is a **navigation primitive**, not a page primitive.

It exists to answer three questions:

- Where am I in the result set?
- How many results exist?
- How many items do I want to see per page?

Pagination must never become the source of truth for:

- current query state
- URL state
- fetch lifecycle
- filter state
- sort state
- selection state

---

## 2. Responsibility Boundary

### 2.1 Pagination owns

Pagination is responsible for:

- rendering result range
- rendering total result count
- rendering current page information
- rendering page size selector
- rendering page navigation controls
- rendering optional first / last controls
- rendering optional compact page list with ellipsis
- controlled interaction emission

### 2.2 Pagination does not own

Pagination must not own:

- route state
- URL synchronization
- collection fetching
- filter orchestration
- sort orchestration
- selection state
- page-level actions
- bulk actions

Those belong to **List Page** or other primitives.

---

## 3. Canonical Relationship with List Page

Pagination is a controlled primitive used by List Page.

List Page owns:

- current page
- page size
- total items
- total pages
- URL synchronization
- fetch orchestration
- reset rules when query state changes

Pagination receives controlled props and emits events such as:

- `onPageChange`
- `onPageSizeChange`

> **Important:** Pagination renders navigation state, but pagination state is owned by List Page.

---

## 4. Canonical Position in List Page

Canonical order inside List Page:

```
List Page
  ├── Page Header
  ├── Filter Bar
  ├── Bulk Command Bar (conditional)
  ├── Collection Renderer
  └── Pagination
```

Pagination belongs after the collection renderer.

It may be visually hosted:

- directly by List Page
- inside DataGrid footer
- inside CardList footer

But ownership remains with List Page.

---

## 5. Visibility Rules

Pagination is conditional.

### 5.1 Single-page result set

If the result set fits on one page, Pagination should not render.

Recommended IKARY default: hide Pagination when `totalPages <= 1`.

### 5.2 Multi-page result set

When the result set spans multiple pages, Pagination becomes visible. This is the canonical active state.

---

## 6. Structure

Canonical structure:

```
Pagination
  ├── Left Area
  │    ├── Result Range
  │    └── Total Count
  │
  ├── Middle Area
  │    ├── First Page
  │    ├── Previous Page
  │    ├── Page List / Ellipsis
  │    ├── Next Page
  │    └── Last Page
  │
  └── Right Area
       ├── Items Per Page Label
       ├── Page Size Selector
       └── Optional Page Summary
```

Compact layout may collapse this arrangement on smaller screens.

---

## 7. Result Range

Result range is mandatory when Pagination is visible.

Result range should show the currently visible slice of the total result set.

Format:

```
1–25 of 243
26–50 of 243
201–225 of 243
```

If no items are available, the range may resolve to `0 of 0`.

Range must be easy to scan, stable, and visible without extra interaction.

---

## 8. Total Count

Total count is mandatory when Pagination is visible.

Users must be able to quickly understand total result volume.

Recommended IKARY default: show range and total in the same expression, e.g. `26–50 of 243`.

---

## 9. Page Size Selector

Page size selector is mandatory for paginated list experiences unless the page size is intentionally fixed by product design.

Page size selector must:

- be controlled
- use typed options
- update page size through List Page
- reset page to 1 through List Page when changed
- remain visually secondary to the main navigation controls

Recommended options for enterprise lists: 10, 25, 50, 100. Optional: 200, or All (only for small datasets and only when operationally safe).

Recommended IKARY default: **25**.

---

## 10. Page Navigation Controls

Pagination must support: previous page, next page.

It may also support: first page, last page, page number links, compact ellipsis navigation.

Recommended IKARY baseline: first → previous → compact page list → next → last.

Controls must be disabled appropriately at boundaries:

- page 1 disables first and previous
- final page disables next and last

---

## 11. Page List / Ellipsis Model

When page counts are small, visible page numbers may all be shown.

When page counts are large, Pagination should use a compact page list with ellipsis.

Recommended behavior:

- always show first page
- always show last page
- show current page
- show one or two nearby pages
- collapse distant pages with ellipsis

Example: `1 … 6 7 8 … 24`

This balances clarity and density.

---

## 12. Direct Page Input

Direct page input is optional.

For IKARY V1, it should not be part of the baseline primitive. It adds complexity, increases invalid input handling, and is less important than clear page list navigation for most admin flows.

It may be introduced later if very large datasets justify it.

Recommended IKARY baseline: no direct page input in V1.

---

## 13. Controlled State Model

Pagination is driven by controlled props.

Conceptual model:

```typescript
type PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};
```

Pagination must remain controlled by props.

---

## 14. URL and Query Ownership

Pagination must not encode URL state itself.

List Page owns: `page`, `pageSize`, page reset rules, query synchronization, and data refetching.

Example flow:

1. user clicks page 3
2. Pagination emits `onPageChange(3)`
3. List Page updates URL
4. List Page refetches data

That is the canonical model.

---

## 15. Reset Rules

Pagination behavior must remain consistent with query changes.

Recommended baseline:

- changing search resets page to 1
- changing filters resets page to 1
- changing page size resets page to 1
- changing sort does not reset page by default unless product rules explicitly require it

These rules belong to List Page, but Pagination must assume them.

---

## 16. Responsive Behavior

Pagination must adapt predictably.

### 16.1 Wide layouts

On wider layouts, Pagination may show: result range, total count, page size selector, first / previous / page list / next / last.

### 16.2 Narrow layouts

On narrower layouts:

- result range remains visible if possible
- page list may collapse
- first / last may be hidden before previous / next
- page size selector may move below or wrap
- layout may stack into two rows

The responsive goal is to preserve core navigation, preserve count visibility, and avoid horizontal chaos.

---

## 17. Accessibility

Pagination must be accessible by default.

It must support:

- navigation landmark or equivalent semantic grouping
- accessible labels for page controls
- `aria-current="page"` on the active page
- keyboard navigation across controls
- visible focus states
- disabled state clarity
- page size selector labeling

The active page must be programmatically identifiable.

---

## 18. Authorization Awareness

Pagination is generally not permission-sensitive, but page size limits may still be constrained by product or plan.

Examples: maximum page size by tenant plan, restricted All option, admin-only larger page sizes.

These rules must remain declarative.

---

## 19. Observability

Pagination participates in list observability.

Recommended events:

- `list_page_changed`
- `list_page_size_changed`

Recommended payload:

- `route`
- `workspaceId`
- `cellId`
- `entityType`
- `rendererType`
- `page`
- `pageSize`
- `totalItems`
- `totalPages`

Observability must be emitted through the canonical list event model.

---

## 20. Visual Style Rules

Pagination should feel:

- calm
- precise
- compact
- modern
- enterprise-grade

Recommended baseline visual rules:

- clear separation from content above
- compact but comfortable controls
- restrained visual emphasis
- active page visibly distinct
- disabled controls subtle but legible
- page size selector visually aligned with navigation

Pagination should feel operational, not decorative.

---

## 21. Forbidden Patterns

The following are forbidden:

- Pagination-owned URL state
- Pagination-owned fetch logic
- renderer-owned pagination source of truth
- infinite scroll as the canonical list behavior
- arbitrary per-page pagination styles
- missing total count for large result sets
- hidden page size behavior
- oversized pagination bars with every page number shown
- ambiguous disabled states
- ad hoc cursor and page-number UX mixed in the same primitive

---

## 22. Recommended Defaults

Unless explicitly configured otherwise:

- Pagination is hidden when `totalPages <= 1`
- page size selector is visible
- default page size is 25
- page size options are 10, 25, 50, 100
- result range uses `start–end of total`
- page list uses compact ellipsis model
- previous and next are always present
- first and last are visible on larger layouts
- page size change resets page to 1

---

## 23. Definition of Done

A Pagination primitive is compliant if:

- it uses the shared primitive
- it is controlled by List Page
- range and total are visible when active
- page size selector is supported unless intentionally fixed
- navigation controls are clear
- compact page list behavior is implemented
- responsive behavior is predictable
- accessibility is respected
- observability integrates with the canonical list model
- no forbidden patterns are used

---

## 24. Canonical Summary

The Pagination primitive is the canonical page-navigation control for IKARY list pages.

**It owns:**

- range display
- total display
- page size UI
- page navigation UI

**It does not own:**

- pagination source of truth
- URL state
- fetch orchestration
- filters
- sorting
- selection

Those belong to List Page.

---

## 25. React Primitive

```tsx
import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

function getRange(page: number, pageSize: number, totalItems: number) {
  if (totalItems <= 0) {
    return { start: 0, end: 0 };
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return { start, end };
}

function getVisiblePages(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  const left = Math.max(current - 1, 2);
  const right = Math.min(current + 1, total - 1);

  if (left > 2) {
    pages.push('ellipsis');
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < total - 1) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const { start, end } = getRange(page, pageSize, totalItems);
  const visiblePages = getVisiblePages(page, totalPages);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-col gap-3 border-t pt-4', 'lg:flex-row lg:items-center lg:justify-between', className)}
    >
      <div className="text-sm text-muted-foreground">
        {start}–{end} of {totalItems}
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          aria-label="Go to first page"
          className="hidden sm:inline-flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {visiblePages.map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground" aria-hidden="true">
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Go to page ${item}`}
                className="min-w-9"
              >
                {item}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          aria-label="Go to last page"
          className="hidden sm:inline-flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 lg:justify-end">
        <span className="text-sm text-muted-foreground">Items per page</span>

        {onPageSizeChange ? (
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="w-[88px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm font-medium">{pageSize}</div>
        )}
      </div>
    </nav>
  );
}
```

### Locked design decisions for IKARY

- List Page owns state — Pagination only renders
- show `start–end of total` always
- always allow page-size selection
- default page size is 25
- compact numbered pages with ellipsis for large sets
- hide entirely when only one page exists
- no infinite scroll as the canonical list behavior
