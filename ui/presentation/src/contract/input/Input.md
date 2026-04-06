# Input Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `Input` primitive for Micro OS.

`Input` is the canonical single-line text-like control primitive.

> It is not a field wrapper. It is not responsible for label/help/message layout. It is not a full form system. Those concerns belong to `FormField` and higher-order form orchestration.

---

## 1. Philosophy

`Input` exists to provide a consistent, accessible, and reusable single-line form control across the platform.

It should:

- Handle user text entry clearly and predictably
- Preserve native input semantics where possible
- Remain composable with `FormField`
- Support common text-like input use cases
- Avoid business-specific behavior

---

## 2. Usage

`Input` may be used for:

- Plain text
- Email
- Password
- Number
- Search
- URL
- Tel

**Examples:**

- First name
- Email address
- Invoice number
- Website URL
- Phone number
- Search query

`Input` should be the default primitive for single-line text-like entry.

---

## 3. Relationship with FormField

`FormField` is the structural wrapper. `Input` is the low-level interactive control.

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

### 3.2 `Input` responsibilities

`Input` owns:

- Native input semantics
- Value entry
- Keyboard interaction
- Focus behavior
- Disabled state
- Readonly state
- Invalid visual state
- Placeholder
- Leading/trailing adornments if supported
- Low-level accessibility attributes

Do not collapse these responsibilities together.

---

## 4. When to Use

**Use `Input` when:**

- The user must enter or edit a single-line value
- Native text-like input behavior is appropriate
- The value is fundamentally scalar and typed as a single control

**Do not use `Input` when:**

- Multi-line text is required
- A constrained selection is required
- Boolean semantics are required
- Grouped option semantics are required
- A dedicated date control exists and should be used
- Rich text is required

Those conditions should use their own canonical primitives.

---

## 5. Supported Input Modes

`Input` supports the following semantic modes:

| Mode       | Notes                    |
| ---------- | ------------------------ |
| `text`     | Default plain text entry |
| `email`    | Email address entry      |
| `password` | Masked secret entry      |
| `number`   | Numeric entry            |
| `search`   | Search query entry       |
| `url`      | URL entry                |
| `tel`      | Telephone number entry   |

These modes influence native behavior and expected affordances.

---

## 6. Visual Structure

```
Input
  ├── optional leading adornment
  ├── native input control
  ├── optional trailing adornment
  └── optional inline loading indicator
```

The visual structure must remain lightweight and predictable.

---

## 7. Core Principles

### 7.1 Native-first

Prefer native input behavior unless the design system or accessibility requirements require controlled enhancement. Do not replace standard semantics with artificial abstractions unnecessarily.

### 7.2 Composability

`Input` must compose cleanly inside `FormField`, dialogs, filters, inline editors, and dense admin layouts.

### 7.3 Predictability

`Input` should feel familiar and unsurprising.

Avoid:

- Hidden transformations
- Unexpected formatting while typing
- Aggressive masking
- Business-specific parsing logic
- Auto-submission behavior

### 7.4 Accessibility

`Input` must preserve accessible native semantics and predictable keyboard interaction.

---

## 8. States

| State      | Meaning                                         |
| ---------- | ----------------------------------------------- |
| `default`  | Normal idle state                               |
| `focused`  | Control has keyboard focus                      |
| `disabled` | User cannot interact with the control           |
| `readonly` | User can focus and read, but cannot modify      |
| `invalid`  | Visually and semantically marked as invalid     |
| `loading`  | Temporarily waiting on input-related async work |

### 8.1 `disabled`

The user cannot interact with the control.

### 8.2 `readonly`

The user can focus and read the value, but cannot modify it.

### 8.3 `invalid`

The control is visually and semantically marked as invalid. This state does not replace validation messaging owned by `FormField`.

### 8.4 `loading`

Optional low-level loading state for controls temporarily waiting on input-related async work.

> This must be used sparingly. `Input` must not invent full async workflows.

---

## 9. Content Rules

### 9.1 Placeholder

`placeholder` is optional. It should be short and helpful, and must not replace the field label.

