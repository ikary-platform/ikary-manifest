# Runtime API

The API runtime reads entities from a compiled manifest and generates REST API endpoints. Each entity in the manifest becomes a set of CRUD routes.

## What it generates

Given an entity definition, the API runtime creates five standard endpoints per resource:

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/resource` | List records with filtering and pagination |
| `GET` | `/resource/:id` | Fetch a single record |
| `POST` | `/resource` | Create a record |
| `PATCH` | `/resource/:id` | Update a record |
| `DELETE` | `/resource/:id` | Delete a record |

Role-scoped access control applies to each endpoint based on the `roles` section of the manifest. A viewer role with `actions: [read]` on an entity gets access to the `GET` endpoints only.

Routes follow the [API Conventions](/reference/api-conventions) defined in this project.

## Example

Given this entity in the manifest:

```yaml
entities:
  - key: customer
    name: Customer
    pluralName: Customers
    fields:
      - key: name
        type: string
        name: Full Name
      - key: email
        type: string
        name: Email
```

The API runtime generates routes under `/customers`. The list endpoint returns a paginated response with metadata. The detail endpoint returns a single record. Create and update endpoints validate the request body against the field definitions.

## Current status

::: code-group

```bash [Node.js]
# @ikary-manifest/generator-nest
# Generates NestJS modules from a compiled manifest
# Status: in progress
```

```python [Python]
# FastAPI generator
# Status: planned
```

:::

The NestJS generator for Node.js is in active development under `node/packages/generator-nest`. The FastAPI generator for Python is planned.

## Related pages

- [API Conventions](/reference/api-conventions): full route structure, request and response shapes, error taxonomy, and pagination contract
- [Entity Definition](/reference/entity-definition): fields, relations, lifecycle states, and access policies
- [Manifest Format](/guide/manifest-format): how entities, roles, and pages relate in the manifest
