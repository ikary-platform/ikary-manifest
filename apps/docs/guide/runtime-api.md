# Runtime API

::: tip Looking for the public API?
This page covers the generated CRUD API that the runtime creates from manifests. For the public contract intelligence API (schema discovery, validation, guidance), see [Contract Intelligence API](/api/).
:::

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

The NestJS module/controller/service generator (`@ikary/generator-nest`) is in active development.

## Related pages

- [API Conventions](/reference/api-conventions): full route structure, request and response shapes, error taxonomy, and pagination contract
- [Entity Definition](/reference/entity-definition): fields, relations, lifecycle states, and access policies
- [Manifest Format](/guide/manifest-format): how entities, roles, and pages relate in the manifest
