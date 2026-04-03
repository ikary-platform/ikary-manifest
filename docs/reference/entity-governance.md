---
outline: deep
---

# Micro Entity Governance Spec

Version: 1.1
Scope: Workspace + Cell entities (micro-app-api + micro-app-ui + micro-app-db)
Status: Mandatory

> **See also:** `system/registry/ENTITY-DEFINITION.MD` — canonical IKARY Entity Definition JSON standard with governance extensions (`scope`, `governance_tier`, `permissions`, mandatory base fields, and the `data` block for declarative filtering/searching/sorting).

---

## 0. Why this exists

Micro positions itself as **enterprise-grade by default**. That requires that every persisted business object (an “entity”) supports:

- **Traceability**: who changed what and when
- **Accountability**: attribution (createdBy/updatedBy) and access control
- **Safety**: concurrency controls to prevent accidental overwrites
- **Recoverability**: ability to restore a previous state (where appropriate)
- **Compliance**: retention policies, redaction of sensitive data, exportability

This spec defines the **minimum governance contract** CODEX must implement for all entities in Micro.

---

## 1. Definitions

### 1.1 Entity

A business object persisted in Postgres (example: Account, Contact, Opportunity, OutboundSequence, InvoiceRule).

### 1.2 Workspace vs Cell

Micro uses two data planes:

- **Workspace plane**: shared domain objects across cells (high governance expectations)
- **Cell plane**: vertical objects inside a cell (app-specific; still governed, but may allow lighter rollback)

### 1.3 Committed vs Draft

- **Committed**: the system of record (what the system runs on)
- **Draft**: user in-progress edits (safe to autosave and abandon)

Drafts are governed separately (see Form pattern spec). This document focuses on governance for **committed** entities and their history.

---

## 2. Governance levels (per entity)

Every entity MUST declare a `GovernanceTier`.

```ts
export type GovernanceTier =
  | 'tier-1' // full history + diff + restore enabled
  | 'tier-2' // full history + diff, restore optional
  | 'tier-3'; // minimal history, no restore (rare; still audit)
```

### Default mapping

- Workspace entities: **tier-1**
- Cell entities: **tier-2**
- tier-3 is only for high-volume ephemeral entities (e.g., telemetry-like objects). Even tier-3 must still log security-critical updates.

---

## 3. Base entity contract (mandatory)

All committed entities MUST include the following fields.

```ts
export interface MicroEntityBase {
  id: string; // UUID
  tenantId: string; // multi-tenancy boundary (required)
  workspaceId: string; // workspace boundary (required)
  cellId?: string | null; // optional scoping for cell-plane entities

  version: number; // optimistic concurrency; increments on every commit

  createdAt: string; // ISO timestamp
  createdBy: string; // actor id (user/service)
  updatedAt: string; // ISO timestamp
  updatedBy: string; // actor id (user/service)

  deletedAt?: string | null; // soft delete (recommended default)
  deletedBy?: string | null;

  // Optional: for human-friendly display
  displayName?: string | null;
}
```

### Rules

- `version` MUST increment on every mutation that changes persisted state.
- `createdBy` / `updatedBy` MUST reflect the authenticated actor (user id or service id).
- Soft delete is recommended as default for enterprise (restore + audit). Hard delete must be rare and privileged.

---

## 4. Audit history (mandatory)

### 4.1 Principle

History must be **append-only** and **tamper-evident in practice** (restricted writes, no updates).

### 4.2 Audit events

Every mutation must produce an audit event of one of these types:

- `entity.created`
- `entity.updated`
- `entity.deleted` (soft delete)
- `entity.restored` (undo delete)
- `entity.rollback` (restore prior version)
- `entity.permission_changed` (if entity has ACL)

### 4.3 Audit record schema (recommended)

Store as a separate table: `audit_log`.

