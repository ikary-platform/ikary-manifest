# FieldValue Contract

**Version:** 1.0  
**Scope:** cell-contract-presentation  
**Status:** Mandatory

---

This document defines the canonical `FieldValue` primitive for IKARY Cell presentation.

`FieldValue` is the shared read-only value renderer used across presentation primitives such as:

- `DetailSection`
- `DataGrid`
- `CardList`
- `PageHeader` metadata surfaces
- compact summary blocks

It is a display primitive.

It does not own:

- field labels
- form editing
- data fetching
- mutation logic
- page orchestration
- section layout
- collection layout

---

## 1. Purpose

`FieldValue` exists to render a single value in a canonical, predictable, reusable way.

It provides one stable rendering vocabulary for common data types.

Examples: customer name, amount, currency, creation date, boolean flags, status badges, enum labels, links, empty values.

Without `FieldValue`, each primitive starts inventing its own local rendering rules. That leads to inconsistency across the platform.

---

## 2. Primitive Responsibilities

`FieldValue` owns:

- value rendering
- value type interpretation
- canonical empty rendering
- formatting hints
- link rendering
- badge / status rendering
- boolean rendering
- compact display consistency

`FieldValue` does not own:

- labels
- group layout
- field ordering
- section framing
- edit controls
- validation messages
- actions
- mutations

---

## 3. Primitive Philosophy

`FieldValue` must be:

- consistent
- readable
- compact
- deterministic
- enterprise-oriented

It must avoid:

- decorative display patterns
- uncontrolled custom JSX in the contract
- free-form styling knobs
- ambiguous empty states
- inconsistent date/number rendering
- one-off badge color logic spread across the app

A given value type should render predictably everywhere unless intentionally overridden by runtime policy.

---

## 4. Canonical Use Cases

`FieldValue` should be used for:

- single field read-only display
- tabular cell display
- detail section values
- compact summary values
- metadata values
- lightweight relation links

It should not be used for:

- form inputs
- content editing
- large custom widgets
- arbitrary markdown/HTML display
- complex collection rendering

---

## 5. Supported V1 Value Types

V1 supports these canonical value types:

- `text`
- `number`
- `currency`
- `date`
- `datetime`
- `boolean`
- `badge`
- `status`
- `enum`
- `link`

These types are the shared baseline for the platform.

---

## 6. Canonical Behavior Per Type

### 6.1 text

Used for plain textual values.

Examples: customer name, owner name, email, environment label.

Rules: render as readable inline text, allow wrapping or truncation depending on parent policy, never silently disappear when empty.

### 6.2 number

Used for numeric values without currency semantics.

Examples: record count, usage quantity, score, retry count.

Rules: use shared numeric formatting, maintain readability, avoid local ad hoc formatting logic.

### 6.3 currency

Used for monetary values.

Examples: invoice total, MRR, service cost.

Rules: use shared currency formatting, runtime may supply locale/currency policy, contract may provide currency hint if needed, renderer must not hardcode product-specific currency logic.

### 6.4 date

Used for date-only values.

Examples: created date, contract start date, billing cycle date.

Rules: use shared date formatting, do not render raw ISO strings unless fallback is unavoidable.

### 6.5 datetime

Used for values containing both date and time.

Examples: last updated, processed at, approved at.

Rules: use shared datetime formatting, keep timezone handling centralized in runtime/platform helpers.

### 6.6 boolean

Used for true/false values.

Examples: verified, enabled, archived, billing active.

Rules: render explicitly, do not rely only on color, canonical labels are typically `Yes` / `No`, icon-only rendering is discouraged in V1.

### 6.7 badge

Used for compact categorical emphasis.

Examples: plan tier, environment, region, entity type.

Rules: use shared badge styling, tone must stay controlled, not every text value should become a badge.

### 6.8 status

Used for operational or workflow status values.

Examples: active, pending, approved, failed, blocked.

