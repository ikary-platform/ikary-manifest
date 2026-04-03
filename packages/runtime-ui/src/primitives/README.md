# Primitive Architecture

**Scope:** ikary-ui  
**Status:** Canonical

---

This document explains how UI primitives work in the Cell runtime.

It covers:

- the role of a primitive
- the difference between contract and runtime props
- why adapters and resolvers exist
- how registration and rendering work
- the recommended file structure
- how to add a new primitive correctly

This is a system-level document. It is not specific to one primitive like Pagination or DataGrid.

---

## 1. Core Idea

A primitive is a reusable UI building block rendered by the Cell runtime.

Examples: `data-grid`, `pagination`, `card-list`, `page-header`, `detail-section`.

A primitive is not just a React component. In this architecture, a primitive usually has multiple layers:

- Presentation contract
- Runtime props
- Adapter
- Resolver
- React component
- Registry registration

Each layer has a different responsibility.

---

## 2. The Mental Model

The rendering pipeline is:

```
layout JSON
  -> primitive contract props
  -> resolver
  -> adapter
  -> React primitive
```

Or more simply:

```
declarative definition
  + live runtime state
  -> resolved component props
  -> UI
```

The important distinction is:

- the **contract** says what should be rendered
- the **runtime** provides what is happening right now
- the **component** only renders the final resolved props

---

## 3. Contract vs Runtime

This is the most important distinction in the system.

### Contract

The contract is the declarative JSON shape. It lives in `cell-contract-presentation`.

The contract is:

- stable
- serializable
- stored in manifests or layout definitions
- validated with Zod and semantic validators

Typical contract concerns:

- which columns are shown
- whether sorting is enabled
- whether pagination is shown
- whether row actions are visible
- which page size options are allowed

The contract should not contain live state.

### Runtime

Runtime is the live execution state required to make the primitive work right now. It lives in the runtime layer and is passed during rendering.

Typical runtime concerns:

- loaded rows
- current page
- current page size
- current sort
- selected row IDs
- event handlers
- action handlers
- route helpers
- formatting helpers

The runtime is not stored in the manifest.

### Rule of thumb

If it is stored in JSON, it probably belongs to the **contract**.  
If it changes during execution, it probably belongs to **runtime**.

---

## 4. Why the Component Should Not Consume the Raw Contract Directly

In simple cases, it can. But in practice, many contract values are not directly usable by a React component.

Examples:

- contract says `actionKey: "edit"` → component needs `onClick: (row) => handleEdit(row)`
- contract says `field: "customer.name"` → component needs the actual value for each row
- contract says `type: "currency"` → component needs formatting behavior
- contract says pagination is enabled → component still needs `page`, `pageSize`, `totalItems`, `onPageChange`

So the component usually should not interpret raw contract and runtime concerns at the same time. That is why the adapter/resolver layer exists.

---

## 5. Adapter

### What an adapter does

The adapter converts contract + runtime into the final props the React component needs. It is a translation layer.

Typical adapter responsibilities:

- resolve defaults
- normalize optional contract fields
- map contract fields to concrete render props
- turn contract action keys into executable handlers
- convert presentation hints into component-friendly booleans, labels, and structures

### What an adapter should not do

An adapter should not: fetch data, own routing, own query state, register primitives, or render UI. It should remain a mapping layer.

### Example

Contract:

```json
{
  "type": "pagination",
  "pageSize": {
    "visible": true,
    "options": [10, 25, 50, 100]
  }
}
```

Runtime:

```typescript
{
  page: 2,
  pageSize: 25,
  totalItems: 140,
  totalPages: 6,
  onPageChange,
  onPageSizeChange
}
```

Resolved props for the React component:

```typescript
{
  page: 2,
  pageSize: 25,
  totalItems: 140,
  totalPages: 6,
  onPageChange,
  onPageSizeChange,
  showPageSize: true,
  pageSizeOptions: [10, 25, 50, 100],
  pageSizeLabel: 'Items per page'
}
```

---

