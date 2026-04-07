# Entity Definition

Declares a domain entity with its fields, relations, computed values, lifecycle, events, capabilities, policies, and validation rules.

## Responsibility Boundary

**Owns:** The entity envelope: key, name, plural name, and the shape of each top-level property (fields, relations, computed, lifecycle, events, capabilities, policies, fieldPolicies, validation, governance).

**Does not own:** Internal structure of fields, relations, computed fields, lifecycle, events, capabilities, policies, or validation. Each is validated by its own schema.

## Canonical Position

```
Cell Manifest
  └── Spec
       └── Entities[]
            └── Entity Definition (this)
                 ├── Fields[]
                 ├── Relations[]
                 ├── Computed Fields[]
                 ├── Lifecycle
                 ├── Events
                 ├── Capabilities[]
                 ├── Policies
                 ├── Field Policies
                 ├── Validation
                 └── Governance
```

## Schema Shape

```yaml
type: object
required: [key, name, pluralName, fields]
additionalProperties: false
```

## Fields

### `key`

| Key       | Value                      |
|-----------|----------------------------|
| Type      | `string`                   |
| Required  | Yes                        |
| Pattern   | `^[a-z][a-z0-9_]*$`       |

Snake-case identifier unique within a manifest.
Must start with a lowercase letter and contain only lowercase letters, digits, and underscores.

### `name`

| Key       | Value              |
|-----------|--------------------|
| Type      | `string`           |
| Required  | Yes                |
| Min Length | 1                  |

Singular human-readable name for the entity (e.g., "Customer").

### `pluralName`

| Key       | Value              |
|-----------|--------------------|
| Type      | `string`           |
| Required  | Yes                |
| Min Length | 1                  |

Plural human-readable name for the entity (e.g., "Customers").
Used in list views, breadcrumbs, and generated UI labels.

### `fields`

| Key       | Value                                       |
|-----------|---------------------------------------------|
| Type      | `array`                                     |
| Items     | `./field-definition.schema.yaml`            |
| Required  | Yes                                         |
| Min Items | 1                                           |

List of field definitions that make up the entity's data shape.
Every entity must declare at least one field.

### `relations`

| Key       | Value                                          |
|-----------|------------------------------------------------|
| Type      | `array`                                        |
| Items     | `./relation-definition.schema.yaml`            |
| Required  | No                                             |

List of relationships to other entities (e.g., belongs-to, has-many).

### `computed`

| Key       | Value                                       |
|-----------|---------------------------------------------|
| Type      | `array`                                     |
| Items     | `./computed-field.schema.yaml`              |
| Required  | No                                          |

List of derived fields calculated from other field values or relations.

### `lifecycle`

| Key       | Value                              |
|-----------|------------------------------------|
| Type      | `object`                           |
| Required  | No                                 |
| Ref       | `./lifecycle.schema.yaml`          |

State machine definition. Declares states and valid transitions for the entity.

### `events`

| Key       | Value                        |
|-----------|------------------------------|
| Type      | `object`                     |
| Required  | No                           |
| Ref       | `./event.schema.yaml`        |

Domain events the entity can emit during state changes or field updates.

### `capabilities`

| Key       | Value                                          |
|-----------|-------------------------------------------------|
| Type      | `array`                                        |
| Items     | `./capability-definition.schema.yaml`          |
| Required  | No                                             |

List of actions that users or roles can perform on this entity (e.g., create, update, archive).

### `policies`

| Key       | Value                                                       |
|-----------|-------------------------------------------------------------|
| Type      | `object`                                                    |
| Required  | No                                                          |
| Ref       | `./policy.schema.yaml#/definitions/EntityPoliciesDefinition`|

Entity-level access policies. Controls who can read, create, update, or delete records.

### `fieldPolicies`

| Key       | Value                                                        |
|-----------|--------------------------------------------------------------|
| Type      | `object`                                                     |
| Required  | No                                                           |
| Ref       | `./policy.schema.yaml#/definitions/FieldPoliciesDefinition`  |

Field-level access policies. Controls visibility and editability of individual fields per role.

### `validation`

| Key       | Value                                     |
|-----------|-------------------------------------------|
| Type      | `object`                                  |
| Required  | No                                        |
| Ref       | `./entity-validation.schema.yaml`         |

