# Computed Field

Defines a derived field whose value the runtime calculates from other fields or relations.
The `formulaType` field acts as a discriminator that determines which properties are valid.

## Responsibilities

- Declares fields that derive their value at runtime instead of storing it.
- Supports three computation strategies: `expression`, `conditional`, and `aggregation`.
- Validates required properties per formula type through a discriminated union.

## Non-Goals

- Does not execute formulas. The runtime engine evaluates them.
- Does not validate expression syntax or check for circular dependencies.

## Schema Surface

Defined in [`computed-field.schema.yaml`](./computed-field.schema.yaml).

## Validation Notes

### Common properties

| Field         | Type     | Required | Constraint                                   |
|---------------|----------|----------|----------------------------------------------|
| `key`         | `string` | Yes      | Unique identifier for the field              |
| `name`        | `string` | Yes      | Display label                                |
| `type`        | `enum`   | Yes      | `string`, `number`, `boolean`, `date`        |
| `formulaType` | `enum`   | Yes      | Discriminator: `expression`, `conditional`, `aggregation` |

### Formula types

**expression**

Evaluates an arithmetic or string expression against the listed dependencies.

| Field          | Type    | Required |
|----------------|---------|----------|
| `expression`   | `string` | Yes     |
| `dependencies` | `array`  | Yes     |

**conditional**

Returns `then` or `else` based on a boolean condition.

| Field       | Type     | Required |
|-------------|----------|----------|
| `condition` | `string` | Yes      |
| `then`      | `string` | Yes      |
| `else`      | `string` | Yes      |

**aggregation**

Runs an aggregate operation across a related collection.

| Field       | Type     | Required | Constraint                              |
|-------------|----------|----------|-----------------------------------------|
| `relation`  | `string` | Yes      | References a relation key               |
| `operation` | `enum`   | Yes      | `sum`, `count`, `avg`, `min`, `max`     |
| `field`     | `string` | Yes      | Field to aggregate                      |

## Example

```yaml
- key: totalAmount
  name: Total Amount
  type: number
  formulaType: aggregation
  relation: lineItems
  operation: sum
  field: amount
```