## 6. Resolver

### What a resolver does

The resolver is the runtime entry point for a primitive. It receives contract props and runtime, then calls the adapter and returns the resolved component props.

Typical resolver shape:

```typescript
export function resolvePrimitive(presentation, runtime) {
  return buildPrimitiveViewModel({
    presentation,
    ...runtime,
  });
}
```

### Why the resolver exists

The resolver allows the rendering system to stay generic. The caller can pass declarative contract props, and the runtime knows how to turn those into final component props.

Without a resolver, every caller would need to know how to build the component props manually. That would leak primitive internals into many places.

### What a resolver should not do

A resolver should not become a mini application service. It should not: fetch data, own domain logic, own business rules unrelated to rendering, or render JSX directly. It should stay close to the primitive.

---

## 7. React Primitive

### What the component should do

The React component should focus on rendering. It receives resolved props and produces UI.

It may handle:

- layout
- button clicks
- aria attributes
- visual states
- composition of small render helpers

It should avoid large contract interpretation logic when possible.

### Design principle

The component should be as dumb as reasonably possible. That means:

- do not store contract parsing logic in multiple places
- do not re-implement resolver logic inside the JSX
- do not mix layout, contract interpretation, and runtime orchestration unless necessary

---

## 8. Registry

### Why the registry exists

The registry allows the runtime to resolve a primitive by name.

```typescript
registerPrimitive('data-grid', {
  component: DataGrid,
  resolver: resolveDataGrid,
});
```

This means the runtime can look up the component and the resolver for a primitive key.

### Why register both component and resolver

If the registry only stores the React component, the render pipeline still does not know how to transform contract props into final component props.

By storing both, the primitive becomes fully self-describing in the runtime: how to resolve its props and how to render itself.

---

## 9. PrimitiveRenderer

`PrimitiveRenderer` is the generic runtime rendering entry point.

Its job is:

1. get the primitive definition from the registry
2. call the resolver if one exists
3. render the component with the resolved props

Pseudo-code:

```typescript
const definition = getPrimitive(primitive)

const resolvedProps = definition.resolver
  ? definition.resolver(props, runtime)
  : props

const Component = definition.component

return <Component {...resolvedProps} />
```

This is the core bridge between declarative layout and runtime UI.

---

## 10. Recommended File Structure

For a serious primitive, use this structure:

```
primitives/
  data-grid/
    DataGrid.tsx
    DataGrid.types.ts
    DataGrid.adapter.ts
    DataGrid.resolver.ts
    DataGrid.cells.tsx
    DataGrid.register.ts
    index.ts
```

Another example:

```
primitives/
  pagination/
    Pagination.tsx
    Pagination.types.ts
    Pagination.adapter.ts
    Pagination.resolver.ts
    Pagination.register.ts
    index.ts
```

---

## 11. Responsibility of Each File

| File                      | Responsibility                                                           |
| ------------------------- | ------------------------------------------------------------------------ |
| `<Primitive>.tsx`         | The React component. Renders the final resolved props.                   |
| `<Primitive>.types.ts`    | Runtime prop types consumed by the React component (not contract types). |
| `<Primitive>.adapter.ts`  | Mapping layer from contract + runtime to component props.                |
| `<Primitive>.resolver.ts` | Runtime entry point that calls the adapter.                              |
| `<Primitive>.register.ts` | Registers the primitive in the registry.                                 |
| `index.ts`                | Exports only. Keep free of registration side effects.                    |

---

## 12. Contract Package vs Runtime Package

### cell-contract-presentation

Owns: Zod schemas, presentation types inferred from schemas, semantic validation of the contract, examples and docs for the declarative model.

Examples: `DataGridPresentationSchema`, `PaginationPresentationSchema`.

### cell-runtime-ui

Owns: React components, runtime prop types, adapters, resolvers, registration, small UI-only helpers.

Examples: `DataGrid.tsx`, `DataGrid.types.ts`, `DataGrid.adapter.ts`, `DataGrid.resolver.ts`.

