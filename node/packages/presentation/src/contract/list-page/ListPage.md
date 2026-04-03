# ListPage Contract

**Version:** 1.0  
**Scope:** cell-contract-presentation  
**Status:** Mandatory

---

This document defines the canonical `ListPage` primitive for IKARY Cell presentation.

`ListPage` is the page-level orchestration primitive for collection-oriented pages. It composes the header, navigation, control bar, collection renderer, pagination, and state surfaces into one canonical structure.

It does not own:

- data fetching implementation
- backend query definitions
- routing orchestration
- mutation logic
- entity schema

Those concerns belong to the runtime, controller, or surrounding page composition.

---

## 5. Canonical Structure

Not every page must use every section, but the structure must remain canonical.

```
ListPage
  ├── PageHeader (optional)
  ├── Lower Navigation (optional)
  ├── Control Bar
  │    ├── Search
  │    ├── Filters
  │    ├── Sort Controls
  │    └── Bulk Actions (conditional)
  ├── Collection Renderer
  │    ├── DataGrid
  │    └── CardList
  ├── Empty / Error / Loading State (conditional)
  └── Pagination
```

---

## 6. Supported Renderer Modes

V1 supports these list renderer modes: `data-grid`, `card-list`.

`ListPage` chooses one renderer. The page-level orchestration remains consistent regardless of renderer choice.

---

## 7. Page Header Rules

A `ListPage` may define a `PageHeader`.

The header is responsible for: title, description, page-level primary action, page-level secondary actions, optional metadata, optional lower slot.

`ListPage` must not push collection-specific controls like pagination into `PageHeader`. The header is about page identity and page-level actions.

---

## 8. Lower Navigation Rules

`ListPage` may include lower navigation under the header.

Typical use cases: tabs between sub-views, segment navigation between list categories, scoped navigation inside the entity domain.

Preferred primitive: `Tabs`.

This navigation is still part of the page shell, not part of the collection renderer.

---

## 9. Control Bar Rules

The control bar is where list controls live.

V1 may support: search, filters, sort state display or compact sort controls, bulk actions when selection is active.

The control bar must remain separate from: page header actions, renderer internals, and pagination controls.

---

## 10. Search

Search is page-level, not renderer-level.

Search belongs to `ListPage` because it affects query state, pagination reset, empty-state semantics, and all renderer modes equally.

Search should not be owned by `DataGrid` or `CardList`.

---

## 11. Filters

Filters are page-level, not renderer-level.

Filters should be declared canonically and rendered in a predictable page surface.

Filter behavior such as query synchronization, reset rules, and default values belongs to runtime/controller logic, not to the lower-level renderer primitives.

---

## 12. Sorting

Sorting truth belongs to `ListPage`.

`DataGrid` may expose sorting UI affordances. `CardList` may expose sort summary or rely on page-level controls. But canonical sort state belongs to the page orchestration layer.

`ListPage` owns: current sort field, current sort direction, sync with query state, and reset behavior when filters/search change.

---

## 13. Selection

Selection truth belongs to `ListPage`.

`DataGrid` may render row selection UI. `CardList` may later support card selection UI.

But selected IDs, selection scope, and bulk action activation belong to `ListPage`.

---

## 14. Bulk Actions

Bulk actions are page-level and appear only when selection is active.

Bulk actions do not belong in `PageHeader`, inside `DataGrid`, inside `CardList`, or inside `Pagination`. They belong to the page orchestration surface.

V1 should keep bulk actions compact and contextual.

---

## 15. Renderer Rules

### 15.1 DataGrid renderer

Best for: dense data, admin-heavy views, operational views, sortable tabular records.

### 15.2 CardList renderer

Best for: summary-oriented views, compact visual scan, lighter-density list pages, entity overviews.

The page structure above the renderer should remain consistent.

---

## 16. Pagination

Pagination belongs to `ListPage`, not to the renderer.

`ListPage` owns: current page, page size, total items, total pages, reset rules, query sync.

Pagination is a reusable primitive rendered by `ListPage`. It must work equally with `DataGrid` and `CardList`.

---

## 17. Empty State

A `ListPage` may render an empty state when there are no records.

A canonical list page empty state should distinguish between: no records exist, and no results match current search/filters.

The page may also render loading state and error state. These are page-level surfaces, not renderer-specific surfaces. Renderers may host local empty shells, but the page decides the semantics.

---

## 18. Loading State

`ListPage` owns loading semantics for the collection page.

The renderer may show skeletons or loading shells, but the page decides when loading is active, which controls remain interactive, and whether loading is initial, refresh, or overlay.

V1 may keep this simple.

---

## 19. Error State

Errors related to the collection page should be surfaced at page level.

Examples: failed to load records, failed to apply filters, failed to refresh list.

Do not bury collection-page errors deep inside renderer internals.

---

## 20. Action Hierarchy

A `ListPage` should preserve a clear action hierarchy.

