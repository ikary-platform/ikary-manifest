# Micro Form Pattern Spec

Version: 1.0\
Scope: micro-app-ui + micro-app-api\
Default Risk Level: Draft + Commit

---

# 1. Purpose

Define a standardized enterprise-grade form pattern for all Micro
applications.

Goals:

- Prevent data loss (auto-save drafts)
- Prevent accidental irreversible commits
- Ensure auditability
- Handle multi-user concurrency safely
- Provide consistent UX across all cells
- Integrate cleanly with authorization and observability

Non-goals:

- Real-time collaborative editing
- Offline-first synchronization

---

# 2. Risk Levels

Every form MUST declare a `FormRiskLevel`.

```ts
export type FormRiskLevel = 'draft-only' | 'draft-and-commit' | 'commit-only';
```

## 2.1 Draft-Only (Low Risk)

Auto-save is the source of truth.

Examples: - Profile settings - User preferences - Draft notes

Behavior: - No explicit "Save" button - Auto-save writes directly to
resource

---

## 2.2 Draft + Commit (Medium Risk) --- DEFAULT

Auto-save saves to draft. Explicit commit required to apply changes.

Examples: - Operational configuration - Workflow settings - Internal
business rules

Behavior: - Auto-save draft (debounced) - Show "Draft saved" - Show
primary action: "Apply changes"

---

## 2.3 Commit-Only (High Risk)

Changes must not be persisted without explicit confirmation.

Examples: - Permissions and roles - Billing configuration - Webhooks -
Legal fields - Automation triggers

Behavior: - No background commit - Explicit Save button - Confirmation
modal for irreversible changes

---

# 3. UX Contract

## 3.1 Form Header Structure

- Title
- Status pill
- Primary action (Apply / Save)
- Secondary actions (Discard / Cancel)
- Last saved timestamp

---

## 3.2 Status States

```ts
type FormStatus = 'idle' | 'editing' | 'saving' | 'saved' | 'needs-review' | 'error' | 'conflict' | 'locked';
```

Definitions:

- idle → no changes
- editing → local changes not saved
- saving → draft being persisted
- saved → draft saved
- needs-review → draft differs from committed
- error → draft save failed
- conflict → version mismatch on commit
- locked → resource locked by policy

---

# 4. Data Model

Micro separates committed state and draft state.

## 4.1 Committed Resource

```ts
interface Resource<T> {
  id: string;
  data: T;
  version: number;
  updatedAt: string;
  updatedBy: string;
}
```

## 4.2 Draft Resource

```ts
interface Draft<T> {
  draftId: string;
  resourceId: string;
  patch: Partial<T>;
  baseVersion: number;
  status: 'active' | 'committed' | 'abandoned';
  scope: 'user-private' | 'shared';
  updatedAt: string;
  updatedBy: string;
}
```

Default: - scope = "user-private" - one active draft per user per
resource

---

# 5. API Contract (NestJS)

## 5.1 Read Committed State

GET /resources/:id

Response:

```json
{
  "data": {},
  "version": 4,
  "updatedAt": "ISO_DATE"
}
```

## 5.2 Create or Get Draft

POST /resources/:id/draft

Response:

```json
{
  "draftId": "uuid",
  "patch": {},
  "baseVersion": 4
}
```

## 5.3 Autosave Draft

PATCH /drafts/:draftId

Body:

```json
{
  "patch": {},
  "clientUpdatedAt": "ISO_DATE"
}
```

Response:

```json
{
  "draftId": "uuid",
  "updatedAt": "ISO_DATE"
}
```

Rules:

- Idempotent
- Safe for retries
- Must not mutate committed resource

## 5.4 Commit Draft

POST /drafts/:draftId/commit

Request:

```json
{
  "baseVersion": 4
}
```

Behavior:

- If committed.version !== baseVersion → 409 Conflict
- If valid → apply patch, increment version

Response:

```json
{
  "resourceId": "id",
  "version": 5,
  "updatedAt": "ISO_DATE"
}
```

## 5.5 Discard Draft

POST /drafts/:draftId/discard

Returns 204

---

# 6. Concurrency Policy

Micro uses optimistic concurrency.

On commit:

- Compare baseVersion
- If mismatch → 409
- Include serverVersion, serverData, draftPatch

Client must allow:

- Reload latest
- Re-apply changes
- Discard

---

# 7. Validation Strategy

Three layers:

1.  Client (Zod)
2.  Draft validation (business rules)
3.  Commit validation (authoritative)

Server validation always final.

---

# 8. Autosave Behavior (UI Layer)

Default debounce: 900ms

Flush on: - Blur - Route change - Tab close (best effort)

UI rules:

- Show "Saving..." only if \> 250ms
- Show "Saved ✓" with timestamp
- On error → show retry

Track:

- isDirtyLocal
- isDirtyDraft
- canCommit

---

# 9. Audit Logging

Mandatory for commit.

Events:

Draft: - draft.created - draft.updated - draft.discarded

Commit: - resource.updated

Audit fields:

- actorId
- tenantId
- workspaceId
- cellId
- resourceType
- resourceId
- eventType
- timestamp
- diff
- riskLevel

Sensitive fields must be redacted.

---

# 10. Authorization

Draft: - Requires edit permission

Commit: - Requires resource:write - For high risk →
resource:write_sensitive

Tenant isolation must be enforced at query level.

---

# 11. Observability

Track metrics:

- autosave_requests_total
- commit_requests_total
- commit_conflicts_total
- autosave_latency_p95
- commit_latency_p95

Emit client events:

- form_autosave_success
- form_autosave_error
- form_commit_success
- form_commit_conflict

---

# 12. React Integration

Recommended stack:

- react-hook-form
- zod
- @tanstack/react-query

Core hook:

```ts
useMicroForm({
  resourceKey,
  schema,
  riskLevel,
});
```

Responsibilities:

- Load committed resource
- Manage draft
- Autosave patch
- Handle commit
- Handle conflict

---

# 13. Opinionated Defaults

- Risk level default = draft-and-commit
- Debounce = 900ms
- One draft per user per resource
- Optimistic concurrency required
- Audit logging enabled everywhere
- Draft stored server-side

---

# 14. Definition of Done

A form is Micro-compliant if:

- No data loss on refresh
- Commit is explicit for medium/high risk
- Conflict detection works
- Audit logs exist for commit
- Authorization enforced
- Status state visible to user
