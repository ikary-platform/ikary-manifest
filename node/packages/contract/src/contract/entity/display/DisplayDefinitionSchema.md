# Display Definition Contract

**Version:** 1.0  
**Scope:** ikary-display  
**Audience:** Humans  
**Status:** Canonical

---

This document explains the purpose, scope, and meaning of the `DisplayDefinitionSchema` used in IKARY.

---

## 1. Purpose

A **Display Definition** describes **how a field value should appear in the UI**.

Think:

- the field type tells us what the data **is**
- the display definition tells us how the data should **look**

A Display Definition is the canonical UI intent contract for one field.

It is usually attached to a field under `field.display`.

---

## 2. Why it exists

Display Definition exists so that IKARY can separate data meaning from UI presentation.

Without this separation, the same field might be rendered differently in different places, which causes drift and inconsistency. For example, a number might sometimes be shown as a raw number, sometimes as currency, sometimes as a percentage.

Display Definition removes that ambiguity.

---

## 3. What it owns

A Display Definition owns:

- display type
- empty value label
- truncation behavior
- tooltip preference
- alignment
- numeric display metadata
- identity/link display metadata
- status/badge visual mapping
- collection-style display metadata
- custom renderer references

---

## 4. What it does not own

A Display Definition does not own:

- field identity
- field type meaning
- validation rules
- form input behavior
- page layout
- renderer implementation
- query state
- execution logic

Those belong to FieldDefinition, validation contracts, form contracts, page contracts, or field renderers.

---

## 5. Canonical schema shape

```typescript
type DisplayDefinition = {
  type:
    | 'text'
    | 'multiline-text'
    | 'number'
    | 'currency'
    | 'percentage'
    | 'date'
    | 'datetime'
    | 'boolean'
    | 'status'
    | 'badge'
    | 'email'
    | 'phone'
    | 'url'
    | 'entity-link'
    | 'user'
    | 'avatar-name'
    | 'tags'
    | 'progress'
    | 'json-preview'
    | 'actions'
    | 'custom';

  emptyLabel?: string;
  truncate?: boolean;
  tooltip?: boolean;
  align?: 'left' | 'center' | 'right';

  currency?: string;
  precision?: number;

  labelField?: string;
  subtitleField?: string;
  route?: string;

  badgeToneMap?: Record<string, string>;
  statusMap?: Record<string, string>;

  maxItems?: number;
  showOverflowCount?: boolean;

  rendererKey?: string;
};
```

---

## 6. Core property

### 6.1 type

`type` is mandatory. It tells IKARY which renderer family should be used.

Allowed values: `text`, `multiline-text`, `number`, `currency`, `percentage`, `date`, `datetime`, `boolean`, `status`, `badge`, `email`, `phone`, `url`, `entity-link`, `user`, `avatar-name`, `tags`, `progress`, `json-preview`, `actions`, `custom`.

This is the most important property in the display definition.

---

## 7. Common display options

These options can apply to many display types.

### 7.1 emptyLabel

Text used when the value is empty.

```json
{ "type": "text", "emptyLabel": "No description" }
```

If not provided, the renderer may fall back to a platform default such as `—`.

### 7.2 truncate

Whether the rendered value should truncate visually. Often useful in list or table contexts.

```json
{ "type": "text", "truncate": true }
```

### 7.3 tooltip

Whether a tooltip may be shown for the value. Commonly used when truncation is enabled.

```json
{ "type": "text", "truncate": true, "tooltip": true }
```

### 7.4 align

Preferred visual alignment. Allowed values: `left`, `center`, `right`.

```json
{ "type": "currency", "align": "right" }
```

---

## 8. Numeric formatting

These properties apply to numeric-like display types.

### 8.1 currency

Only allowed when `type = "currency"`.

```json
{ "type": "currency", "currency": "EUR" }
```

### 8.2 precision

Controls decimal precision. Only allowed for `number`, `currency`, `percentage`, `progress`.

```json
{ "type": "percentage", "precision": 1 }
```

---

## 9. Identity and link display

These properties are used when the field is rendered as a relation, identity, or link-like display.

### 9.1 labelField

Defines the primary label field. Only allowed for `entity-link`, `user`, `avatar-name`.

```json
{ "type": "entity-link", "labelField": "name" }
```

### 9.2 subtitleField

Defines a secondary label. Only allowed for `entity-link`, `user`, `avatar-name`.

```json
{ "type": "user", "labelField": "fullName", "subtitleField": "email" }
```

### 9.3 route

