# EmptyState Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical EmptyState primitive for Micro OS.

EmptyState is used when a surface is valid and available, but there is no content to display.

> It is not an error. It is not loading. It is not a permission failure.

---

## 1. Philosophy

EmptyState exists to explain absence clearly and guide the next action.

It should:

- Acknowledge that no content exists
- Explain why in simple terms when possible
- Optionally guide the user toward the next useful action
- Remain lightweight and visually calm

EmptyState must never feel like a crash.  
EmptyState must never look like an error banner.

---

## 2. Usage

EmptyState may be used in:

- Full pages
- List regions
- Relation panels
- Cards
- Widgets
- Search results
- Filtered views
- Tabs
- Sections

**Examples:**

- No records yet
- No search results
- No filtered results
- No comments yet
- No attachments yet
- No related entities yet

---

## 3. When to Use

**Use EmptyState when:**

- The request succeeded
- The user is allowed to see the surface
- The system is healthy
- The resulting collection or content is empty

**Do not use EmptyState for:**

- Loading
- Server failure
- Validation failure
- Authorization failure
- Missing route
- Unavailable feature

---

## 4. Visual Structure

```
EmptyState
  ├── optional icon / illustration
  ├── title
  ├── optional description
  ├── optional primary action
  └── optional secondary action
```

The layout must stay compact by default.

---

## 5. Content Rules

### 5.1 Title

Title is **required**.

It must be short and clear.

| ✅ Examples        |
| ------------------ |
| No customers yet   |
| No invoices found  |
| No results         |
| No attachments yet |

---

### 5.2 Description

Description is **optional**.

It should clarify what the user can do next or why the surface is empty.

| ✅ Examples                                       |
| ------------------------------------------------- |
| Create your first customer to get started.        |
| Try adjusting your filters or search terms.       |
| Related documents will appear here once uploaded. |

---

### 5.3 Actions

Actions are **optional**.

Recommended rules:

- At most one primary action
- Optionally one secondary action
- Actions must be contextually relevant
- Actions must be explicit and user-safe

| ✅ Examples     |
| --------------- |
| Create customer |
| Clear filters   |
| Upload file     |
| Refresh         |

> At least one of `actionKey` or `href` should be provided for actions.

---

## 6. Variants

EmptyState supports the following semantic variants:

| Variant    | Meaning                                  |
| ---------- | ---------------------------------------- |
| `initial`  | There is no data yet                     |
| `search`   | Search returned no results               |
| `filter`   | Filters reduced results to zero          |
| `relation` | Related collection is empty              |
| `section`  | Subsection has no content                |
| `widget`   | Dashboard or embedded component is empty |

Variants may affect copy and density, but not the fundamental structure.

---

## 7. Density

EmptyState supports:

| Value         | Usage                                          |
| ------------- | ---------------------------------------------- |
| `comfortable` | Default for pages and large panels             |
| `compact`     | Preferred for cards, tabs, and nested sections |

---

## 8. Accessibility

EmptyState must:

- Render semantic text, not image-only communication
- Preserve action accessibility through normal buttons/links
- Ensure title is visible to screen readers
- Never rely only on color to communicate meaning

---

## 9. Behavior

EmptyState is **static** and **non-blocking**.

It must not:

- Trap focus
- Auto-refresh aggressively
- Display spinners
- Display destructive messaging

---

## 10. Canonical Schema Shape

```ts
type EmptyStatePresentation = {
  title: string;
  description?: string;
  icon?: string;
  variant?: 'initial' | 'search' | 'filter' | 'relation' | 'section' | 'widget';
  density?: 'comfortable' | 'compact';
  primaryAction?: {
    label: string;
    actionKey?: string;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    actionKey?: string;
    href?: string;
  };
};
```

---

## 11. Examples

### 11.1 Initial collection

```yaml
title: No customers yet
description: Create your first customer to start managing your workspace.
primaryAction: Create customer
```

### 11.2 Filtered result

```yaml
title: No matching invoices
description: Try removing one or more filters.
primaryAction: Clear filters
```

### 11.3 Empty relation

```yaml
title: No attachments yet
description: Files linked to this record will appear here.
primaryAction: Upload file
```

---

## 12. Governance

EmptyState is a **first-class runtime primitive**.

It must be reusable across all page types and nested render surfaces.
