# FieldDefinition

Defines a single field on an entity. Supports nested object fields through a recursive `fields` property. The runtime enforces a maximum nesting depth of 3 levels.

## Responsibility Boundary

**Owns:**

- The shape, type, and metadata of one field within an entity.
- Operation-level display overrides (list, form, create, edit).
- Recursive nesting for fields of type `object`.

**Does not own:**

- How the field renders in the UI (delegated to `display.schema.yaml`).
- Validation rules applied to the field (delegated to `field-validation.schema.yaml`).
- The entity that contains this field.

## Canonical Position

```
Entity Definition
  └── Fields[] (this)
       ├── Display         → display.schema.yaml
       ├── Validation      → field-validation.schema.yaml
       └── Fields[]        → recursive self-reference
```

## Schema Shape

```yaml
key:         string          # required
type:        enum             # required
name:        string          # required
enumValues:  string[]
system:      boolean
helpText:    string
smallTip:    string
readonly:    boolean
sensitive:   enum
list:        object
form:        object
create:      object
edit:        object
display:     $ref display.schema.yaml
validation:  $ref field-validation.schema.yaml
fields:      $ref "#"[]
```

## Field-by-Field Breakdown

### `key` (required)

- **Type:** `string`
- **Pattern:** `^[a-z][a-z0-9_]*$`

Snake-case identifier for this field. Must start with a lowercase letter. Only lowercase letters, digits, and underscores are allowed.

### `type` (required)

- **Type:** `string`
- **Enum:** `string`, `text`, `number`, `boolean`, `date`, `datetime`, `enum`, `object`

Determines the data type of this field. When set to `enum`, the `enumValues` property becomes required. When set to `object`, the `fields` property defines nested child fields.

### `name` (required)

- **Type:** `string`
- **minLength:** 1

Human-readable label for this field.

### `enumValues`

- **Type:** `array` of `string`

Lists the allowed values when `type` is `"enum"`. Required for enum fields. Ignored for all other types.

### `system`

- **Type:** `boolean`

Marks this field as system-managed. System fields are typically not editable by end users.

### `helpText`

- **Type:** `string`

Longer descriptive text displayed alongside the field in forms.

### `smallTip`

- **Type:** `string`

Short inline hint shown near the field input.

### `readonly`

- **Type:** `boolean`

Prevents editing of this field in forms when set to `true`.

### `sensitive`

- **Type:** `string`
- **Enum:** `pii`, `secret`, `credential`, `token`, `binary-reference`

Classifies the sensitivity level of the field data. The runtime uses this to apply masking, access control, or audit logging.

### `list`

- **Type:** `object`
- **Properties:**
  - `visible` (`boolean`): Show or hide the field in list views.
  - `sortable` (`boolean`): Allow sorting by this field.
  - `searchable` (`boolean`): Include this field in search queries.
  - `filterable` (`boolean`): Allow filtering by this field.

Controls how the field behaves in entity list views.

### `form`

- **Type:** `object`
- **Properties:**
  - `visible` (`boolean`): Show or hide the field in forms.
  - `placeholder` (`string`): Placeholder text for the input.

Controls default form behavior for this field.

### `create`

- **Type:** `object`
- **Properties:**
  - `visible` (`boolean`): Show or hide the field on the create form.
  - `order` (`number`): Position of this field on the create form.
  - `placeholder` (`string`): Placeholder text for the input.

Overrides form behavior specifically on the entity creation view.

### `edit`

- **Type:** `object`
- **Properties:**
  - `visible` (`boolean`): Show or hide the field on the edit form.
  - `order` (`number`): Position of this field on the edit form.
  - `placeholder` (`string`): Placeholder text for the input.

Overrides form behavior specifically on the entity edit view.

### `display`

- **$ref:** `display.schema.yaml`

Controls how the field value renders in list and detail views. See [display.schema.yaml](./display.schema.yaml).

### `validation`

- **$ref:** `field-validation.schema.yaml`

Attaches validation rules to this field. See [field-validation.schema.yaml](./field-validation.schema.yaml).

### `fields`

- **Type:** `array` of `$ref "#"`

Defines nested child fields when `type` is `"object"`. Each child follows the same FieldDefinition schema. The runtime enforces a maximum depth of 3 levels.

## Child Schema References

| Property     | Schema                       |
|-------------|------------------------------|
| `display`   | `display.schema.yaml`        |
| `validation` | `field-validation.schema.yaml` |
| `fields[]`  | `field-definition.schema.yaml` (self) |

## Semantic Invariants

- `enumValues` must be present when `type` is `"enum"`.
- `fields` is only meaningful when `type` is `"object"`.
- Recursive nesting through `fields` must not exceed 3 levels. The runtime enforces this limit.
- `key` must be unique among sibling fields at the same nesting level.
- Operation overrides (`list`, `form`, `create`, `edit`) merge with defaults at runtime. Missing properties inherit the default behavior.

## Minimal YAML Example

```yaml
key: email
type: string
name: Email Address
```

## Rich YAML Example

```yaml
key: address
type: object
name: Mailing Address
helpText: Full mailing address for the contact.
sensitive: pii
readonly: false

list:
  visible: false

form:
  visible: true

create:
  visible: true
  order: 5

edit:
  visible: true
  order: 5

validation:
  fieldRules:
    - rule: required
      message: Address is required.

fields:
  - key: street
    type: string
    name: Street
    form:
      placeholder: "123 Main St"

  - key: city
    type: string
    name: City

  - key: state
    type: string
    name: State

  - key: zip
    type: string
    name: ZIP Code
    validation:
      fieldRules:
        - rule: pattern
          value: "^[0-9]{5}$"
          message: ZIP code must be 5 digits.
```

## Forbidden Patterns

**Do not use `enumValues` on non-enum types.**
The schema does not enforce this at the JSON Schema level, but the runtime ignores `enumValues` when `type` is not `"enum"`.

**Do not nest `object` fields beyond 3 levels.**
The schema allows unlimited recursion through `$ref "#"`. The runtime rejects manifests that exceed 3 levels of nesting.

**Do not combine `readonly: true` with `create.visible: true` expecting editable input.**
A readonly field remains non-editable regardless of operation-level visibility overrides.