Defines a navigation or link target. Only allowed for `entity-link`, `url`, `email`, `phone`.

```json
{ "type": "entity-link", "labelField": "name", "route": "/customers/:id" }
```

---

## 10. Status and badge mapping

### 10.1 statusMap

Only allowed when `type = "status"`. Maps values to platform status tones.

```json
{
  "type": "status",
  "statusMap": { "active": "success", "pending": "warning", "failed": "destructive" }
}
```

### 10.2 badgeToneMap

Only allowed when `type = "badge"`. Maps values to badge tones.

```json
{
  "type": "badge",
  "badgeToneMap": { "enterprise": "primary", "startup": "secondary" }
}
```

---

## 11. Collection-like display metadata

### 11.1 maxItems

Only allowed for `tags` and `json-preview`. Limits how many items are shown before collapsing.

```json
{ "type": "tags", "maxItems": 3 }
```

### 11.2 showOverflowCount

Only allowed when `type = "tags"`. Shows how many extra items exist beyond the visible ones.

```json
{ "type": "tags", "maxItems": 2, "showOverflowCount": true }
```

---

## 12. Custom renderer escape hatch

`rendererKey` is only allowed when `type = "custom"`. Points to a registered custom renderer.

```json
{ "type": "custom", "rendererKey": "invoice-balance-summary" }
```

This should be used sparingly. Common use cases should prefer canonical display types.

---

## 13. Validation rules

### 13.1 Currency rule

`currency` is only valid when `type = "currency"`.

### 13.2 Precision rule

`precision` is only valid for `number`, `currency`, `percentage`, `progress`.

### 13.3 Identity field rules

`labelField` and `subtitleField` are only valid for `entity-link`, `user`, `avatar-name`.

### 13.4 Route rule

`route` is only valid for `entity-link`, `url`, `email`, `phone`.

### 13.5 Status / badge rules

`statusMap` only valid for `status`. `badgeToneMap` only valid for `badge`.

### 13.6 Tag rules

`maxItems` only valid for `tags` or `json-preview`. `showOverflowCount` only valid for `tags`.

### 13.7 Custom rule

`rendererKey` is required for `custom`. `rendererKey` is forbidden for non-custom.

---

## 14. Canonical interpretation

A Display Definition should be read like this:

- `type` = what visual renderer family to use
- common options = generic display behavior
- type-specific options = renderer-specific metadata
- schema refinements = prevent invalid combinations

In simple terms:

- Field Definition says what the value **is**
- Display Definition says how it should **look**
- Field Renderer actually **renders** it

---

## 15. Examples

### 15.1 Text

```json
{ "type": "text", "truncate": true, "tooltip": true }
```

### 15.2 Currency

```json
{ "type": "currency", "currency": "EUR", "precision": 2, "align": "right" }
```

### 15.3 Status

```json
{
  "type": "status",
  "statusMap": { "active": "success", "pending": "warning", "failed": "destructive" }
}
```

### 15.4 Entity link

```json
{ "type": "entity-link", "labelField": "name", "route": "/customers/:id" }
```

### 15.5 Tags

```json
{ "type": "tags", "maxItems": 3, "showOverflowCount": true }
```

### 15.6 Custom

```json
{ "type": "custom", "rendererKey": "invoice-balance-summary" }
```

---

## 16. Common mistakes

Do not:

- use display type as field type
- put validation logic inside display
- put page layout inside display
- use `currency` on non-currency fields
- use `route` on plain text displays
- use `rendererKey` unless `type = "custom"`

Bad:

```json
{ "type": "text", "currency": "EUR" }
```

Bad:

```json
{ "type": "status", "rendererKey": "custom-status" }
```

Correct:

```json
{ "type": "custom", "rendererKey": "custom-status" }
```

---

## 17. Relationship to other contracts

**Field Definition** contains the `display` block.

**Display Definition** declares UI intent.

**Field Renderers** consume the display definition and perform actual rendering.

**Page / List / Detail / Form** use field renderers downstream, but do not redefine display meaning.

---

## 18. Definition of Done

A Display Definition is good when:

- `type` is valid
- type-specific metadata is only used where allowed
- display intent is clear
- the field can be rendered consistently across surfaces
- the schema does not mix rendering intent with unrelated concerns

---

## 19. Canonical Summary

Display Definition is the canonical contract for how a field should look in the UI.

**It owns:**

- display type
- display options
- type-specific renderer metadata

**It does not own:**

- field meaning
- validation
- page layout
- renderer implementation
