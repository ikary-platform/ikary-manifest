# Select Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `Select` primitive for Micro OS.

`Select` is the canonical constrained single-choice selection primitive.

> It is not a field wrapper. It is not responsible for label/help/message layout. It is not an autocomplete engine. It is not a multi-select control. Those concerns belong to `FormField` and higher-order form orchestration.

---

## 1. Philosophy

`Select` exists to provide a consistent, accessible, and reusable way to choose one value from a constrained list of options.

It should:

- Support clear single-choice selection
- Remain composable with `FormField`
- Preserve predictable selection semantics
- Stay lightweight and reusable
- Avoid business-specific behavior

---

## 2. Usage

`Select` may be used for:

- Enum-like choices
- Statuses
- Categories
- Country selection
- Role selection
- Constrained workflow options

**Examples:**

- Status
- Priority
- Country
- Department
- Invoice type
- Subscription plan

`Select` should be used when the user must choose exactly one value from a predefined option set.

---

## 3. Relationship with FormField

`FormField` is the structural wrapper. `Select` is the low-level interactive control.

### 3.1 `FormField` responsibilities

`FormField` owns:

- Label
- Legend
- Help text
- Tip text
- Validation message
- Required marker
- Field layout
- `aria-describedby` composition at field level

### 3.2 `Select` responsibilities

`Select` owns:

- Option rendering
- Selected value rendering
- Open/close interaction
- Keyboard navigation
- Disabled state
- Invalid visual state
- Placeholder rendering if supported
- Low-level accessibility attributes

Do not collapse these responsibilities together.

---

## 4. When to Use

**Use `Select` when:**

- The user must choose one value from a constrained set
- The available values are known and stable enough to render as options
- A single selected value is required

**Do not use `Select` when:**

- Free text entry is required
- Many selections are required
- A very large async search is required
- Grouped boolean semantics are required
- Radio presentation is more appropriate for very small visible choice sets
- Date-specific interaction is required

Those conditions should use their own canonical primitives.

---

## 5. Core Principles

### 5.1 Constrained choice

`Select` represents a bounded list of valid options. It must not behave like a free-form text input.

### 5.2 Predictability

`Select` should feel stable and unsurprising.

Avoid:

- Hidden option mutation
- Arbitrary business logic in rendering
- Over-decorated option rows
- Custom selection semantics that diverge from the rest of the system

### 5.3 Composability

`Select` must compose cleanly inside `FormField`, filters, dialogs, drawers, dense admin forms, and inline editing contexts where appropriate.

### 5.4 Accessibility

`Select` must preserve accessible single-choice semantics and predictable keyboard interaction.

---

## 6. Visual Structure

```
Select
  ├── trigger / current value surface
  ├── optional placeholder text
  ├── optional leading icon
  ├── optional trailing affordance
  └── option list / menu surface
```

The component must remain visually clear and enterprise-oriented.

---

## 7. States

| State           | Meaning                                     |
| --------------- | ------------------------------------------- |
| `default`       | Normal idle state                           |
| `open`          | Option list is visible                      |
| `focused`       | Control has keyboard focus                  |
| `disabled`      | User cannot interact with the control       |
| `invalid`       | Visually and semantically marked as invalid |
| `loading`       | Options are temporarily resolving           |
| `empty-options` | No selectable options are available         |

### 7.1 `disabled`

The user cannot interact with the control.

### 7.2 `invalid`

The control is visually and semantically marked as invalid. This state does not replace validation messaging owned by `FormField`.

### 7.3 `loading`

Optional low-level loading state for cases where options are temporarily resolving. This must be lightweight and local.

### 7.4 `empty-options`

No selectable options are available. This state should remain calm and informative.

---

## 8. Option Model

`Select` options must be explicit.

```ts
type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: string;
};
```

`value` is the canonical stored value. `label` is the human-readable display value. Options must be stable and human-readable.

---

## 9. Placeholder Semantics

`placeholder` is optional. It may be used when no value is selected and must not replace the field label.

