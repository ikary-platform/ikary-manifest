# Checkbox Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `Checkbox` primitive for Micro OS.

`Checkbox` is the canonical boolean selection primitive for checkbox semantics.

> It is not a field wrapper. It is not a toggle/switch. It is not responsible for label/help/message layout. Those concerns belong to `FormField` and higher-order form orchestration.

---

## 1. Philosophy

`Checkbox` exists to provide a consistent, accessible, and reusable boolean control across the platform.

It should:

- Represent a boolean yes/no choice clearly
- Preserve native checkbox semantics
- Remain composable with `FormField`
- Support predictable keyboard and pointer interaction
- Avoid business-specific behavior

---

## 2. Usage

`Checkbox` may be used for:

- Consent
- Acceptance
- Simple feature enablement
- Optional flags
- Boolean form values
- Checklist-style boolean items

**Examples:**

- Accept terms
- Send notification email
- Mark as internal
- Enable reminders
- Include archived records

`Checkbox` should be used when the meaning is a direct boolean choice.

---

## 3. Relationship with FormField

`FormField` is the structural wrapper. `Checkbox` is the low-level interactive control.

### 3.1 `FormField` responsibilities

`FormField` owns:

- Label
- Help text
- Tip text
- Validation message
- Required marker
- Field layout
- `aria-describedby` composition at field level

### 3.2 `Checkbox` responsibilities

`Checkbox` owns:

- Checkbox semantics
- Checked state rendering
- Keyboard interaction
- Focus behavior
- Disabled state
- Invalid visual state
- Low-level accessibility attributes

Do not collapse these responsibilities together.

---

## 4. Layout Note

`Checkbox` is the one canonical field family where inline control + label presentation is acceptable when it matches the design system and accessibility rules.

```
Checkbox
  ├── checkbox control
  └── inline label content
```

However, structural messages and help text still belong to `FormField`. Do not invent multiple checkbox layout paradigms.

---

## 5. When to Use

**Use `Checkbox` when:**

- The value is boolean
- The user may independently check or uncheck one item
- Switch semantics are not required
- A direct true/false choice is appropriate

**Do not use `Checkbox` when:**

- The control is a binary on/off system state better represented as a switch
- The user must choose one option among many
- A constrained single-choice set is required
- Tri-state semantics are required unless explicitly standardized in the repo

Those conditions should use their own canonical primitives.

---

## 6. Core Principles

### 6.1 Native-first

Prefer native checkbox semantics unless the design system requires an accessibility-safe wrapped implementation. Do not replace checkbox meaning with decorative abstractions.

### 6.2 Predictability

`Checkbox` should feel familiar and unsurprising.

Avoid:

- Hidden state transitions
- Business-specific side effects in the primitive
- Non-standard click targets that break usability
- Over-animated behavior

### 6.3 Composability

`Checkbox` must compose cleanly inside `FormField`, filters, dialogs, settings screens, tables, and dense admin layouts.

### 6.4 Accessibility

`Checkbox` must preserve accessible checkbox semantics and predictable keyboard interaction.

---

## 7. States

| State      | Meaning                                         |
| ---------- | ----------------------------------------------- |
| `default`  | Normal idle unchecked state                     |
| `checked`  | Boolean value is true                           |
| `focused`  | Control has keyboard focus                      |
| `disabled` | User cannot interact with the control           |
| `invalid`  | Visually and semantically marked as invalid     |
| `loading`  | Temporarily waiting on input-related async work |

### 7.1 `checked`

The boolean value is true.

### 7.2 `disabled`

The user cannot interact with the control.

### 7.3 `invalid`

The control is visually and semantically marked as invalid. This state does not replace validation messaging owned by `FormField`.

### 7.4 `loading`

Optional low-level loading state for temporary input-related async work. This must be lightweight and local.

> `Checkbox` must not invent full async workflows.

---

## 8. Label Semantics

`Checkbox` may support an inline label/content region adjacent to the control.

That label should:

- Be short and clear
- Describe the boolean choice
- Remain clickable if the implementation supports a label wrapper
- Not replace structural help or validation messaging

| ✅ Examples              |
| ------------------------ |
| Send me updates          |
| Include archived records |
| Mark as urgent           |

---

## 9. Accessibility

`Checkbox` must:

- Preserve checkbox semantics
- Support keyboard toggling
- Expose checked, disabled, and invalid states accessibly
- Integrate with `FormField` ids and descriptions cleanly
- Not rely only on color to communicate checked or invalid state

If label content is inline, it must remain programmatically associated with the checkbox.

---

## 10. Behavior

`Checkbox` is a presentational and interactive primitive.

It may expose standard boolean interaction events according to repo conventions, such as checked change, blur, and focus.

It must not own:

- Submission
- Domain validation rules
- Backend requests
- Business-specific workflows
- Router side effects

---

## 11. Canonical Schema Shape

```ts
type CheckboxPresentation = {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  label?: string;
};
```

---

## 12. Field Semantics

### 12.1 `checked`

Controlled checked state.

### 12.2 `defaultChecked`

Uncontrolled initial checked state, if supported by repo conventions.

### 12.3 `disabled`

Disables interaction.

### 12.4 `required`

Marks the control as required.

> This does not replace structural required markers owned by `FormField`.

### 12.5 `invalid`

Marks the control as invalid.

### 12.6 `loading`

Optional inline loading state.

### 12.7 `name`

Native checkbox name.

### 12.8 `id`

Native checkbox id.

### 12.9 `label`

Optional inline checkbox label.

> If the repo keeps labels exclusively in `FormField`, do not duplicate visible label rendering here. In that case, preserve the type only if needed for low-level composition patterns.

---

## 13. Examples

### 13.1 Basic checkbox

```yaml
label: Send notification email
```

### 13.2 Checked default

```yaml
label: Include archived records
defaultChecked: true
```

### 13.3 Disabled checkbox

```yaml
label: Enable enterprise sync
disabled: true
```

### 13.4 Controlled checkbox

```yaml
label: Mark as internal
checked: false
```

---

## 14. Governance

`Checkbox` is a foundational runtime primitive.

All checkbox-style boolean controls should converge toward this primitive instead of inventing ad hoc custom check controls across pages and forms. Consistency is mandatory.

---

## 15. Implementation Notes

**Implementation should prefer:**

- Native checkbox semantics
- Clean composition with `FormField`
- Accessible focus and invalid states
- Predictable label association
- Reuse across forms, filters, settings, and list controls

**Implementation must avoid:**

- Switch-like semantics disguised as checkbox
- Business-specific side effects
- Backend-coupled behavior
- One-off custom checkbox patterns
- Over-animated interaction

> `Checkbox` is generic and reusable by design.