Rules: render with shared status tone mapping, tone mapping must stay centralized, avoid local per-component status color dictionaries when possible.

### 6.9 enum

Used for enumerated labels.

Examples: source type, integration mode, invoice type.

Rules: render like a standardized categorical display, may visually resemble badge or text depending on runtime policy, must remain deterministic.

### 6.10 link

Used for navigable values.

Examples: customer name linking to detail page, owner email linking externally, related record label.

Rules: render as an explicit link or button-like link, clickable row surfaces must not replace explicit links where discoverability matters, link rendering must remain accessible.

---

## 7. Empty State Rules

A `FieldValue` must always render an explicit empty state.

Canonical empty marker: `—`.

Optional custom `emptyLabel` examples: `Not set`, `No owner`, `Unavailable`.

Rules:

- empty values must not collapse silently
- parent primitives should not need to invent empty rendering logic repeatedly
- empty rendering should remain visually secondary but clearly visible

Empty means: `null`, `undefined`, empty string, or missing path resolution.

---

## 8. Link Rules

When `valueType = link`, the primitive may render an anchor with `href` or a runtime-resolved clickable action.

Rules:

- contract must remain declarative
- runtime resolves actual navigation behavior
- link text must remain visible
- links must preserve keyboard accessibility
- links must not rely solely on row-level click behavior

---

## 9. Formatting Rules

Formatting belongs to shared runtime/platform policy.

The contract may provide hints. The runtime decides exact formatting behavior.

Examples of allowed hints: currency code, date style, datetime style.

The contract should not contain: raw formatting functions, locale objects, or renderer-specific formatting code.

---

## 10. Tone Rules

For badge/status-like rendering, tone should remain controlled.

Allowed tones in V1: `neutral`, `info`, `success`, `warning`, `danger`.

Rules:

- tone must remain semantic
- tone must not encode meaning that is invisible to non-color users
- text should still communicate the meaning

---

## 11. Accessibility

`FieldValue` must be accessible.

Rules:

- links must be keyboard accessible
- badges and statuses must maintain readable contrast
- booleans must not rely only on icon/color
- empty states must render visible text
- truncation must not destroy meaning without fallback
- tooltip-only meaning is not sufficient

---

## 12. Responsive Behavior

`FieldValue` must degrade gracefully.

Rules:

- long text may wrap or truncate according to parent layout policy
- compact values should remain legible on smaller screens
- avoid overflow for common business values
- links should remain tappable

The parent layout decides spacing and structure. `FieldValue` decides only the value surface.

---

## 13. Anti-Patterns

Do not use `FieldValue` for:

- form editing
- arbitrary raw HTML
- full markdown blocks
- custom React nodes in the contract
- embedding unrelated action buttons next to values
- component-local formatting rules for standard types
- inconsistent empty rendering across parents

---

## 14. Contract Principles

The `FieldValue` presentation contract must stay:

- declarative
- serializable
- renderer-agnostic
- stable
- small
- easy for an LLM to generate correctly

The contract should define: value type, optional display hints, optional empty label, optional tone, optional link hint, optional formatting hints.

The contract should not define: callback functions, React nodes, business logic, mutation logic, or fetch logic.

---

## 15. Recommended Presentation Contract Shape

A good V1 conceptual shape is:

```
FieldValuePresentation
  ├── type = "field-value"
  ├── valueType
  ├── emptyLabel?
  ├── tone?
  ├── hrefTarget?
  └── format?
```

The actual runtime value itself may come from:

- a resolved field path
- a direct runtime value
- a parent primitive adapter

---

## 16. Relationship to Other Primitives

`FieldValue` is a foundational display primitive used by: `DetailSection`, `DataGrid`, `CardList`, `PageHeader` meta rendering, and future summary primitives.

Recommended rule: if a primitive needs to display a single business value, it should consider using `FieldValue`.

This reduces duplication and keeps formatting/rendering policies centralized.
