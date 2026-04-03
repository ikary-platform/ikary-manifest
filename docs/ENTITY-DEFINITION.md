# IKARY Entity Definition Standard

Version: 1.0
Status: Canonical
Scope: Platform-wide

This document is the **canonical source of truth** for the IKARY Entity Definition JSON standard. All entity definitions stored in `domain-registry` and referenced by system-registry, actions, capabilities, and intents MUST conform to this standard.

Cross-references:

- `entity-governance.md` — governance contract (audit, versioning, rollback)
- `system/backend/1-ENTITY-CONTRACT.MD` — server-side entity contract
- `system/DOMAIN-MODEL.MD` — domain hierarchy

---

## 1. Entity Definition JSON Structure

```json
{
  "$schema": "https://ikary.io/schemas/entity-definition/v1.json",
  "name": "PascalCaseEntityName",
  "key": "domain.snake_case_key",
  "version": "1.0.0",
  "description": "Human-readable description of the entity",
  "scope": "workspace-shared",
  "governance_tier": "tier-2",
  "permissions": {
    "view": ["viewer", "member", "admin"],
    "edit": ["member", "admin"],
    "admin": ["admin"]
  },
  "fields": {
    "id": { "type": "string", "format": "uuid", "description": "Primary key" },
    "tenant_id": { "type": "string", "format": "uuid", "description": "Tenant isolation key" },
    "workspace_id": { "type": "string", "format": "uuid", "description": "Workspace scope" },
    "cell_id": {
      "type": "string",
      "format": "uuid",
      "description": "Cell scope (cell-isolated only)",
      "optional": true
    },
    "version": { "type": "integer", "description": "Optimistic concurrency version — increments on every mutation" },
    "created_at": { "type": "string", "format": "date-time" },
    "created_by": { "type": "string", "format": "uuid" },
    "updated_at": { "type": "string", "format": "date-time" },
    "updated_by": { "type": "string", "format": "uuid" },
    "deleted_at": { "type": "string", "format": "date-time", "nullable": true },
    "deleted_by": { "type": "string", "format": "uuid", "nullable": true }
  },
  "data": {
    "filtering": {
      "allowedFields": ["status", "created_at"],
      "operators": {
        "status": ["equals", "in"],
        "created_at": ["before", "after", "between"]
      }
    },
    "searching": {
      "fields": ["name", "description"]
    },
    "sorting": {
      "allowedFields": ["created_at", "updated_at", "name"],
      "default": { "field": "created_at", "direction": "desc" }
    }
  }
}
```

---

## 2. Top-Level IKARY Metadata

| Field             | Type   | Required | Description                                              |
| ----------------- | ------ | -------- | -------------------------------------------------------- |
| `$schema`         | string | yes      | Schema URI for tooling                                   |
| `name`            | string | yes      | PascalCase entity name                                   |
| `key`             | string | yes      | `domain.snake_case_key` machine key                      |
| `version`         | string | yes      | Semver contract version (e.g. `"1.0.0"`)                 |
| `description`     | string | yes      | Human-readable description                               |
| `scope`           | string | yes      | `system-global` \| `workspace-shared` \| `cell-isolated` |
| `governance_tier` | string | yes      | `tier-1` \| `tier-2` \| `tier-3`                         |
| `permissions`     | object | yes      | AccessLevel alignment (see §3)                           |
| `fields`          | object | yes      | Field definitions (see §4)                               |
| `data`            | object | no       | Declarative filtering/searching/sorting (see §5)         |

### Scope definitions

| Scope              | Requires                                 | Use case                           |
| ------------------ | ---------------------------------------- | ---------------------------------- |
| `system-global`    | `tenant_id`                              | Tenant-level; no workspace context |
| `workspace-shared` | `tenant_id` + `workspace_id`             | Cross-cell workspace data          |
| `cell-isolated`    | `tenant_id` + `workspace_id` + `cell_id` | Cell-private data                  |

### Governance tiers

| Tier     | Characteristics                                     |
| -------- | --------------------------------------------------- |
| `tier-1` | Full audit, rollback, event emission, PII redaction |
| `tier-2` | Full audit, rollback, event emission                |
| `tier-3` | Audit only (no rollback)                            |

---

## 3. Permissions Format

Permissions align with the IKARY `AccessLevel` enum. Role names are workspace-relative.

```json
"permissions": {
  "view":  ["viewer", "member", "admin"],
  "edit":  ["member", "admin"],
  "admin": ["admin"]
}
```

| Permission | AccessLevel         | Semantics                     |
| ---------- | ------------------- | ----------------------------- |
| `view`     | `AccessLevel.VIEW`  | Read-only access              |
| `edit`     | `AccessLevel.EDIT`  | Create + update               |
| `admin`    | `AccessLevel.ADMIN` | Full control including delete |

---

## 4. Mandatory Base Fields

Every entity definition MUST include these fields in its `fields` map:

```json
"tenant_id":    { "type": "string", "format": "uuid" },
"workspace_id": { "type": "string", "format": "uuid" },
"version":      { "type": "integer", "description": "Optimistic concurrency version" },
"created_at":   { "type": "string", "format": "date-time" },
"created_by":   { "type": "string", "format": "uuid" },
"updated_at":   { "type": "string", "format": "date-time" },
"updated_by":   { "type": "string", "format": "uuid" },
"deleted_at":   { "type": "string", "format": "date-time", "nullable": true },
"deleted_by":   { "type": "string", "format": "uuid",      "nullable": true }
```

