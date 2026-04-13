# Toggle Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `Toggle` primitive for Micro OS.

`Toggle` is the canonical switch-style boolean control for explicit on/off system state semantics.

> It is not a field wrapper. It is not a checkbox. It is not responsible for label/help/message layout. Those concerns belong to `FormField` and higher-order form orchestration.

---

## 1. Philosophy

`Toggle` exists to provide a consistent, accessible, and reusable switch-style boolean control across the platform.

It should:

- Represent an explicit on/off state clearly
- Preserve predictable switch semantics
- Remain composable with `FormField`
- Support accessible keyboard and pointer interaction
- Avoid business-specific behavior

---

## 2. Usage

`Toggle` may be used for:

- Feature enablement
- System state switching
- Preference activation
- Settings on/off behavior
- Binary activation controls

**Examples:**

- Enable notifications
- Turn on audit logging
- Activate public access
- Enable automatic sync
- Allow guest checkout

`Toggle` should be used when the boolean meaning is best understood as an explicit on/off system state.

---

## 3. Relationship with FormField

`FormField` is the structural wrapper. `Toggle` is the low-level interactive control.

### 3.1 `FormField` responsibilities

`FormField` owns:

- Label
- Help text
- Tip text
- Validation message
- Required marker
- Field layout
- `aria-describedby` composition at field level

### 3.2 `Toggle` responsibilities

`Toggle` owns:

- Switch semantics
- Checked/on state rendering
- Keyboard interaction
- Focus behavior
- Disabled state
- Invalid visual state if canonical
- Low-level accessibility attributes

Do not collapse these responsibilities together.

---

## 4. Toggle vs Checkbox

`Toggle` and `Checkbox` are not interchangeable.

| Use `Toggle` when the meaning is | Use `Checkbox` when the meaning is |
| -------------------------------- | ---------------------------------- |
| On / off                         | Select / do not select             |
| Enabled / disabled               | Include / exclude                  |
| Active / inactive                | Accept / do not accept             |
| System state change              | Mark / unmark                      |

Do not conflate these semantics.

---

## 5. When to Use

**Use `Toggle` when:**

- The value is boolean
- The control represents a system or preference state
- Switch semantics are clearer than checkbox semantics
- Immediate state interpretation matters

**Do not use `Toggle` when:**

- The control is better expressed as a checkbox
- The user must choose one option among many
- A constrained single-choice set is required
- Tri-state semantics are required unless explicitly standardized in the repo

Those conditions should use their own canonical primitives.

---

## 6. Visual Structure

```
Toggle
  ├── optional inline label content
  └── switch control
```

Typical presentation places the label on one side and the switch on the other. However, structural help text and validation messaging still belong to `FormField`. Do not invent many bespoke toggle layouts.

---

## 7. Core Principles

### 7.1 State clarity

`Toggle` should communicate on/off state instantly and clearly. The control must make current state easy to understand at a glance.

### 7.2 Predictability

`Toggle` should feel familiar and unsurprising.

Avoid:

- Hidden side effects in the primitive
- Decorative but ambiguous visuals
- Non-standard interaction patterns
- Over-animated state transitions

### 7.3 Composability

`Toggle` must compose cleanly inside `FormField`, settings pages, dialogs, drawers, cards, and dense admin layouts.

### 7.4 Accessibility

`Toggle` must preserve accessible switch semantics and predictable keyboard interaction.

---

## 8. States

| State      | Meaning                                         |
| ---------- | ----------------------------------------------- |
| `default`  | Normal idle unchecked state                     |
| `checked`  | Boolean value is true / on                      |
| `focused`  | Control has keyboard focus                      |
| `disabled` | User cannot interact with the control           |
| `invalid`  | Visually and semantically marked as invalid     |
| `loading`  | Temporarily waiting on input-related async work |

### 8.1 `checked`

The boolean value is true / on.

### 8.2 `disabled`

The user cannot interact with the control.

### 8.3 `invalid`

The control is visually and semantically marked as invalid, if the design system supports this state for toggles. This state does not replace validation messaging owned by `FormField`.

### 8.4 `loading`

Optional low-level loading state for temporary input-related async work. This must be lightweight and local.

> `Toggle` must not invent full async workflows.

---

## 9. Label Semantics

`Toggle` may support an inline label/content region adjacent to the control.

That label should:

- Be short and clear
- Describe the on/off behavior
- Remain associated with the switch semantically
- Not replace structural help or validation messaging

| ✅ Examples              |
| ------------------------ |
| Enable notifications     |
| Activate customer portal |
| Allow public sharing     |

---

## 10. Accessibility

`Toggle` must:

- Preserve switch semantics
- Support keyboard toggling
- Expose checked, disabled, and invalid states accessibly
- Integrate with `FormField` ids and descriptions cleanly
- Not rely only on color to communicate state

If label content is inline, it must remain programmatically associated with the toggle.

---

## 11. Behavior

`Toggle` is a presentational and interactive primitive.

It may expose standard boolean interaction events according to repo conventions, such as checked change, blur, and focus.

It must not own:

- Submission
- Domain validation rules
- Backend requests
- Business-specific workflows
- Router side effects

---

## 12. Canonical Schema Shape

```ts
type TogglePresentation = {
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

## 13. Field Semantics

### 13.1 `checked`

Controlled checked state.

### 13.2 `defaultChecked`

Uncontrolled initial checked state, if supported by repo conventions.

### 13.3 `disabled`

Disables interaction.

### 13.4 `required`

Marks the control as required.

> This does not replace structural required markers owned by `FormField`.

### 13.5 `invalid`

Marks the control as invalid.

### 13.6 `loading`

Optional inline loading state.

### 13.7 `name`

Native switch-compatible field name where applicable.

### 13.8 `id`

Control id.

### 13.9 `label`

Optional inline label.

> If the repo keeps labels exclusively in `FormField`, do not duplicate visible label rendering here. In that case, preserve the type only if needed for low-level composition patterns.

---

## 14. Examples

### 14.1 Basic toggle

```yaml
label: Enable notifications
```

### 14.2 Default on

```yaml
label: Activate customer portal
defaultChecked: true
```

### 14.3 Disabled toggle

```yaml
label: Enable enterprise sync
disabled: true
```

### 14.4 Controlled toggle

```yaml
label: Allow guest checkout
checked: false
```

---

## 15. Governance

`Toggle` is a foundational runtime primitive.

All switch-style boolean controls should converge toward this primitive instead of inventing ad hoc custom switches across pages and forms. Consistency is mandatory.

---

## 16. Implementation Notes

**Implementation should prefer:**

- Accessible switch semantics
- Clean composition with `FormField`
- Predictable state rendering
- Accessible focus and invalid states
- Reuse across settings, forms, cards, and dialogs

**Implementation must avoid:**

- Checkbox semantics disguised as toggle
- Business-specific side effects
- Backend-coupled behavior
- One-off custom switch patterns
- Over-animated interaction

> `Toggle` is generic and reusable by design.