**Page-level actions** (examples: Create, Export, Refresh, Open settings) belong in `PageHeader`.

**Selection-based actions** (examples: Archive selected, Delete selected, Assign owner) belong in the bulk action surface.

**Row/card-level actions** (examples: Open, Edit, Retry) belong in `DataGrid` or `CardList`.

This separation is critical.

---

## 21. Accessibility

`ListPage` must be accessible.

Rules:

- page title must remain visible
- control bar must remain keyboard navigable
- collection renderer must remain accessible
- pagination must remain accessible
- active filters/search state must remain understandable
- empty and error states must remain textual and explicit

Do not rely on color or layout position alone to communicate state.

---

## 22. Responsive Behavior

`ListPage` must degrade predictably.

Rules:

- control bar may stack on smaller screens
- lower navigation may collapse
- pagination may compact
- collection renderer may switch layout density but must not break structure
- page header must remain readable before density

Responsive behavior must remain controlled and canonical.

---

## 23. Anti-Patterns

Do not use `ListPage` for: dashboards, detail pages, forms, arbitrary free-form compositions, or multiple unrelated entities mixed into one uncontrolled list surface.

Do not let `DataGrid`, `CardList`, or `Pagination` individually own page orchestration state. That belongs to `ListPage`.

Do not embed page-level logic directly into renderer primitives.

---

## 24. Contract Principles

The `ListPage` presentation contract must stay:

- declarative
- stable
- serializable
- compositional
- easy for an LLM to generate correctly

The contract should define: page header presence/config, lower navigation config, control surface config, renderer choice, pagination config, empty state config.

The contract should not define: raw callbacks, fetch logic, backend query definitions, mutation logic, or direct React nodes.

---

## 25. Recommended Presentation Contract Shape

A good V1 conceptual shape is:

```
ListPagePresentation
  ├── type = "list-page"
  ├── header?
  ├── navigation?
  ├── controls?
  │    ├── search?
  │    ├── filters?
  │    ├── sorting?
  │    └── bulkActions?
  ├── renderer
  │    ├── mode = data-grid | card-list
  │    └── presentation
  ├── pagination?
  └── emptyState?
```

The renderer-specific presentation is nested inside the page contract.

---

## 26. Relationship to Other Primitives

`ListPage` composes: `PageHeader`, `Tabs`, `DataGrid`, `CardList`, `Pagination`.

It should also reuse: `FieldValue`, and filter/search primitives later if they become formalized.

This is the first truly composition-level primitive in the stack.

---

## 27. V1 Scope

Include: page header, optional lower navigation, search toggle/config, filters config, sort ownership/config, renderer choice, pagination config, empty state config.

Defer: saved views, configurable column chooser at page level, advanced bulk workflow orchestration, multi-entity hybrid pages, deeply custom control bar slot systems, drag-and-drop page composition.

---

## 28. Summary

`ListPage` is the canonical collection page primitive for IKARY.

It exists to provide: one standard collection-page structure, one place for page-level orchestration, clean separation between page concerns and renderer concerns, and reusable composition across `DataGrid` and `CardList`.

It should feel like the standard IKARY way to render a list page.

---

## Appendix: CardList Runtime Integration

### CardList.resolver.ts

`cell-runtime-ui/src/primitives/card-list/CardList.resolver.ts`

```typescript
import type { CardListPresentation } from '@ikary/cell-contract-presentation';
import { buildCardListViewModel, type BuildCardListViewModelInput } from './CardList.adapter';

export type CardListResolverRuntime<TRecord extends Record<string, unknown> = Record<string, unknown>> = Omit<
  BuildCardListViewModelInput<TRecord>,
  'presentation'
>;

export function resolveCardList<TRecord extends Record<string, unknown> = Record<string, unknown>>(
  presentation: CardListPresentation,
  runtime: CardListResolverRuntime<TRecord>,
) {
  return buildCardListViewModel({
    presentation,
    ...runtime,
  });
}
```

---

### index.ts

`cell-runtime-ui/src/primitives/card-list/index.ts`

```typescript
export { CardList } from './CardList';
export { buildCardListViewModel, type BuildCardListViewModelInput } from './CardList.adapter';
export { resolveCardList, type CardListResolverRuntime } from './CardList.resolver';
export type {
  CardListActionIntent,
  CardListBadgeTone,
  CardListLayoutColumns,
  CardListResolvedAction,
  CardListResolvedBadge,
  CardListResolvedCard,
  CardListResolvedEmptyState,
  CardListResolvedField,
  CardListResolvedMetric,
  CardListValueType,
  CardListViewProps,
} from './CardList.types';
```

---

### CardList.register.ts

`cell-runtime-ui/src/primitives/card-list/CardList.register.ts`

```typescript
import { registerPrimitive } from '../../registry/primitiveRegistry';
import { CardList } from './CardList';
import { resolveCardList } from './CardList.resolver';

registerPrimitive('card-list', {
  component: CardList,
  resolver: resolveCardList,
});
```
