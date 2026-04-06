# Textarea Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `Textarea` primitive for Micro OS.

`Textarea` is the canonical multiline text input control.

> It is not a field wrapper. It is not rich text. It is not a content editor framework. Those concerns belong to `FormField` and higher-level form orchestration.

---

## 1. Philosophy

`Textarea` exists to provide a consistent and accessible multiline entry control.

It should:

- Support readable multiline input
- Preserve native text-area semantics
- Compose cleanly with `FormField`
- Stay lightweight and predictable
- Avoid business-specific behavior

---

## 2. Usage

`Textarea` may be used for:

- Notes
- Descriptions
- Internal comments
- Explanations
- Long-form plain text fields

**Examples:**

- Internal memo
- Resolution notes
- Summary description
- Contact remarks

`Textarea` should be used when input is plain text and naturally spans multiple lines.

---

## 3. Relationship with FormField

`FormField` is the structural wrapper. `Textarea` is the low-level interactive control.

### 3.1 `FormField` responsibilities

`FormField` owns:

- Label
- Help text
- Tip text
- Validation message
- Required marker
- Field layout
- `aria-describedby` composition at field level

### 3.2 `Textarea` responsibilities

`Textarea` owns:

- Native multiline input behavior
- Value entry/editing
- Focus behavior
- Disabled and readonly behavior
- Invalid visual state
- Placeholder display
- Low-level accessibility attributes

Do not collapse these responsibilities together.

---

## 4. Core Structure

```
Textarea
  └── native textarea control
```

The primitive should stay minimal and predictable.

---

## 5. Supported Properties

`Textarea` supports:

- `value?: string`
- `defaultValue?: string`
- `placeholder?: string`
- `rows?: number` (positive integer)
- `disabled?: boolean`
- `readonly?: boolean`
- `required?: boolean`
- `invalid?: boolean`
- `loading?: boolean`
- `name?: string`
- `id?: string`

---

## 6. Controlled vs Uncontrolled

`Textarea` supports controlled and uncontrolled usage:

- Controlled: `value`
- Uncontrolled: `defaultValue`

Constraint:

- `value` and `defaultValue` cannot both be set at the same time

---

## 7. Rows and Sizing

`rows` is optional and must be a positive integer when present.

`rows` should control baseline multiline height only. The primitive must not introduce heavy auto-layout behavior unless standardized elsewhere.

---

## 8. States

| State      | Meaning                               |
| ---------- | ------------------------------------- |
| `default`  | Normal idle state                     |
| `focused`  | Control has keyboard focus            |
| `disabled` | User cannot interact                  |
| `readonly` | User can read/focus but cannot modify |
| `invalid`  | Visually/semantically invalid         |
| `loading`  | Lightweight local async indication    |

`loading` is optional and must remain local to the control surface.

---

## 9. Placeholder Rules

`placeholder` is optional and must not replace a visible label.

Placeholder text should be brief and assistive.

---

## 10. Accessibility

`Textarea` must:

- Preserve native multiline semantics
- Keep keyboard behavior predictable
- Expose disabled/readonly/invalid states accessibly
- Integrate with `FormField` ids and description linkage
- Not rely only on color for invalid state

---

## 11. Behavior Boundaries

`Textarea` is a presentational and interaction primitive.

It must not own:

- Business validation rules
- Server orchestration
- Route behavior
- Domain-specific parsing or formatting frameworks

---

## 12. Canonical Schema Shape

```ts
type TextareaPresentation = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
};
```

---

## 13. Validation Expectations

Validation must enforce:

- `placeholder`, `name`, `id` are non-empty strings when provided
- `rows` is a positive integer when provided
- `value` and `defaultValue` are mutually exclusive

---

## 14. Non-Goals

`Textarea` must not become:

- A markdown editor
- A rich text editor
- A full document authoring component
- A form orchestration container

It remains the canonical multiline plain-text control.