| ❌ Avoid                             | ✅ Prefer        |
| ------------------------------------ | ---------------- |
| Enter your email address here please | name@example.com |

### 9.2 Value

`Input` supports standard scalar text-like values. The exact value representation should follow platform conventions and native input expectations.

For `number`, keep semantics aligned with the platform and repo conventions. Do not invent custom parsing rules inside the primitive.

---

## 10. Adornments

`Input` may support:

- `leadingIcon`
- `trailingIcon`
- `leadingText`
- `trailingText`

Only include adornments if they are part of the canonical UI pattern already used in the repo. Adornment support must remain decorative or assistive. Do not place critical validation messaging inside adornments.

| ✅ Examples                                          |
| ---------------------------------------------------- |
| Search icon                                          |
| Currency symbol                                      |
| Domain suffix                                        |
| Reveal-password affordance (if already standardized) |

---

## 11. Loading Semantics

If `loading` is supported, it must be lightweight and local.

Use cases may include:

- Inline async validation indicator
- Lookup in progress
- Small assistive state

**Do not:**

- Block the full form
- Replace the input with a page-level loader
- Imply submission progress unless that is truly what is happening

---

## 12. Accessibility

`Input` must:

- Preserve native input semantics
- Support keyboard interaction
- Expose disabled/readonly/invalid states accessibly
- Integrate with `FormField` ids and descriptions cleanly
- Not rely only on color to communicate invalid state
- Keep placeholder supplementary, never primary

If adornments are interactive, they must be accessible and keyboard reachable.

---

## 13. Behavior

`Input` is a presentational and interactive primitive.

It may expose standard input events according to repo conventions, such as value change, blur, and focus.

It must not own:

- Submission
- Domain validation rules
- Backend requests
- Business-specific formatting engines
- Router side effects

---

## 14. Canonical Schema Shape

```ts
type InputPresentation = {
  inputType?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel';
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  leadingText?: string;
  trailingText?: string;
};
```

---

## 15. Field Semantics

### 15.1 `inputType`

Defines the semantic native input type. Default is typically `text` unless repo conventions specify otherwise.

### 15.2 `value`

Controlled value.

### 15.3 `defaultValue`

Uncontrolled initial value, if supported by repo conventions.

### 15.4 `placeholder`

Optional hint text.

### 15.5 `disabled`

Disables interaction.

### 15.6 `readonly`

Makes the control non-editable while still focusable.

### 15.7 `required`

Marks the control as required.

> This does not replace structural required markers owned by `FormField`.

### 15.8 `invalid`

Marks the control as invalid.

### 15.9 `loading`

Optional inline loading state.

### 15.10 `name`

Native input name.

### 15.11 `id`

Native input id.

### 15.12 `leadingIcon` / `trailingIcon`

Optional icon adornments.

### 15.13 `leadingText` / `trailingText`

Optional text adornments.

---

## 16. Examples

### 16.1 Basic text input

```yaml
inputType: text
placeholder: Customer name
```

### 16.2 Email input

```yaml
inputType: email
placeholder: name@example.com
```

### 16.3 Search input

```yaml
inputType: search
leadingIcon: search
placeholder: Search customers
```

### 16.4 Currency-like input chrome

```yaml
inputType: number
leadingText: €
```

### 16.5 Readonly generated value

```yaml
inputType: text
value: INV-2026-001
readonly: true
```

---

## 17. Governance

`Input` is a foundational runtime primitive.

All single-line text-like controls should converge toward this primitive instead of inventing ad hoc custom inputs across pages and forms. Consistency is mandatory.

---

## 18. Implementation Notes

**Implementation should prefer:**

- Native input semantics
- Clean composition with `FormField`
- Accessible focus and invalid states
- Lightweight adornment handling
- Reuse across page forms, inline forms, filters, and dialogs

**Implementation must avoid:**

- Business-specific parsing
- Hidden transformations
- Custom one-off styling logic
- Backend-coupled behavior
- Over-engineered masking or formatting logic

> `Input` is generic and reusable by design.
