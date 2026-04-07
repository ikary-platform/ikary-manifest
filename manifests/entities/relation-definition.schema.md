# Relation Definition

Declares a relationship between two entities.
The `relation` field acts as a discriminator that determines which properties are valid.

## Responsibilities

- Links entities through foreign keys and join tables.
- Supports five relationship patterns: `belongs_to`, `has_many`, `many_to_many`, `self`, and `polymorphic`.
- Validates required properties per relation type through a discriminated union.

## Non-Goals

- Does not create database columns or migration scripts. The runtime handles storage.
- Does not enforce referential integrity at the schema level.

## Schema Surface

Defined in [`relation-definition.schema.yaml`](./relation-definition.schema.yaml).

## Validation Notes

### Common properties

| Field      | Type     | Required | Constraint                          |
|------------|----------|----------|-------------------------------------|
| `key`      | `string` | Yes      | Unique identifier for the relation  |
| `relation` | `enum`   | Yes      | Discriminator for the union         |

### Relation types

**belongs_to**

| Field        | Type      | Required |
|--------------|-----------|----------|
| `entity`     | `string`  | Yes      |
| `foreignKey` | `string`  | Yes      |
| `required`   | `boolean` | No       |

**has_many**

| Field        | Type     | Required |
|--------------|----------|----------|
| `entity`     | `string` | Yes      |
| `foreignKey` | `string` | Yes      |

**many_to_many**

| Field       | Type     | Required |
|-------------|----------|----------|
| `entity`    | `string` | Yes      |
| `through`   | `string` | Yes      |
| `sourceKey` | `string` | Yes      |
| `targetKey` | `string` | Yes      |

**self**

Represents self-referencing trees (e.g., a category that has a parent category).

| Field        | Type     | Required |
|--------------|----------|----------|
| `entity`     | `string` | Yes      |
| `foreignKey` | `string` | Yes      |

**polymorphic**

| Field        | Type     | Required |
|--------------|----------|----------|
| `entity`     | `string` | Yes      |
| `typeField`  | `string` | Yes      |
| `foreignKey` | `string` | Yes      |

## Example

```yaml
- key: customer
  relation: belongs_to
  entity: customer
  foreignKey: customerId
  required: true
```