```sql
-- Postgres
create table audit_log (
  id uuid primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  cell_id uuid null,

  actor_id uuid not null,
  actor_type text not null, -- "user" | "service"
  event_type text not null, -- e.g. entity.updated

  resource_type text not null, -- e.g. "contact"
  resource_id uuid not null,

  resource_version int not null, -- version after commit
  base_version int null, -- version prior to change

  occurred_at timestamptz not null default now(),

  request_id text null,
  trace_id text null,
  ip inet null,
  user_agent text null,

  -- change representation
  change_kind text not null, -- "diff" | "snapshot"
  diff jsonb null, -- JSON Patch / field diff (preferred)
  snapshot jsonb null, -- full sanitized snapshot (optional)

  -- governance helpers
  redaction_applied boolean not null default true,
  tags text[] null
);

create index on audit_log (tenant_id, workspace_id, resource_type, resource_id, occurred_at desc);
create index on audit_log (tenant_id, workspace_id, occurred_at desc);
```

### 4.4 Diff format

Preferred: **RFC 6902 JSON Patch** (compact, deterministic).

Example `diff`:

```json
[
  { "op": "replace", "path": "/status", "value": "active" },
  { "op": "add", "path": "/tags/-", "value": "vip" }
]
```

Alternative (acceptable): field-level `{ path, before, after }` but MUST apply redaction policy.

---

## 5. Redaction policy (mandatory)

Audit logs are powerful and dangerous. Micro MUST support field-level redaction.

### 5.1 Field tagging

Entities MUST tag sensitive fields in code via a schema annotation layer.

Example (Zod + metadata):

```ts
const ContactSchema = z.object({
  email: z.string().email().describe('sensitive:pii'),
  phone: z.string().optional().describe('sensitive:pii'),
  notes: z.string().optional().describe('sensitive:free_text'),
});
```

### 5.2 Redaction rules

- For `sensitive:pii` fields: store only the **path** and **operation**, not raw values.
- For `sensitive:free_text`: store path + hash length or a stable hash, not content.
- For credentials/secrets: NEVER store value; only path and op.

### 5.3 Compliance switch

Micro must allow per-tenant policy configuration:

- `audit.storeSnapshots`: true/false
- `audit.storeDiffValues`: true/false (defaults false for sensitive)

---

## 6. Versioning & rollback (recommended default)

### 6.1 Two approaches

Micro SHOULD implement **Event Sourcing-lite**:

- System of record: standard entity table
- History: append-only `audit_log`
- Optional snapshots for fast restore or diff visualization

Full event sourcing is not required and increases complexity significantly.

### 6.2 Rollback semantics

Rollback MUST be implemented as: **“Revert by creating a new version”**.

- Do NOT rewrite old rows
- Do NOT delete audit events
- Rollback creates:
  - a new entity version
  - a new audit event `entity.rollback`
  - a diff that returns the entity to a chosen previous state

This keeps the audit trail intact and is the enterprise-friendly approach.

### 6.3 When rollback is enabled

- Tier-1 entities: rollback enabled by default
- Tier-2 entities: rollback optional (configurable)
- Tier-3: rollback disabled

### 6.4 Restore target

Rollback can target:

- a specific `resource_version`
- a specific `audit_log.id`
- a snapshot pointer (if snapshots enabled)

---

## 7. Concurrency control (mandatory)

Micro uses optimistic concurrency for committed entities.

### 7.1 Rule

Every update must provide `expectedVersion`.

If `expectedVersion != current.version` → reject with `409 Conflict`.

### 7.2 API error shape

```json
{
  "error": "conflict",
  "message": "Resource updated elsewhere",
  "currentVersion": 12,
  "expectedVersion": 11
}
```

### 7.3 Client behavior

Clients must offer:

- reload latest
- re-apply draft (rebase)
- discard changes

This ties directly to the Form Pattern Spec.

---

## 8. API contract (NestJS)

### 8.1 Entity CRUD (governed)

- `GET /{resourceType}/{id}` → returns `{ data, meta }`
- `POST /{resourceType}` → creates entity, writes `entity.created`
- `PATCH /{resourceType}/{id}` → requires `expectedVersion`, writes `entity.updated`
- `DELETE /{resourceType}/{id}` → soft delete (default), writes `entity.deleted`

Patch request example:

```json
{
  "expectedVersion": 11,
  "patch": [{ "op": "replace", "path": "/status", "value": "active" }]
}
```

### 8.2 History endpoints

- `GET /audit?resourceType=contact&resourceId=...&limit=50`
- `GET /audit/{auditId}` (details)
- `GET /{resourceType}/{id}/versions?limit=50` (optional convenience)

