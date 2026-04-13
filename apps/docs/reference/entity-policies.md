---
outline: deep
---

# Policies & Permissions

Policies control who can read and write an entity and its fields. They are declared in the `policies` and `fieldPolicies` objects on an entity definition.

## Entity policies

`policies` sets access rules for the four standard operations.

```yaml
policies:
  view:   { scope: workspace }
  create: { scope: role, condition: finance:create }
  update: { scope: owner }
  delete: { scope: role, condition: admin:delete }
```

| Operation | Description |
|-----------|-------------|
| `view` | Read access to the entity list and detail views |
| `create` | Permission to create new records |
| `update` | Permission to update existing records |
| `delete` | Permission to delete records |

Each operation takes a policy object with a `scope` and an optional `condition`.

---

## Scope types

| Scope | Access granted to |
|-------|------------------|
| `workspace` | All authenticated users in the workspace |
| `owner` | The user who created the record |
| `role` | Users with the role specified in `condition` |
| `none` | No one — the operation is disabled |

### `workspace`

Open access to all authenticated members of the workspace. No condition is needed.

```yaml
view: { scope: workspace }
```

### `owner`

Only the record's creator can perform the operation.

```yaml
update: { scope: owner }
```

### `role`

Access is restricted to users who hold a specific role. The `condition` string is a role identifier in the format `<role>:<permission>`.

```yaml
create: { scope: role, condition: finance:create }
delete: { scope: role, condition: admin:delete }
```

Role identifiers are resolved against the workspace's role registry at runtime.

### `none`

The operation is not available to anyone. Use this to disable an operation entirely — for example, to make records append-only.

```yaml
delete: { scope: none }
```

---

## Field policies

`fieldPolicies` overrides access rules for individual fields. Only fields that require stricter access than the entity policy need entries.

```yaml
fieldPolicies:
  revenue:
    view:   { scope: role, condition: finance:view }
    update: { scope: role, condition: finance:update }
```

Field policies support the same scope types as entity policies. A field with a `fieldPolicy` is hidden in the UI and omitted from API responses for users who do not meet the view condition.

---

## Evaluation order

The runtime evaluates policies in this order:

1. Entity-level `policies` — determines whether the user can access the operation at all.
2. Field-level `fieldPolicies` — determines which fields the user can read or write within an allowed operation.

A user denied at the entity level never reaches field-level evaluation.

---

## Scope registry

The `deriveEntityScopeRegistry` function in `@ikary/cell-engine` reads the entity definition and returns a flat list of all permission scopes. This list can be used to seed a role-based access control (RBAC) system. The playground's Scope Registry tab shows the derived scopes for any entity.
