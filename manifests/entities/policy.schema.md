# Policy Definitions

Controls access to entities and individual fields. The schema defines three structures: `ActionPolicy`, `EntityPoliciesDefinition`, and `FieldPoliciesDefinition`.

## Responsibilities

- Assign a scope level to each CRUD operation on an entity.
- Attach optional conditions to scope-based policies (for example, role-based permissions).
- Apply per-field view and update policies.

## Non-Goals

- Does not enforce policies at runtime. The runtime reads these definitions and applies them.
- Does not define roles or permissions. Use `role-definition.schema.yaml` for that.

## Schema Surface

- `policy.schema.yaml`

## Definitions

### ActionPolicy

A single access rule. Requires `scope`.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `scope` | enum | yes | One of: `public`, `tenant`, `workspace`, `owner`, `role`, `custom`. |
| `condition` | string | no | A condition expression that further restricts access within the scope. |

### EntityPoliciesDefinition

Maps CRUD operations to action policies. Each property is an `ActionPolicy`.

- `view`
- `create`
- `update`
- `delete`

`additionalProperties` is `false`.

### FieldPoliciesDefinition

Maps field keys to objects containing per-field policies. Each field entry accepts:

- `view` (ActionPolicy)
- `update` (ActionPolicy)

`additionalProperties` on each field entry is `false`.

## Validation Notes

- `ActionPolicy` sets `additionalProperties: false`.
- All string properties require `minLength: 1`.

## Example

```yaml
policies:
  view:
    scope: workspace
  create:
    scope: role
    condition: "finance:create"
  update:
    scope: owner
  delete:
    scope: role
    condition: "admin:delete"

fieldPolicies:
  salary:
    view:
      scope: role
      condition: "hr:view_salary"
    update:
      scope: role
      condition: "hr:update_salary"
```
