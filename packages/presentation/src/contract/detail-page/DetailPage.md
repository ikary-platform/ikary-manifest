# DetailPage Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `DetailPage` primitive for Micro OS.

`DetailPage` is the canonical page-level surface for viewing a single entity.

> It is not a history panel. It is not an audit log implementation. It is not a form engine. Those concerns belong to specialized primitives or panels composed inside the page.

---

## 1. Philosophy

`DetailPage` exists to provide the canonical representation of a single entity.

It should:

- Establish the identity of the entity clearly
- Present key metadata consistently
- Provide a stable structure for domain content
- Make governance surfaces first-class
- Support a predictable read/edit experience

---

## 2. Usage

`DetailPage` may be used for any entity detail route.

**Examples:**

- Customer detail page
- Invoice detail page
- Project detail page
- User detail page
- Contract detail page

All entities should converge toward this page structure.

---

## 3. Core Responsibilities

**`DetailPage` owns:**

- Page shell
- Page header
- Promoted metadata row
- Top-level tab structure
- Content slot for the active tab
- Overview/edit-mode shell behavior
- Tab routing contract
- Page-level render-state handling

**`DetailPage` must not own:**

- History diff rendering internals
- Rollback execution logic
- Audit grid implementation details
- Backend entity fetching policy
- Domain-specific form orchestration internals

---

## 4. Layout Structure

```
DetailPageLayout
  ├── Header
  ├── Level 1 Tabs
  └── Active Tab Content
```

The page must follow the platform layout contract. The layout must remain stable across all entities.

---

## 5. Header Contract

The header is **mandatory**.

It must contain:

1. Title
2. Promoted Metadata Row
3. Header Actions

No variation allowed in the header structure.

---

## 6. Title

The title is **required**. It must represent the primary display identity of the entity and must be visually dominant within the header.

| ✅ Examples    |
| -------------- |
| Customer name  |
| Invoice number |
| Project name   |
| User full name |

---

## 7. Promoted Metadata Row

The promoted metadata row is **mandatory**. It appears immediately below the title.

It must display:

- Created At
- Created By
- Last Updated At
- Last Updated By
- Current Version
- Status, if applicable

**Rules:**

- Typography must be smaller than the title
- Visual treatment must be subtle
- Layout must be horizontally structured when space allows
- Spacing must be consistent across entities
- Required metadata fields must not be conditionally hidden

Metadata consistency is mandatory across all entities.

---

## 8. Header Actions

Header actions are **allowed and expected**. These are page-level actions, not tab-level actions.

| ✅ Examples |
| ----------- |
| Edit        |
| Delete      |
| Archive     |
| Approve     |
| Export      |

Header actions must remain distinct from tab content actions, section actions, and row/item actions.

---

## 9. Level 1 Tabs

Top-level tabs are **mandatory** when the entity has multiple detail surfaces. Tabs must be rendered as first-class level 1 navigation and must not be hidden inside secondary navigation patterns.

---

## 10. Tab Ordering

Level 1 tabs must follow this order:

| Position | Tab                               |
| -------- | --------------------------------- |
| 1        | Overview (always first)           |
| 2–N      | Domain-specific tabs, if any      |
| N+1      | History (always before Audit Log) |
| N+2      | Audit Log (always last)           |

**Rules:**

- `Overview` is always first
- `History` and `Audit Log` are always last
- `History` must appear before `Audit Log`
- Governance tabs must remain visible
- Governance tabs must not be grouped under another tab
- There is no separate Settings tab by default

---

## 11. Overview Tab

`Overview` is the canonical primary domain tab and the default landing tab unless route configuration explicitly selects another valid tab.

It may contain:

- Read-only detail sections
- Inline edit state
- Summary blocks
- Relation blocks
- Domain-specific sections

---

## 12. Edit Mode

Edit mode lives inside `Overview`. It is **not** a separate top-level tab.

**Rules:**

- Edit is entered from a header action or equivalent overview-level action
- Entering edit mode switches the overview body from read mode to edit mode
- Saving returns the overview to read mode
- Cancelling returns the overview to read mode
- Navigating away from `Overview` cancels any active edit state

This behavior keeps edit state local and predictable.

---

## 13. Domain-Specific Tabs

Domain-specific tabs are **optional**. They must appear between `Overview` and governance tabs.

| ✅ Examples |
| ----------- |
| Members     |
| Tasks       |
| Billing     |
| Permissions |
| Attachments |

Do not place History or Audit Log before domain-specific tabs.

---

## 14. Governance Tabs

`History` and `Audit Log` are first-class governance tabs and are **mandatory top-level tabs** in the page structure.

This contract defines their placement and visibility only. Their internal rendering and behaviors belong to dedicated panel contracts.

---

## 15. URL Contract

Top-level tabs must use **path-based routing**. Query strings must not be used for primary tab selection.

| Tab             | Example URL                                                        |
| --------------- | ------------------------------------------------------------------ |
| Overview (base) | `/workspace/:workspaceId/cell/:cellId/projects/:projectId`         |
| History         | `/workspace/:workspaceId/cell/:cellId/projects/:projectId/history` |
| Audit Log       | `/workspace/:workspaceId/cell/:cellId/projects/:projectId/audit`   |