`cell_id` is mandatory for `cell-isolated` scope, optional otherwise.

### Field descriptor properties

| Property      | Type     | Description                                                           |
| ------------- | -------- | --------------------------------------------------------------------- |
| `type`        | string   | `string` \| `integer` \| `number` \| `boolean` \| `object` \| `array` |
| `format`      | string   | `uuid` \| `date-time` \| `email` \| `url` (optional)                  |
| `description` | string   | Human-readable (optional)                                             |
| `nullable`    | boolean  | Whether null is a valid value (default: false)                        |
| `optional`    | boolean  | Whether the field can be absent (default: false)                      |
| `sensitive`   | boolean  | If true, field is redacted in audit diffs (default: false)            |
| `enum`        | string[] | Allowed values (optional)                                             |

---

## 5. Declarative Data Block (`data`)

The `data` block enables IKARY to auto-generate list views, filter bars, search inputs, and sorting controls. It is optional at the entity definition level.

```json
"data": {
  "filtering": {
    "allowedFields": ["status", "due_date", "customer_id", "amount"],
    "operators": {
      "status":     ["equals", "in"],
      "due_date":   ["before", "after", "between"],
      "amount":     ["gt", "lt", "between"]
    }
  },
  "searching": {
    "fields": ["invoice_number", "customer_name"]
  },
  "sorting": {
    "allowedFields": ["due_date", "amount", "created_at"],
    "default": { "field": "created_at", "direction": "desc" }
  }
}
```

### Rules

- Field names MUST use `snake_case` (consistent with entity field naming)
- Allowed operators: `equals`, `in`, `contains`, `startsWith`, `before`, `after`, `between`, `gt`, `lt`
- No SQL operators or query predicates — purely declarative
- `filtering.allowedFields` MUST be a subset of fields defined in the `fields` map
- `sorting.allowedFields` MUST be a subset of fields defined in the `fields` map
- `data` is optional; page-specific queries are handled via future `defineView()`

---

## 6. Entity Reference Versioning

When an action, capability, or intent references an entity, use the `entityRef` format:

```
"entityRef": "domain.EntityName@v1"
```

The version suffix (`@v1`, `@v2`) corresponds to the major version of the `version` semver field (e.g. `"1.0.0"` → `@v1`). Multiple versions of the same entity can coexist in the same workspace.

---

## 7. Versioning Rules

Two distinct versioning concerns coexist:

| Concern            | Column/Field                                 | Type          | Semantics                               |
| ------------------ | -------------------------------------------- | ------------- | --------------------------------------- |
| Contract version   | `definition_version` (DB) / `version` (JSON) | semver string | `"1.0.0"` — multiple coexist            |
| Governance version | `version` (DB integer)                       | integer       | Optimistic concurrency; 409 on mismatch |

**Do not confuse** the JSON `"version": "1.0.0"` (contract semver) with the DB `version` integer (optimistic concurrency counter). They serve different purposes.

---

## 8. Example — Invoice Entity

```json
{
  "$schema": "https://ikary.io/schemas/entity-definition/v1.json",
  "name": "Invoice",
  "key": "crm.invoice",
  "version": "1.0.0",
  "description": "Customer invoice with line items",
  "scope": "workspace-shared",
  "governance_tier": "tier-2",
  "permissions": {
    "view": ["viewer", "member", "admin"],
    "edit": ["member", "admin"],
    "admin": ["admin"]
  },
  "fields": {
    "id": { "type": "string", "format": "uuid" },
    "tenant_id": { "type": "string", "format": "uuid" },
    "workspace_id": { "type": "string", "format": "uuid" },
    "invoice_number": { "type": "string", "description": "Human-readable invoice number" },
    "customer_id": { "type": "string", "format": "uuid" },
    "customer_name": { "type": "string" },
    "status": { "type": "string", "enum": ["DRAFT", "SENT", "PAID", "OVERDUE"] },
    "amount": { "type": "number" },
    "due_date": { "type": "string", "format": "date-time" },
    "version": { "type": "integer" },
    "created_at": { "type": "string", "format": "date-time" },
    "created_by": { "type": "string", "format": "uuid" },
    "updated_at": { "type": "string", "format": "date-time" },
    "updated_by": { "type": "string", "format": "uuid" },
    "deleted_at": { "type": "string", "format": "date-time", "nullable": true },
    "deleted_by": { "type": "string", "format": "uuid", "nullable": true }
  },
  "data": {
    "filtering": {
      "allowedFields": ["status", "due_date", "customer_id", "amount"],
      "operators": {
        "status": ["equals", "in"],
        "due_date": ["before", "after", "between"],
        "customer_id": ["equals"],
        "amount": ["gt", "lt", "between"]
      }
    },
    "searching": {
      "fields": ["invoice_number", "customer_name"]
    },
    "sorting": {
      "allowedFields": ["due_date", "amount", "created_at"],
      "default": { "field": "created_at", "direction": "desc" }
    }
  }
}
```
