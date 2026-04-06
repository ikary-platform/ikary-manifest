# LoadingState Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `LoadingState` primitive for Micro OS.

`LoadingState` is used when a surface is waiting for data, runtime resolution, or asynchronous work to complete.

> It is not an error. It is not an empty result. It is not a success message. Loading is a normal system condition.

---

## 1. Philosophy

`LoadingState` exists to communicate progress calmly and clearly.

It should:

- Confirm that the system is working
- Preserve layout stability where possible
- Reduce visual anxiety
- Avoid dramatic or noisy loading patterns
- Remain reusable across all surfaces

---

## 2. Usage

`LoadingState` may be used in:

- Full pages
- List regions
- Detail panels
- Tabs
- Cards
- Widgets
- Relation sections
- Async subsections
- Inline content blocks
- Overlays on existing content

**Examples:**

- A list page is waiting for query results
- A detail panel is resolving entity data
- A widget is refreshing
- A related collection is loading
- A tab has been opened and its content is being fetched
- A background refresh is in progress

---

## 3. When to Use

**Use `LoadingState` when:**

- Data is being fetched
- A runtime surface is being hydrated
- A region is refreshing
- An async dependency is pending
- The final content is not yet ready to render

**Do not use `LoadingState` when:**

- The request failed
- The result succeeded but contains no data
- The user lacks authorization
- The feature is unavailable
- Validation failed

Those conditions must use their own canonical states.

---

## 4. Visual Structure

```
LoadingState
  ├── optional skeleton layout
  ├── optional spinner
  ├── optional title / label
  └── optional description
```

`LoadingState` must remain visually lightweight.

---

## 5. Core Principles

### 5.1 Layout Stability

When the final shape of the content is known, `LoadingState` should preserve that approximate footprint.

This avoids:

- Layout jumping
- Visual instability
- Disorienting reflow
- Shifting actions or controls

Skeletons are preferred when the final layout is predictable.

---

### 5.2 Calmness

Loading should feel calm and expected.

Avoid:

- Aggressive animation
- Excessive shimmer
- Multiple competing indicators
- Over-explaining normal loading delays
- Fake progress percentages

---

### 5.3 Scope Awareness

A page-level load and a small inline load are not the same. `LoadingState` must support different scopes cleanly without changing its semantic meaning.

---

## 6. Loading Modes

`LoadingState` supports the following modes:

| Mode       | When to use                                                         |
| ---------- | ------------------------------------------------------------------- |
| `skeleton` | The approximate final content structure is known                    |
| `spinner`  | Content is small, indeterminate, or doesn't justify skeleton layout |
| `mixed`    | Both structure and an explicit progress cue are useful              |

### 6.1 `skeleton`

| ✅ Use for    |
| ------------- |
| List rows     |
| Cards         |
| Detail fields |
| Tables        |
| Sections      |

### 6.2 `spinner`

| ✅ Use for                     |
| ------------------------------ |
| Tiny widgets                   |
| Inline async fragments         |
| Lightweight refresh indicators |

### 6.3 `mixed`

Use when both structure and explicit progress cue are useful. This should be used sparingly.

---

## 7. Variants

| Variant   | Meaning                       |
| --------- | ----------------------------- |
| `page`    | Full-page loading             |
| `section` | Subsection loading            |
| `card`    | Card or panel loading         |
| `inline`  | Small embedded loading state  |
| `overlay` | Loading over existing content |

Variants may affect sizing and density, but not the core structure.

---

## 8. Density

| Value         | Use for                                                 |
| ------------- | ------------------------------------------------------- |
| `comfortable` | Full pages, panels, detail surfaces, major list regions |
| `compact`     | Tabs, nested sections, small cards, inline fragments    |

---

## 9. Content Rules

### 9.1 Label

`label` is optional. When present, it must be short, neutral, and informative.

| ✅ Good             | ❌ Avoid              |
| ------------------- | --------------------- |
| Loading customers   | Please wait...        |
| Loading details     | Magic is happening    |
| Refreshing results  | Working hard for you  |
| Loading attachments | Almost there probably |

---

### 9.2 Description

