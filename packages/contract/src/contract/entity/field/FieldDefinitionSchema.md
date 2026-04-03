# Field Definition Contract

**Version:** 1.0  
**Scope:** ikary-entity  
**Audience:** Humans  
**Status:** Canonical

---

This document explains the purpose, scope, and meaning of the `FieldDefinitionSchema` used in IKARY.

---

## 1. Purpose

A **Field Definition** describes one field inside an entity.

Think:

- an entity is made of fields
- each field has a name
- each field has a type
- each field may have validation
- each field may have display instructions
- each field may behave differently in list, form, create, or edit contexts

A Field Definition is the canonical contract for one field.

---

## 2. Why it exists

Field Definition exists so that IKARY can describe fields in a **single declarative place** instead of scattering field logic across database code, API code, React components, form code, list code, and validation code.

The goal is to let one field definition drive:

- structure
- validation
- display
- list behavior
- form behavior
- operation behavior

---

## 3. What it owns

A Field Definition owns:

- field identity
- field type
- field label
- enum values when applicable
- system / readonly metadata
- help text metadata
- list behavior metadata
- form behavior metadata
- create/edit operation metadata
- display metadata
- field-level validation
- nested child fields for object fields

---

## 4. What it does not own

A Field Definition does **not** own:

- page layout
- shell layout
- query state
- renderer implementation
- runtime execution
- entity-level validation
- authorization engine logic
- workflow execution

Those belong to other parts of the platform.

---

## 5. Canonical schema shape

```typescript
type FieldDefinitionNode = {
  key: string;
  type: 'string' | 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum' | 'object';
  name: string;
  enumValues?: string[];
  system?: boolean;
  helpText?: string;
  smallTip?: string;
  readonly?: boolean;
  list?: {
    visible?: boolean;
    sortable?: boolean;
    searchable?: boolean;
    filterable?: boolean;
  };
  form?: {
    visible?: boolean;
    placeholder?: string;
  };
  create?: {
    visible?: boolean;
    order?: number;
    placeholder?: string;
  };
  edit?: {
    visible?: boolean;
    order?: number;
    placeholder?: string;
  };
  display?: DisplayDefinition;
  validation?: FieldValidation;
  fields?: FieldDefinitionNode[];
};
```

---

## 6. Core properties

### 6.1 key

`key` is the stable machine-readable identifier of the field.

Examples: `name`, `status`, `createdAt`, `amount`.

Rules:

- required
- must be non-empty
- should be stable over time
- should be unique within the entity

### 6.2 type

`type` describes the field's data meaning. This is the domain type, not the UI display type.

Allowed values: `string`, `text`, `number`, `boolean`, `date`, `datetime`, `enum`, `object`.

Examples:

- `number` means the value is numeric
- `datetime` means the value is a date-time value
- `enum` means the value is one of a small set of allowed values
- `object` means the field contains nested fields

### 6.3 name

`name` is the human-readable label of the field.

Examples: `Name`, `Status`, `Created At`, `Amount`.

Rules:

- required
- must be non-empty
- should be suitable for UI labels

---

## 7. Optional core metadata

### 7.1 enumValues

Only relevant when `type = "enum"`. Lists the allowed values for the enum.

```json
"enumValues": ["draft", "active", "archived"]
```

### 7.2 system

Marks the field as platform-managed.

Typical examples: `id`, `createdAt`, `updatedAt`.

System fields are often excluded from create/edit forms automatically.

### 7.3 helpText

Longer helper copy for forms or studio usage. Use this when the user may need extra explanation.

### 7.4 smallTip

Short supporting hint. Use this for lightweight inline guidance.

### 7.5 readonly

Indicates that the field should not be editable in normal user flows.

Typical examples: computed values, system fields, immutable identifiers.

---

## 8. Surface behavior

A field may behave differently depending on where it appears.

### 8.1 list

Defines how the field behaves in list surfaces.

Supported metadata: `visible`, `sortable`, `searchable`, `filterable`.

```json
{ "visible": true, "sortable": true, "searchable": true }
```

### 8.2 form

Defines how the field behaves in form surfaces.

Supported metadata: `visible`, `placeholder`.

```json
{ "visible": true, "placeholder": "Enter customer name" }
```

---

## 9. Operation-specific behavior

A field may behave differently on create and edit.

### 9.1 create

Metadata specific to the create operation.

Supported metadata: `visible`, `order`, `placeholder`.