Cross-field and entity-level validation rules that run beyond individual field constraints.

### `governance`

| Key       | Value              |
|-----------|--------------------|
| Type      | `object`           |
| Required  | No                 |

Controls audit tier and rollback behavior for the entity.

**Sub-properties:**

| Property            | Type      | Required | Default  | Description |
|---------------------|-----------|----------|----------|-------------|
| `tier`              | `string`  | No       | `tier-2` | Governance tier. One of `tier-1`, `tier-2`, `tier-3`. Higher tiers enforce stricter audit trails. |
| `rollbackEnabled`   | `boolean` | No       | `true`   | Whether records of this entity support rollback to a previous state. |
| `maxRollbackDepth`  | `integer` | No       |          | Maximum number of historical versions kept for rollback. Must be at least 1. |

## Child Schema References

| Property        | Schema File                                                  |
|-----------------|--------------------------------------------------------------|
| `fields[]`      | `./field-definition.schema.yaml`                             |
| `relations[]`   | `./relation-definition.schema.yaml`                          |
| `computed[]`    | `./computed-field.schema.yaml`                               |
| `lifecycle`     | `./lifecycle.schema.yaml`                                    |
| `events`        | `./event.schema.yaml`                                        |
| `capabilities[]`| `./capability-definition.schema.yaml`                        |
| `policies`      | `./policy.schema.yaml#/definitions/EntityPoliciesDefinition` |
| `fieldPolicies` | `./policy.schema.yaml#/definitions/FieldPoliciesDefinition`  |
| `validation`    | `./entity-validation.schema.yaml`                            |

## Semantic Invariants

- `key`, `name`, `pluralName`, and `fields` are required.
- `fields` must contain at least one item.
- `key` follows the pattern `^[a-z][a-z0-9_]*$`. Uppercase letters, hyphens, and leading digits are invalid.
- `additionalProperties` is `false`. No extra keys are allowed at the entity level.
- `governance.tier` defaults to `tier-2` when omitted.
- `governance.rollbackEnabled` defaults to `true` when omitted.
- `governance.maxRollbackDepth` must be a positive integer (minimum 1) when specified.

## Minimal YAML Example

```yaml
key: customer
name: Customer
pluralName: Customers
fields:
  - key: name
    type: string
    label: Full Name
    required: true
```

## Rich YAML Example

```yaml
key: invoice
name: Invoice
pluralName: Invoices
fields:
  - key: number
    type: string
    label: Invoice Number
    required: true
  - key: amount
    type: number
    label: Amount
    required: true
  - key: issued_at
    type: date
    label: Issue Date
    required: true
  - key: status
    type: string
    label: Status
relations:
  - key: customer
    type: belongs-to
    target: customer
    required: true
computed:
  - key: total_with_tax
    label: Total with Tax
    expression: "amount * 1.2"
lifecycle:
  initialState: draft
  states:
    - key: draft
    - key: sent
    - key: paid
    - key: cancelled
  transitions:
    - from: draft
      to: sent
    - from: sent
      to: paid
    - from: sent
      to: cancelled
capabilities:
  - key: create
    label: Create Invoice
  - key: send
    label: Send Invoice
  - key: mark-paid
    label: Mark as Paid
policies:
  read:
    - roles: [admin, sales]
  create:
    - roles: [admin]
fieldPolicies:
  amount:
    edit:
      - roles: [admin]
validation:
  rules:
    - expression: "amount > 0"
      message: "Amount must be positive"
governance:
  tier: tier-1
  rollbackEnabled: true
  maxRollbackDepth: 10
```

## Forbidden Patterns

| Pattern | Why |
|---------|-----|
| Missing `fields` or empty `fields` array | At least one field is required (`minItems: 1`). |
| `key` with uppercase letters or hyphens | Pattern enforces `^[a-z][a-z0-9_]*$`. Use snake_case. |
| `key` starting with a digit | Pattern requires the first character to be a lowercase letter. |
| Extra top-level properties | `additionalProperties: false` rejects them. |
| `governance.maxRollbackDepth` set to 0 or negative | Minimum value is 1. |
| `governance.tier` set to an unlisted value | Must be one of `tier-1`, `tier-2`, `tier-3`. |