`description` is optional. Use it only when it adds real clarity.

| ✅ Examples                       |
| --------------------------------- |
| This section is being refreshed.  |
| Related records are loading.      |
| Results will appear here shortly. |

Do not overuse descriptions.

---

## 10. Skeleton Guidance

When `mode = skeleton`, the skeleton structure should roughly match the intended surface.

| Surface        | Skeleton approximation        |
| -------------- | ----------------------------- |
| List           | Repeated line/block rows      |
| Detail section | Label/value placeholder pairs |
| Card grid      | Placeholder cards             |
| Panel          | Title plus lines              |
| Table          | Header and rows approximation |

Do not create skeletons that look unrelated to the final surface.

---

## 11. Overlay Usage

Use `overlay` only when:

- Existing content should remain visible
- A temporary blocking action is in progress
- Preserving context is more valuable than replacing the surface

Do not use overlays as the default loading pattern.

---

## 12. Accessibility

`LoadingState` must:

- Remain understandable without animation
- Avoid relying only on motion
- Expose meaningful text where helpful
- Not overwhelm assistive technologies
- Preserve semantic clarity for the user

If loading is long-running or ambiguous, a label is recommended.

---

## 13. Behavior

| Situation              | Recommended approach                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| **Initial loading**    | Content is not ready yet. A full surface loading state is acceptable.                                  |
| **Refresh loading**    | Surface already exists. Prefer preserving visible content with a lighter loading affordance.           |
| **Background loading** | A subtle inline or non-blocking indicator may be sufficient. Do not replace the full UI unnecessarily. |

---

## 14. Canonical Schema Shape

```ts
type LoadingStatePresentation = {
  variant?: 'page' | 'section' | 'card' | 'inline' | 'overlay';
  density?: 'comfortable' | 'compact';
  mode?: 'skeleton' | 'spinner' | 'mixed';
  label?: string;
  description?: string;
  skeleton?: {
    lines?: number;
    blocks?: number;
    avatar?: boolean;
  };
};
```

---

## 15. Field Semantics

### 15.1 `variant`

Defines the semantic display scope of the loading state.

### 15.2 `density`

Defines the visual spacing and compactness.

### 15.3 `mode`

Defines the rendering pattern: `skeleton`, `spinner`, or `mixed`.

### 15.4 `label`

Optional user-facing loading text.

### 15.5 `description`

Optional supplementary explanation.

### 15.6 `skeleton`

Optional skeleton configuration for placeholder rendering.

| Field    | Description                                                |
| -------- | ---------------------------------------------------------- |
| `lines`  | Approximate number of line placeholders                    |
| `blocks` | Approximate number of block placeholders                   |
| `avatar` | Whether an avatar/icon-like placeholder should be rendered |

> `skeleton` is only meaningful when `mode` supports placeholder structure.

---

## 16. Examples

### 16.1 List page loading

```yaml
variant: page
density: comfortable
mode: skeleton
label: Loading customers
skeleton:
  lines: 8
```

### 16.2 Detail section loading

```yaml
variant: section
density: comfortable
mode: skeleton
label: Loading details
skeleton:
  lines: 6
```

### 16.3 Small widget loading

```yaml
variant: card
density: compact
mode: spinner
```

### 16.4 Inline relation refresh

```yaml
variant: inline
density: compact
mode: spinner
label: Loading attachments
```

### 16.5 Overlay refresh

```yaml
variant: overlay
mode: mixed
label: Refreshing results
```

---

## 17. Governance

`LoadingState` is a foundational runtime primitive.

All asynchronous surfaces must converge toward this primitive instead of inventing ad hoc spinners, placeholder blocks, or inconsistent loading banners. Consistency is mandatory.

---

## 18. Implementation Notes

**Implementation should prefer:**

- Design-system-native skeletons and spinners
- Stable placeholder layout
- Low-noise motion
- Reuse across page, section, card, tab, and inline surfaces

**Implementation must avoid:**

- Custom one-off loading UIs
- Page-specific assumptions
- Backend-specific behavior
- Hardcoded business semantics

> `LoadingState` is generic and reusable by design.