### 8.3 Rollback endpoint

- `POST /{resourceType}/{id}/rollback`

Body:

```json
{
  "targetVersion": 9,
  "expectedVersion": 12,
  "mode": "revert-by-new-version"
}
```

Response:

```json
{
  "id": "uuid",
  "version": 13,
  "updatedAt": "ISO_DATE"
}
```

### 8.4 Authorization for history & rollback

- `audit:read` permission required to view history
- `audit:restore` permission required for rollback
- For Workspace tier-1 entities, rollback may require elevated role (e.g., Admin / Owner)

---

## 9. Database patterns (Postgres)

### 9.1 Entity tables

Each entity table MUST include:

- `tenant_id`, `workspace_id` (and `cell_id` when relevant)
- `version` integer
- audit metadata fields
- soft delete fields

### 9.2 Indexes (minimum)

- `(tenant_id, workspace_id, id)` (primary key often enough)
- `(tenant_id, workspace_id, updated_at desc)` for admin lists
- `(tenant_id, workspace_id, cell_id)` if cell-scoped

### 9.3 Tenant isolation

All queries must be scoped by tenant/workspace (row-level protection in app code or RLS).

---

## 10. UI patterns (micro-app-ui)

### 10.1 “History Drawer” (recommended default component)

For tier-1 and tier-2 entities, Micro UI should provide a standard “History” surface:

- Right-side drawer or modal
- Timeline list of audit events
- Each entry shows:
  - event type
  - actor
  - timestamp
  - summary (fields changed)
- Entry detail view:
  - diff viewer (redactions applied)
  - link to requestId/traceId (observability)

### 10.2 “Restore” flow

When rollback enabled:

- Show “Restore this version” CTA on a history entry
- Confirm modal:
  - “This will create a new version reverting changes”
- After success:
  - toast “Restored as version N”
  - refresh entity view

### 10.3 “Last updated” surface

Every entity detail header should show:

- Created at/by (optional in UI)
- Last updated at/by (recommended)
- Version number (optional, helpful for support/debug)

---

## 11. Observability (mandatory)

Each write must attach:

- `requestId` (propagate from API gateway)
- `traceId` (OpenTelemetry)

Metrics:

- `entity_write_total{resourceType,eventType}`
- `entity_conflict_total{resourceType}`
- `audit_write_latency_ms`
- `rollback_total{resourceType}`

Logs:

- include `tenantId`, `workspaceId`, `resourceType`, `resourceId`, `version`

---

## 12. Retention & compliance (enterprise defaults)

Micro SHOULD support per-tenant retention policies:

- `audit.retentionDays` (default: 365 or “infinite” depending on plan)
- `audit.export` (ability to export by time range)
- `audit.immutability` (restrict deletion; admin-only)

Soft deletes:

- default retention for soft deleted entities (e.g., 30–90 days) before purge (optional feature)

---

## 13. How this connects to Forms (important)

Micro Forms manage drafts. Entity Governance manages committed state.

### Flow

1. User edits form → autosave draft (Form Pattern Spec)
2. User commits → server:
   - checks expectedVersion
   - applies patch to entity
   - increments entity version
   - writes audit event (diff + metadata)
3. UI updates “Last updated by/at” and version

This is the “enterprise-grade default” story.

---

## 14. Implementation checklist for CODEX

For each new entity type:

1. Add base fields (tenant/workspace/cell/version + metadata)
2. Implement CRUD with optimistic concurrency (409 on mismatch)
3. Emit audit events on every mutation
4. Apply redaction rules for sensitive fields
5. Expose history endpoint (audit query)
6. If tier-1/tier-2 with rollback enabled:
   - implement rollback endpoint (revert-by-new-version)
   - implement UI history drawer + restore flow
7. Add metrics + trace ids

---

## 15. Recommended defaults (opinionated)

- Workspace entities: tier-1, rollback enabled
- Cell entities: tier-2, rollback optional (default on)
- Always store audit diffs (JSON Patch)
- Snapshots off by default; enable per tenant/plan if needed
- Soft delete on by default
- `expectedVersion` required for all updates
- History UI enabled by default for governed entities

---

# End of Spec
