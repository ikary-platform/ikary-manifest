# Tabs Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `Tabs` primitive for Micro OS.

`Tabs` is the canonical tab navigation primitive for switching between related content surfaces.

> It is not a page shell. It is not a routing system by itself. It is not a workflow engine. Those concerns belong to page-level primitives and route orchestration.

---

## 1. Philosophy

`Tabs` exists to provide consistent and accessible navigation across peer content views.

It should:

- Keep active context clear
- Preserve predictable keyboard and pointer behavior
- Support declarative navigation via `href` or runtime action dispatch via `actionKey`
- Remain composable in page and section layouts
- Avoid business-specific behavior

---

## 2. Usage

`Tabs` may be used for:

- Top-level page sections
- Detail surface sub-navigation
- Context-specific content groups

**Examples:**

- Overview / History / Audit
- Details / Permissions / Integrations
- Open / Closed / Archived

`Tabs` should be used when users need clear, direct navigation between peer views.

---

## 3. Core Structure

```
Tabs
  └── items[]
       ├── key
       ├── label
       └── href | actionKey
```

Each tab item must declare exactly one activation target:

- `href` for declarative navigation
- `actionKey` for runtime-dispatched behavior

---

## 4. Item Rules

Each tab item supports:

- `key` (required, non-empty)
- `label` (required, non-empty)
- `href` (optional)
- `actionKey` (optional)
- `count` (optional, non-negative integer)
- `disabled` (optional)
- `hiddenWhenUnauthorized` (optional)

Constraints:

- At least one of `href` or `actionKey` is required
- `href` and `actionKey` cannot both be set
- Item keys must be unique across `items`

---

## 5. Active State

`activeKey` is optional.

When provided, it must reference one declared tab item key.

If it references an unknown key, the contract is invalid.

---

## 6. Overflow Behavior

Overflow configuration is optional:

```ts
overflow?: {
  mode?: 'scroll' | 'menu'
  collapseBelow?: 'sm' | 'md' | 'lg'
}
```

This allows responsive tab behavior without introducing custom tab systems.

---

## 7. Density

`dense?: boolean` is optional and controls compact spacing when needed.

It must only affect spacing density, not tab semantics.

---

## 8. Accessibility

`Tabs` must:

- Preserve clear active tab indication
- Keep tab labels visible and readable
- Keep disabled state explicit
- Support keyboard navigation
- Maintain logical reading order

Counts (`count`) are supplementary and must not be the only meaning signal.

---

## 9. Behavior Boundaries

`Tabs` is a presentational navigation primitive.

It may expose tab activation events through runtime wiring, but it must not own:

- Route parsing rules
- Page data fetching
- Business authorization policies
- Page lifecycle orchestration

---

## 10. Canonical Schema Shape

```ts
type TabsItem = {
  key: string;
  label: string;
  href?: string;
  actionKey?: string;
  count?: number;
  disabled?: boolean;
  hiddenWhenUnauthorized?: boolean;
};

type TabsPresentation = {
  type: 'tabs';
  items: TabsItem[];
  activeKey?: string;
  overflow?: {
    mode?: 'scroll' | 'menu';
    collapseBelow?: 'sm' | 'md' | 'lg';
  };
  dense?: boolean;
};
```

---

## 11. Validation Expectations

Validation must enforce:

- Non-empty `items`
- Required non-empty item `key` and `label`
- Exactly one target behavior (`href` xor `actionKey`) per item
- Unique item keys
- Valid `activeKey` reference if present

---

## 12. Non-Goals

`Tabs` must not become:

- A workflow-state machine
- A hidden permission filter engine
- A free-form navigation builder
- A replacement for route contracts

It remains a focused, composable navigation primitive.