---

## 13. Why Semantic Validation Exists

Zod validates structure. Semantic validation validates meaning.

Example structural validation:

- `type` must be `"data-grid"`
- `columns` must be an array
- `label` must be a string

Example semantic validation:

- at least one visible link column must exist
- only one actions column is allowed
- page size options must be sorted
- `maxVisiblePages` must be odd

The rule is: schema validates shape, semantic validator validates canonical meaning.

---

## 14. How to Create a New Primitive

### Step 1 — Define the presentation contract

In `cell-contract-presentation`: create the schema, infer the TypeScript type, add semantic validation if needed.

```
contract/list/data-grid/DataGridPresentationSchema.ts
validation/semantic/validate-data-grid-presentation.ts
```

### Step 2 — Create the runtime primitive folder

In `cell-runtime-ui`:

```
primitives/
  my-primitive/
    MyPrimitive.tsx
    MyPrimitive.types.ts
    MyPrimitive.adapter.ts
    MyPrimitive.resolver.ts
    MyPrimitive.register.ts
    index.ts
```

### Step 3 — Define runtime prop types

In `<Primitive>.types.ts`, define the props the React component actually needs. These types should describe the final resolved props.

### Step 4 — Build the adapter

In `<Primitive>.adapter.ts`, map presentation contract and runtime values to final component props. Keep it deterministic and small.

### Step 5 — Build the resolver

In `<Primitive>.resolver.ts`, call the adapter. The resolver is usually a thin wrapper.

### Step 6 — Implement the React component

In `<Primitive>.tsx`, render the final resolved props. Avoid large contract interpretation logic unless there is a strong reason.

### Step 7 — Register the primitive

In `<Primitive>.register.ts`:

```typescript
registerPrimitive('my-primitive', {
  component: MyPrimitive,
  resolver: resolveMyPrimitive,
});
```

### Step 8 — Export cleanly

In `index.ts`, export the public runtime API: component, types, adapter, resolver. Keep registration side effects outside `index.ts` if possible.

---

## 15. Naming Conventions

### Primitive key

Use kebab-case, consistent across the whole system.

Good: `data-grid`, `pagination`, `card-list`.

Avoid mixing styles: `data_grid`, `dataGrid`. The registry key, contract type, and renderer key should match.

### File names

Use PascalCase for primitive files: `DataGrid.tsx`, `DataGrid.adapter.ts`, `DataGrid.resolver.ts`.

### Export conventions

Use `component` in registry definitions, not `Component`, unless the whole registry API is intentionally React-style. Consistency matters more than style preference.

---

## 16. When to Skip the Adapter

The adapter is useful, but it is not mandatory in every early version.

You can sometimes let the component consume presentation and runtime props directly. That is acceptable when:

- the primitive is still small
- mapping logic is trivial
- the extra layer would only add ceremony

The adapter becomes worth it when:

- defaulting and normalization grow
- several places need the same mapping
- the registry/resolver model becomes important
- the primitive needs a stable view model

The adapter is a design choice, not a religion.

---

## 17. Recommended Default Architecture

For the current system, the recommended approach is:

- keep the contract in `cell-contract-presentation`
- keep the runtime component in `cell-runtime-ui`
- use an adapter for mapping
- use a resolver so the render pipeline stays generic
- register primitives with both component and resolver

That gives a clean separation between declarative definition, runtime orchestration, and rendering.

---

## 18. Summary

A primitive in this system is made of several layers.

| Layer         | Responsibility                                             |
| ------------- | ---------------------------------------------------------- |
| **Contract**  | Describes what should be rendered                          |
| **Runtime**   | Provides live state and handlers                           |
| **Adapter**   | Maps contract + runtime into final component props         |
| **Resolver**  | Runtime entry point that calls the adapter                 |
| **Component** | Renders the final props                                    |
| **Registry**  | Lets the runtime discover and render the primitive by name |

This separation keeps the system declarative, reusable, testable, and easier to evolve as primitives grow.
