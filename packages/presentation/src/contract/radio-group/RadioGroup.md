# RadioGroup Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `RadioGroup` primitive for Micro OS.

`RadioGroup` is the canonical single-choice grouped option primitive.

> It is not a field wrapper. It is not a dropdown/select. It is not a multi-select control. Those concerns belong to `FormField` and higher-order form orchestration.

---

## 1. Philosophy

`RadioGroup` exists to provide a consistent, accessible, and reusable way to choose exactly one option from a small, explicit set of visible choices.

It should:

- Represent a single choice clearly
- Preserve proper grouped radio semantics
- Remain composable with `FormField`
- Support predictable keyboard interaction
- Avoid business-specific behavior

---

## 2. Usage

`RadioGroup` may be used for:

- Small explicit choice sets
- Visible mutually exclusive options
- Binary or ternary choices where all options should stay visible
- Workflow mode choice
- Presentation mode selection
- Preference selection

**Examples:**

- Billing cycle: monthly / yearly
- Visibility: private / shared / public
- Priority: low / medium / high
- Delivery mode: email / SMS / none

`RadioGroup` should be used when the user must choose exactly one value from a small visible set.

---

## 3. Relationship with FormField

`FormField` is the structural wrapper. `RadioGroup` is the low-level interactive grouped control.

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

### 3.2 `RadioGroup` responsibilities

`RadioGroup` owns:

- Grouped radio semantics
- Option rendering
- Selected state rendering
- Keyboard interaction
- Focus behavior
- Disabled state
- Invalid visual state
- Low-level accessibility attributes

Do not collapse these responsibilities together.

---

## 4. When to Use

**Use `RadioGroup` when:**

- Exactly one value must be selected
- All options should stay visible
- The option set is relatively small
- Immediate comparison between choices is useful

**Do not use `RadioGroup` when:**

- The option set is large
- A compact dropdown is more appropriate
- Multiple selections are allowed
- The value is free text
- Checkbox semantics are required
- Switch/toggle semantics are required

Those conditions should use their own canonical primitives.

---

## 5. Group Semantics

`RadioGroup` is a group, not a collection of unrelated radios.

```
RadioGroup
  ├── group container
  ├── radio option
  ├── radio option
  └── radio option
```

The implementation must preserve the semantics of a single grouped choice. If the platform pattern uses `fieldset` and `legend`, that is preferred where appropriate. If the repo uses an accessibility-safe alternative, follow that consistently.

---

## 6. Core Principles

### 6.1 Visible choice

`RadioGroup` is for explicit visible comparison between options. It should not hide options behind a trigger surface like `Select`.

### 6.2 Predictability

`RadioGroup` should feel familiar and unsurprising.

Avoid:

- Hidden option mutation
- Business-specific rendering rules
- Decorative but unclear layouts
- Custom semantics that diverge from standard radio behavior

### 6.3 Composability

`RadioGroup` must compose cleanly inside `FormField`, dialogs, filters, settings panels, and dense admin forms.

### 6.4 Accessibility

`RadioGroup` must preserve accessible grouped radio semantics and predictable keyboard interaction.

---

## 7. States

| State      | Meaning                                          |
| ---------- | ------------------------------------------------ |
| `default`  | Normal idle state with no selection              |
| `selected` | Exactly one option is selected                   |
| `focused`  | An option has keyboard focus                     |
| `disabled` | The whole group or specific options are disabled |
| `invalid`  | Visually and semantically marked as invalid      |
| `loading`  | Temporarily waiting on option resolution         |

### 7.1 `selected`

Exactly one option is selected.

### 7.2 `disabled`

The whole group or specific options may be disabled.

### 7.3 `invalid`

The group is visually and semantically marked as invalid. This state does not replace validation messaging owned by `FormField`.

### 7.4 `loading`

Optional low-level loading state for temporary option resolution. This must be lightweight and local.

> `RadioGroup` must not invent full async workflows.

---

## 8. Option Model

`RadioGroup` options must be explicit.

```ts
type RadioOption = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
};
```

`value` is the canonical stored value. `label` is the human-readable display value. `description` is optional and should be used sparingly. Options must be stable and human-readable.

---

## 9. Layout

`RadioGroup` may support layout direction where canonical.

| Value        | When to use                                     |
| ------------ | ----------------------------------------------- |
| `vertical`   | Preferred default, especially for longer labels |
| `horizontal` | Acceptable for short labels with few options    |

Do not create many bespoke layout variants.

---

## 10. Accessibility

`RadioGroup` must:

- Preserve grouped radio semantics
- Support keyboard navigation between options
- Expose selected, disabled, and invalid states accessibly
- Integrate with `FormField` ids and descriptions cleanly
- Not rely only on color to communicate selected or invalid state

If descriptions are shown per option, they must remain clearly associated with the corresponding choice.

---

## 11. Behavior

`RadioGroup` is a presentational and interactive primitive.

It may expose standard selection events according to repo conventions, such as value change, blur, and focus.

It must not own:

- Business validation rules
- Backend requests
- Router side effects
- Domain-specific workflow logic

---

## 12. Canonical Schema Shape

```ts
type RadioOptionPresentation = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
};

type RadioGroupPresentation = {
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  direction?: 'vertical' | 'horizontal';
  options: RadioOptionPresentation[];
};
```

---

## 13. Field Semantics

### 13.1 `value`

Controlled selected value.

### 13.2 `defaultValue`

Uncontrolled initial selected value, if supported by repo conventions.

### 13.3 `disabled`

Disables the whole group interaction.

### 13.4 `required`

Marks the group as required.

> This does not replace structural required markers owned by `FormField`.

### 13.5 `invalid`

Marks the group as invalid.

### 13.6 `loading`

Optional local loading state.

### 13.7 `name`

Native radio group name.

### 13.8 `id`

Group id.

### 13.9 `direction`

Optional layout direction.

### 13.10 `options`

Required option list.

---

## 14. Option Semantics

### 14.1 `value`

Canonical selected/stored value.

### 14.2 `label`

Human-readable option label.

### 14.3 `disabled`

Marks the option as non-selectable.

### 14.4 `description`

Optional supporting text for the option. Use sparingly — it should clarify, not overload.

---

## 15. Examples

### 15.1 Billing cycle

```yaml
direction: horizontal
options:
  - value: monthly
    label: Monthly
  - value: yearly
    label: Yearly
```

### 15.2 Visibility mode

```yaml
direction: vertical
options:
  - value: private
    label: Private
  - value: shared
    label: Shared
  - value: public
    label: Public
```

### 15.3 Disabled option

```yaml
options:
  - value: basic
    label: Basic
  - value: enterprise
    label: Enterprise
    disabled: true
```

### 15.4 Option descriptions

```yaml
options:
  - value: email
    label: Email
    description: Send updates by email
  - value: sms
    label: SMS
    description: Send updates by text message
```

---

## 16. Governance

`RadioGroup` is a foundational runtime primitive.

All visible single-choice grouped controls should converge toward this primitive instead of inventing ad hoc custom radio groups across pages and forms. Consistency is mandatory.

---

## 17. Implementation Notes

**Implementation should prefer:**

- Accessible grouped radio behavior
- Clean composition with `FormField`
- Predictable option modeling
- Stable keyboard interaction
- Reuse across forms, filters, settings, and dialogs

**Implementation must avoid:**

- Select-like hidden menus
- Business-specific option logic
- Backend-coupled behavior
- One-off custom radio implementations
- Over-decorated layouts

> `RadioGroup` is generic and reusable by design.
