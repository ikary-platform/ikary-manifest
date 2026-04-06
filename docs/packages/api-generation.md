# API Generation

API generation reads a compiled manifest and produces REST API endpoints. Each entity in the manifest drives a set of CRUD routes.

## Packages

::: code-group

```text [Node.js]
@ikary-manifest/generator-nest : NestJS module, controller, and service generator (in progress)
```

```text [Python]
ikary-manifest-fastapi : FastAPI route generator (planned)
```

:::

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

::: code-group

```bash [Node.js]
pnpm add @ikary-manifest/generator-nest
```

<LangComingSoon />

:::

## Node.js: NestJS generator

The NestJS generator reads a compiled manifest and produces NestJS modules, controllers, and services. It is in active development.

```typescript
// Usage will be documented as the package stabilises.
import { generateNestApp } from '@ikary-manifest/generator-nest';
```

## Python: FastAPI generator

The FastAPI generator is planned. It will consume the same compiled manifest and produce FastAPI route definitions.

## Related pages

- [Runtime API](/guide/runtime-api): concept-level explanation
- [API Conventions](/reference/api-conventions): route structure, request and response shapes, error taxonomy, pagination
- [Entity Definition](/reference/entity-definition): fields, relations, lifecycle states, and access policies