| ✅ Examples       |
| ----------------- |
| Select a status   |
| Choose a country  |
| Select a category |

---

## 10. Loading Semantics

If `loading` is supported, it must be lightweight and local.

Use cases may include:

- Options loading
- Enum metadata resolving
- Small dependent selection resolution

**Do not:**

- Turn `Select` into a full async search engine
- Imply global form submission
- Block the full page
- Hide the distinction between no options and still loading

---

## 11. Empty Options Semantics

If the option list is empty, `Select` may display an empty message.

| ✅ Examples            |
| ---------------------- |
| No options available   |
| No statuses available  |
| No countries available |

This message should be simple and non-dramatic.

---

## 12. Accessibility

`Select` must:

- Support keyboard interaction
- Preserve accessible single-choice semantics
- Expose disabled and invalid states accessibly
- Integrate with `FormField` ids and descriptions cleanly
- Not rely only on color to communicate invalid state
- Keep placeholder supplementary, never primary

> If a non-native select primitive is used, it must still preserve accessible interaction patterns.

---

## 13. Behavior

`Select` is a presentational and interactive primitive.

It may expose standard selection events according to repo conventions, such as value change, open change, blur, and focus.

It must not own:

- Business validation rules
- Async search engines
- Backend requests
- Router side effects
- Domain-specific option derivation

---

## 14. Canonical Schema Shape

```ts
type SelectOptionPresentation = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: string;
};

type SelectPresentation = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  options: SelectOptionPresentation[];
  emptyMessage?: string;
  leadingIcon?: string;
};
```

---

## 15. Field Semantics

### 15.1 `value`

Controlled selected value.

### 15.2 `defaultValue`

Uncontrolled initial selected value, if supported by repo conventions.

### 15.3 `placeholder`

Optional text shown when no value is selected.

### 15.4 `disabled`

Disables interaction.

### 15.5 `required`

Marks the control as required.

> This does not replace structural required markers owned by `FormField`.

### 15.6 `invalid`

Marks the control as invalid.

### 15.7 `loading`

Optional local loading state.

### 15.8 `name`

Native/select-compatible field name where applicable.

### 15.9 `id`

Control id.

### 15.10 `options`

Required option list.

### 15.11 `emptyMessage`

Optional message shown when the list has no options.

### 15.12 `leadingIcon`

Optional icon in the trigger surface if supported by repo conventions.

---

## 16. Option Semantics

### 16.1 `value`

Canonical selected/stored value.

### 16.2 `label`

Human-readable option label.

### 16.3 `disabled`

Marks the option as non-selectable.

### 16.4 `description`

Optional secondary descriptive text. Use sparingly.

### 16.5 `icon`

Optional option icon. Use only if the platform already supports icons in selection surfaces cleanly.

---

## 17. Examples

### 17.1 Status selection

```yaml
placeholder: Select a status
options:
  - value: draft
    label: Draft
  - value: published
    label: Published
  - value: archived
    label: Archived
```

### 17.2 Country selection

```yaml
placeholder: Choose a country
options:
  - value: be
    label: Belgium
  - value: fr
    label: France
  - value: nl
    label: Netherlands
```

### 17.3 Disabled option

```yaml
options:
  - value: basic
    label: Basic
  - value: enterprise
    label: Enterprise
    disabled: true
```

### 17.4 Empty options

```yaml
options: []
emptyMessage: No options available
```

---

## 18. Governance

`Select` is a foundational runtime primitive.

All constrained single-choice selection controls should converge toward this primitive instead of inventing ad hoc custom dropdowns across pages and forms. Consistency is mandatory.

---

## 19. Implementation Notes

**Implementation should prefer:**

- Accessible select behavior
- Clean composition with `FormField`
- Predictable option modeling
- Stable keyboard interaction
- Reuse across forms, filters, dialogs, and inline editing where appropriate

**Implementation must avoid:**

- Free-text autocomplete masquerading as select
- Business-specific option logic
- Backend-coupled behavior
- Over-engineered visual treatments
- One-off dropdown implementations

> `Select` is generic and reusable by design.
