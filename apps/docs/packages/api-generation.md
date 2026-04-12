# API Generation

API generation reads a compiled manifest and produces REST API endpoints. Each entity in the manifest drives a set of CRUD routes.

## Current implementation

```text
@ikary/cell-runtime-api (app)
```

The API runtime currently ships as an app in this monorepo. A standalone generation package is not published yet.

## What it generates

Given an entity in the manifest, the generator produces five endpoints per resource:

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/resource` | List with filtering and pagination |
| `GET` | `/resource/:id` | Fetch a single record |
| `POST` | `/resource` | Create a record |
| `PATCH` | `/resource/:id` | Update a record |
| `DELETE` | `/resource/:id` | Delete a record |

Role scopes from the manifest apply to each endpoint. A role with `actions: [read]` on an entity gets access to the `GET` endpoints only.

Routes follow the [API Conventions](/reference/api-conventions).

## Run from the monorepo

```bash
pnpm --filter @ikary/cell-runtime-api dev
```

This starts the runtime API service for local development.

## Related pages

- [Runtime API](/guide/runtime-api): concept-level explanation
- [API Conventions](/reference/api-conventions): route structure, request and response shapes, error taxonomy, pagination
- [Entity Definition](/reference/entity-definition): fields, relations, lifecycle states, and access policies
