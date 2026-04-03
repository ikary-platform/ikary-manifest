# API Conventions Contract

Version: 1.2
Scope: OS-Level
Status: Mandatory

Change Note (2026-03-06):

- Added pre-GA hard-replacement exception explicitly allowing `/metrics/*` removal in favor of `/analytics/*`.
- Registered `/api/i18n/*` as canonical pre-GA runtime namespace for language switcher endpoints.

This document defines the REST API conventions for all `ikary-api` endpoints.

All endpoints must comply with these conventions. Deviations require an ADR.

---

# §1 Resource Path Convention

Pre-GA namespace exception:

- Language switcher runtime endpoints are canonical under `/api/i18n/*`.
- Translation management APIs remain under `/translations/*` during transition.

## Cell-scoped resources (cell-isolated entities)

```
/v1/workspaces/:workspaceId/cells/:cellId/:resource
/v1/workspaces/:workspaceId/cells/:cellId/:resource/:id
/v1/workspaces/:workspaceId/cells/:cellId/:resource/:id/:subresource
/v1/workspaces/:workspaceId/cells/:cellId/:resource/:id/rollback
```

## Workspace-scoped resources (workspace-shared entities)

```
/v1/workspaces/:workspaceId/:resource
/v1/workspaces/:workspaceId/:resource/:id
/v1/workspaces/:workspaceId/:resource/:id/:subresource
/v1/workspaces/:workspaceId/:resource/:id/rollback
```

## Tenant-scoped resources (system-global entities)

```
/v1/:resource
/v1/:resource/:id
```

**Path naming rules:**

- Resource names are **plural, kebab-case** (e.g., `deals`, `workspace-members`, `refresh-tokens`)
- IDs are always UUIDs
- No verbs in paths except for named actions (only `rollback` is approved; new named actions require an ADR)
- No nesting beyond three path segments after `/v1/` (workspace → cell → resource)

---

# §2 HTTP Method → Action Mapping

| Method               | Meaning                         | Increments version? | Audit event       |
| -------------------- | ------------------------------- | ------------------- | ----------------- |
| `GET`                | Read (no state change)          | No                  | None              |
| `POST /:resource`    | Create entity                   | Yes (initial = 1)   | `entity.created`  |
| `PATCH /:id`         | Update entity fields            | Yes                 | `entity.updated`  |
| `DELETE /:id`        | Soft-delete entity              | Yes                 | `entity.deleted`  |
| `POST /:id/rollback` | Restore entity to prior version | Yes                 | `entity.rollback` |

**Rules:**

- `PUT` is not used — partial updates via `PATCH` only
- `DELETE` is always a soft-delete (`deletedAt` timestamp) — never hard-delete unless a compaction strategy is documented
- `POST /:id/rollback` accepts a `targetVersion` body field specifying which version to restore; the result is a new version (not a rewrite)
- Bulk mutations are not supported in V1 — each entity requires its own request

---

# §3 Request Shape

## Headers (all requests)

```
Authorization: Bearer <jwt>
Content-Type: application/json   (mutations only)
X-Correlation-ID: <uuid>         (optional; server generates one if absent)
```

## POST (create)

Body must NOT include: `id`, `version`, `createdAt`, `updatedAt`, `deletedAt` — these are server-assigned.

```json
{
  "name": "Acme Corp",
  "status": "active",
  "assigneeId": "uuid"
}
```

## PATCH (update)

Body MUST include `expectedVersion`. The server rejects with `409` if the current version does not match.

```json
{
  "expectedVersion": 3,
  "name": "Acme Corp (renamed)",
  "status": "inactive"
}
```

Only fields present in the body are updated. Absent fields are left unchanged (partial update semantics).

## POST /:id/rollback

```json
{
  "targetVersion": 2,
  "reason": "Accidental overwrite" // optional, stored in audit log
}
```

## Pagination query parameters (GET collection)

| Param      | Type    | Default | Max | Notes                        |
| ---------- | ------- | ------- | --- | ---------------------------- |
| `page`     | integer | 1       | —   | 1-based                      |
| `pageSize` | integer | 20      | 100 | Values above 100 are clamped |
| `sortBy`   | string  | varies  | —   | Field name (camelCase)       |
| `sortDir`  | string  | `asc`   | —   | `asc` or `desc`              |