### 9.2 edit

Metadata specific to the edit operation.

Supported metadata: `visible`, `order`, `placeholder`.

This is useful when a field should be shown on create but hidden on edit, when field order differs by operation, or when a placeholder differs by operation.

---

## 10. Display metadata

`display` defines how the field should appear in the UI.

This is a child contract and must conform to `DisplayDefinitionSchema`.

Examples: show a number as currency, show a string as status, show a relation as a link, truncate long text in list view.

```json
{ "type": "currency", "currency": "EUR", "precision": 2 }
{ "type": "status" }
```

Important distinction: `type` tells us what the data is. `display.type` tells us how the data should look.

---

## 11. Validation metadata

`validation` defines field-level validation rules.

This is a child contract and must conform to `FieldValidationSchema`.

Use this for rules such as: required, min length, max length, regex, number min, number max, email, date format, future date.

Field-level validation belongs here. Entity-wide validation does not belong here.

---

## 12. Nested fields

`fields` is only meaningful when `type = "object"`. It allows nested field definitions.

```json
{
  "key": "address",
  "type": "object",
  "name": "Address",
  "fields": [
    { "key": "street", "type": "string", "name": "Street" },
    { "key": "city", "type": "string", "name": "City" }
  ]
}
```

This is how IKARY models structured sub-objects.

---

## 13. Canonical interpretation

A Field Definition should be read like this:

- `key` = machine identity
- `name` = human label
- `type` = data meaning
- `display` = UI intent
- `validation` = field truth constraints
- `list` / `form` / `create` / `edit` = surface behavior
- `fields` = nested object structure

---

## 14. Examples

### 14.1 Simple string field

```json
{ "key": "name", "type": "string", "name": "Name" }
```

### 14.2 Enum field

```json
{ "key": "status", "type": "enum", "name": "Status", "enumValues": ["draft", "active", "archived"] }
```

### 14.3 Currency-like numeric field

```json
{
  "key": "amount",
  "type": "number",
  "name": "Amount",
  "display": { "type": "currency", "currency": "EUR", "precision": 2 },
  "list": { "visible": true, "sortable": true }
}
```

### 14.4 Read-only system field

```json
{
  "key": "createdAt",
  "type": "datetime",
  "name": "Created At",
  "system": true,
  "readonly": true,
  "list": { "visible": true, "sortable": true }
}
```

### 14.5 Nested object field

```json
{
  "key": "address",
  "type": "object",
  "name": "Address",
  "fields": [
    { "key": "street", "type": "string", "name": "Street" },
    { "key": "city", "type": "string", "name": "City" }
  ]
}
```

---

## 15. Recommended rules

Even if not all are enforced yet in Zod, these are the intended semantic rules:

- `enumValues` should exist when `type = "enum"`
- `enumValues` should not exist when `type != "enum"`
- `fields` should exist when `type = "object"`
- `fields` should not exist when `type != "object"`
- field keys should be unique within the entity
- nested field keys should be unique within their object
- system fields are usually `readonly`
- object fields should not be treated as plain scalar values

---

## 16. Common mistakes

Do not:

- use `type` to describe display only
- put entity-level validation inside a field
- put page layout inside a field
- put renderer implementation inside a field
- define `enumValues` for non-enum fields
- define `fields` for non-object fields
- forget that `display` is separate from `type`

Bad example:

```json
{ "key": "amount", "type": "currency" }
```

Correct example:

```json
{
  "key": "amount",
  "type": "number",
  "display": { "type": "currency", "currency": "EUR" }
}
```

---

## 17. Relationship to other contracts

**Entity Definition** contains many field definitions.

**Display Definition** defines how this field should appear in UI.

**Field Validation** defines field-only validation rules.

**Field Renderers** consume display and actually render the field value.

---

## 18. Definition of Done

A Field Definition is good when:

- `key`, `type`, and `name` are correct
- optional metadata is used only when relevant
- `display` is separated from `type`
- `validation` is field-scoped
- list/form/create/edit behavior is explicit where needed
- nested fields are used only for object fields

---

## 19. Canonical Summary

Field Definition is the canonical contract for one field inside an entity.

**It owns:**

- field identity
- field type
- field label
- field metadata
- field display metadata
- field validation metadata
- field surface behavior
- nested object fields

**It does not own:**

- entity-wide validation
- page layout
- shell behavior
- renderer implementation
- runtime execution