The base entity route maps to `Overview`.

---

## 16. Active Tab Content

The content region must render the active level 1 tab content. The page shell must remain stable while tab content changes.

This region may contain:

- Detail sections
- Forms
- Grids
- Relation lists
- Audit panel
- History panel

---

## 17. Render-State Handling

`DetailPage` must support canonical page-level render-state handling.

| State     | When to use                                                         |
| --------- | ------------------------------------------------------------------- |
| `loading` | The page cannot yet render the entity shell meaningfully            |
| `error`   | The entity cannot be loaded at page level                           |
| `empty`   | Uncommon for the root detail page; may be used in embedded surfaces |

The page should prefer scoped render states for embedded sections where possible.

---

## 18. Embedded Error Boundaries

Failures inside nested tab content or sections should remain scoped where possible.

**Examples:**

- A relation block fails
- History tab content fails
- Audit tab content fails

These failures should not automatically escalate to a full page error unless the page itself cannot render.

---

## 19. Authorization Visibility Rule

Top-level governance tabs must remain **visible** even when access is restricted.

If access is missing:

- The tab may be disabled
- The tab may communicate restricted access
- The page must **not** hide the governance tab entirely

Detailed permission policy belongs to governance-specific contracts.

---

## 20. Accessibility

`DetailPage` must:

- Render a clear page title
- Preserve accessible tab navigation
- Keep header actions keyboard accessible
- Preserve semantic structure for metadata and sections
- Make active tab context understandable to assistive technologies

The page must not rely only on visual hierarchy without semantic structure.

---

## 21. Canonical Schema Shape

```ts
type DetailPageTab = {
  key: string;
  label: string;
  href: string;
  disabled?: boolean;
  kind?: 'overview' | 'domain' | 'history' | 'audit';
};

type DetailPageMetadataItem = {
  key: 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'version' | 'status';
  label: string;
  value: string;
};

type DetailPageAction = {
  key: string;
  label: string;
  icon?: string;
  href?: string;
  actionKey?: string;
  disabled?: boolean;
  variant?: 'default' | 'secondary' | 'destructive';
};

type DetailPagePresentation = {
  title: string;
  metadata: DetailPageMetadataItem[];
  actions?: DetailPageAction[];
  tabs: DetailPageTab[];
  activeTabKey: string;
  overviewEditable?: boolean;
  isEditing?: boolean;
  content: {
    key: string;
  };
  renderState?: {
    kind: 'loading' | 'error';
    state: unknown;
  };
};
```

---

## 22. Field Semantics

### 22.1 `title`

Required entity display title.

### 22.2 `metadata`

Required promoted metadata row items. The page must ensure the mandatory metadata contract is respected.

### 22.3 `actions`

Optional page-level actions.

### 22.4 `tabs`

Required top-level tabs. Must include `overview`, `history`, and `audit`. Domain tabs are optional.

### 22.5 `activeTabKey`

Required currently active tab key.

### 22.6 `overviewEditable`

Optional flag indicating whether overview supports inline edit mode.

### 22.7 `isEditing`

Optional flag indicating whether overview is currently in edit mode. Only meaningful when the active tab is `overview` and edit is supported.

### 22.8 `content`

Required active content node reference.

### 22.9 `renderState`

Optional page-level render state. Use only for root page loading/error, not for every nested surface.

---

## 23. Default Rendering Rules

Recommended defaults:

- Render title first
- Render metadata immediately below title
- Render header actions on the trailing side
- Render `Overview` as the default tab
- Keep `History` and `Audit Log` visible and last
- Keep edit mode scoped to `Overview`
- Cancel edit mode automatically when leaving `Overview`
- Use path-based routing for tabs

---

## 24. Examples

### 24.1 Standard entity page

```yaml
title: Acme Corporation
metadata:
  - createdAt
  - createdBy
  - updatedAt
  - updatedBy
  - version
  - status
tabs:
  - key: overview
    label: Overview
    kind: overview
  - key: members
    label: Members
    kind: domain
  - key: history
    label: History
    kind: history
  - key: audit
    label: Audit Log
    kind: audit
activeTabKey: overview
```

### 24.2 Editable overview

```yaml
overviewEditable: true
isEditing: false
```

### 24.3 Governance-restricted page

```yaml
tabs:
  - key: history
    label: History
    kind: history
    disabled: true
  - key: audit
    label: Audit Log
    kind: audit
    disabled: true
```

---

## 25. Governance

`DetailPage` is the canonical entity page shell.

All entity detail routes should converge toward this primitive instead of inventing ad hoc detail layouts per entity. Consistency is mandatory.

---

## 26. Implementation Notes

**Implementation should prefer:**

- Stable page shell composition
- Consistent promoted metadata
- Explicit top-level tab structure
- Clear separation between page shell and governance panels
- Local edit mode within `Overview`

**Implementation must avoid:**

- Hidden governance tabs
- Query-string-based primary tab routing
- A separate top-level edit tab
- Inconsistent header metadata treatment
- Page-specific detail shells that drift from the contract

> `DetailPage` is generic and reusable by design.