Filter parameters are resource-specific and documented per endpoint.

---

# §4 Response Shape

## Single resource

```json
{
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    "status": "active"
  },
  "meta": {
    "version": 3,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-03-01T14:22:00.000Z",
    "updatedBy": "uuid"
  }
}
```

`meta` fields are always present on entity responses. They must never be omitted.

## Collection

```json
{
  "data": [
    { "id": "uuid", "name": "Acme Corp", ... },
    { "id": "uuid", "name": "Beta Inc", ... }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "pageSize": 20
  }
}
```

`total` reflects the count after all filters and scope constraints are applied. It is not the raw table count.

## Soft-deleted resources

Soft-deleted entities are **excluded** from collection responses by default. To include them, pass `?includeDeleted=true` (requires an explicit permission: `<namespace>.<resource>.read` with policy allowing deleted visibility).

## Rollback response

Rollback returns the new (restored) entity state as a single resource response, with the new version number in `meta.version`.

---

# §5 Error Response Shape

All error responses use a consistent envelope:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description",
  "details": {}
}
```

`details` is optional. When present it contains structured information to help the client recover (e.g., field-level validation errors, expected vs actual version).

### Validation error (400) example

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Request body failed schema validation",
  "details": {
    "fields": [
      { "path": "name", "message": "Required" },
      { "path": "status", "message": "Must be one of: active, inactive, archived" }
    ]
  }
}
```

### Conflict error (409) example

```json
{
  "error": "CONFLICT",
  "message": "Version mismatch: expected 3, current is 5",
  "details": {
    "expectedVersion": 3,
    "currentVersion": 5
  }
}
```

### Forbidden error (403) examples

```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to perform this action"
}
```

```json
{
  "error": "PLAN_RESTRICTION",
  "message": "This feature requires an Enterprise plan",
  "details": {
    "requiredPlan": "enterprise",
    "currentPlan": "standard"
  }
}
```

**Rules:**

- Stack traces must never appear in error responses (any environment)
- Internal error IDs or DB constraint names must never appear in `message`
- `500` responses return a generic `INTERNAL_ERROR` code with a `correlationId` for support tracing

```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "details": {
    "correlationId": "uuid"
  }
}
```

---

# §6 HTTP Status Taxonomy

| Status | When                                                                                    |
| ------ | --------------------------------------------------------------------------------------- |
| 200    | `GET`, `PATCH`, `DELETE` success                                                        |
| 201    | `POST` (entity created); `Location` header points to the new resource URL               |
| 400    | Validation error (Zod parse failure, malformed body, invalid query params)              |
| 401    | Missing or invalid JWT; expired token                                                   |
| 403    | Authorization denied (any `AuthorizationDenyReason`); plan restriction                  |
| 404    | Resource not found, or scope-filtered out (treated as not found, not 403)               |
| 409    | `expectedVersion` mismatch on PATCH / DELETE / rollback                                 |
| 422    | Business rule violation that is not a validation error (e.g., state machine constraint) |
| 429    | Rate limit exceeded; `Retry-After` header is set                                        |
| 500    | Unhandled server error                                                                  |

**404 vs 403 policy**: Scope-filtered resources (entities the user has no access to due to row-level policy) return 404, not 403. This prevents information leakage about the existence of resources the user cannot see.

**201 Location header**: On successful `POST`, the response must include:

```
Location: /v1/workspaces/:workspaceId/[cells/:cellId/]:resource/:newId
```

---

# §7 Versioning

The API is versioned at the path level (`/v1/`). A new major version is introduced when a breaking change to the request or response shape is required.

Rules:

- Adding new optional fields to a response is non-breaking (no version bump)
- Removing fields, renaming fields, or changing field types requires a major version bump
- A deprecated endpoint must continue to function for a minimum of one release cycle before removal
- Deprecation is signaled via the `Deprecation` response header:
  ```
  Deprecation: true
  Sunset: Sat, 31 Dec 2024 23:59:59 GMT
  ```

Pre-GA exception:

- Before first production GA, a controlled hard replacement is allowed without one-release deprecation.
- This exception must be explicitly documented in the change contract and linked in release notes.
- `/metrics/*` → `/analytics/*` is an approved pre-GA hard replacement under this exception.
