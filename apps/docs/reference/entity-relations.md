---
outline: deep
---

# Relationships

Relations declare how one entity is connected to another. They are declared in the top-level `relations` array on an entity definition. The runtime uses relations to generate API join logic, navigation links, and aggregation targets for computed fields.

## Structure

```yaml
relations:
  - key: company
    relation: belongs_to
    entity: company
    foreignKey: company_id
    required: true
  - key: invoices
    relation: has_many
    entity: invoice
    foreignKey: customer_id
```

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Identifier for this relation on the entity |
| `relation` | `RelationType` | One of five types (see below) |
| `entity` | `string` | Key of the related entity |
| `foreignKey` | `string?` | The column that holds the foreign key |
| `required` | `boolean?` | Whether the relation is required (applies to `belongs_to`) |
| `through` | `string?` | Join table entity key (applies to `has_many_through` and `many_to_many`) |

---

## Relation types

### `belongs_to`

This entity holds the foreign key. The relation represents a single parent record.

```yaml
- key: company
  relation: belongs_to
  entity: company
  foreignKey: company_id
  required: true
```

Set `required: true` when a record cannot exist without the parent. The API will reject creates and updates that omit the foreign key.

### `has_one`

The related entity holds the foreign key pointing back to this entity. The relation represents a single child record.

```yaml
- key: billing_profile
  relation: has_one
  entity: billing_profile
  foreignKey: customer_id
```

### `has_many`

The related entity holds the foreign key. The relation represents a collection of child records.

```yaml
- key: invoices
  relation: has_many
  entity: invoice
  foreignKey: customer_id
```

### `has_many_through`

The relation passes through a join entity. Use this when the join table itself carries data.

```yaml
- key: projects
  relation: has_many_through
  entity: project
  through: project_membership
  foreignKey: member_id
```

### `many_to_many`

A pure join. The runtime manages the join table automatically. Use this when the join table carries no data of its own.

```yaml
- key: tags
  relation: many_to_many
  entity: tag
  through: customer_tags
```

---

## API shape

The runtime generates standard REST endpoints for each entity. Relations affect the API in these ways:

- **`belongs_to`**: the foreign key column appears in the entity's create and update payloads.
- **`has_many` / `has_one`**: the related collection or record is accessible via a nested endpoint (`/customers/:id/invoices`).
- **`has_many_through` / `many_to_many`**: the runtime generates endpoints to add and remove members of the relation.

---

## Aggregations

Computed fields with `formulaType: aggregation` reference a `has_many` or `many_to_many` relation by key. See [Computed Fields](./entity-computed) for details.
