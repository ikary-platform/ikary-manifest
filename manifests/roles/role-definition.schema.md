# Role Definition

Declares a named role with a set of permission scopes. Roles map to identity provider groups through optional identity mappings.

## Responsibilities

- Define a role by key and display name.
- Assign one or more permission scopes to the role.
- Optionally map the role to external identity provider groups.

## Non-Goals

- Does not enforce permissions at runtime. The access control layer reads role definitions and applies them.
- Does not define the scope format. Scope strings follow the convention established by entity policies.

## Schema Surface

- `role-definition.schema.yaml`
- Referenced by: `policy.schema.yaml` (scope values reference roles)

## Properties

**Required:**

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | Unique identifier for this role. |
| `name` | string | Display name for the role. |
| `scopes` | array of strings | Permission scopes assigned to this role. Minimum one item. Items must be unique. |

**Optional:**

| Property | Type | Description |
|----------|------|-------------|
| `description` | string | Human-readable description of the role. |
| `identityMappings` | array of strings | External identity provider group references. Items must be unique. |

## Validation Notes

- `additionalProperties` is `false`.
- All string properties require `minLength: 1`.
- `scopes` requires `minItems: 1` and `uniqueItems: true`.
- `identityMappings` requires `uniqueItems: true`.

## Example

```yaml
- key: finance-admin
  name: Finance Administrator
  description: Full access to financial entities
  scopes: [finance:create, finance:update, finance:delete, finance:view]
  identityMappings: [ad-group:finance-admins]
```
