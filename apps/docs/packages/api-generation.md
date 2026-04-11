# API Generation

API generation reads a compiled manifest and produces REST API endpoints. Each entity in the manifest drives a set of CRUD routes.

## Package

```text
@ikary/generator-nest : NestJS module, controller, and service generator (in progress)
```

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

## Install

```bash
pnpm add @ikary/generator-nest
```

## NestJS generator

The NestJS generator reads a compiled manifest and produces NestJS modules, controllers, and services. It is in active development.

```typescript
// Usage will be documented as the package stabilises.
import { generateNestApp } from '@ikary/generator-nest';
```

## Related pages

- [Runtime API](/guide/runtime-api): concept-level explanation
- [API Conventions](/reference/api-conventions): route structure, request and response shapes, error taxonomy, pagination
- [Entity Definition](/reference/entity-definition): fields, relations, lifecycle states, and access policies
