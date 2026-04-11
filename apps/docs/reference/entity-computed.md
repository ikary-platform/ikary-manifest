---
outline: deep
---

# Computed Fields

Computed fields derive their value from other fields on the same record. They are declared in the top-level `computed` array on an entity definition. The runtime calculates their values; they are never included in create or edit forms.

## Structure

```yaml
computed:
  - key: is_high_value
    name: High-Value Customer
    type: boolean
    formulaType: conditional
    condition: revenue > 100000
    then: "true"
    else: "false"
    dependencies:
      - revenue
```

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Field identifier, unique within the entity |
| `name` | `string` | Display name |
| `type` | `FieldType` | Value type: `string`, `number`, `boolean`, `date`, `datetime` |
| `formulaType` | `string` | Formula kind: `expression`, `conditional`, or `aggregation` |
| `dependencies` | `string[]?` | Keys of the fields this formula reads |

---

## Formula types

### `expression`

Evaluates a free-form expression over the record's fields.

```yaml
- key: full_name
  name: Full Name
  type: string
  formulaType: expression
  expression: "first_name + ' ' + last_name"
  dependencies:
    - first_name
    - last_name
```

| Field | Required | Description |
|-------|----------|-------------|
| `expression` | yes | Expression string evaluated at runtime |

### `conditional`

Returns one of two values depending on whether a condition is true.

```yaml
- key: tier_label
  name: Tier Label
  type: string
  formulaType: conditional
  condition: "tier == 'enterprise'"
  then: Enterprise
  else: Standard
  dependencies:
    - tier
```

| Field | Required | Description |
|-------|----------|-------------|
| `condition` | yes | Boolean expression to evaluate |
| `then` | yes | Value when the condition is true |
| `else` | yes | Value when the condition is false |

### `aggregation`

Computes a value from a related collection. Requires a relation to be defined on the entity.

```yaml
- key: open_invoice_count
  name: Open Invoices
  type: number
  formulaType: aggregation
  relation: invoices
  aggregation: count
  filter: "status != 'paid'"
  dependencies: []
```

| Field | Required | Description |
|-------|----------|-------------|
| `relation` | yes | Key of the `has_many` or `many_to_many` relation to aggregate |
| `aggregation` | yes | Aggregation function: `count`, `sum`, `avg`, `min`, `max` |
| `aggregationField` | for sum/avg/min/max | The field on the related entity to aggregate |
| `filter` | no | Filter expression applied before aggregating |

---

## Behavior

Computed fields are read-only. They do not appear in create or edit forms. The renderer excludes them from `deriveCreateFields` and `deriveEditFields`.

Computed values are recalculated by the backend whenever the record or its dependencies change. The frontend receives the computed value as part of the record payload.

`dependencies` is informational. Declaring it accurately lets the backend optimize recalculation — only recalculate when a dependency changes.
