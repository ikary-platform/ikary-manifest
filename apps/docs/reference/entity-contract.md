---
outline: deep
---

# Entity Schema Normalization Contract

Version: 1.2
Scope: micro-app-api
Status: Mandatory

> This is an advanced maintainer-focused contract. Start with [Entity Definition](/reference/entity-definition) for the core model.

This document defines how Entity Schema evolution is handled when the system normalizes all entities to the latest schema version on read.

Entities MUST be returned in the latest active schemaVersion.

Clients must never handle schema migration logic.

---

# 1. Normalization Principle

When reading any entity:

IF snapshot.schemaVersion < currentSchemaVersion:

    Server MUST:
        - Load stored snapshot
        - Apply deterministic transformation chain
        - Normalize entity to latest schema
        - Return normalized representation

Client must always receive:

- entity data in latest schema format
- metadata including:
  - currentVersion (instance)
  - schemaVersion (latest)
  - originalSchemaVersion (optional for debugging)

---

# 2. Transformation Layer

Each schema version must define:

- transformationFromPreviousVersion

Example:

v1 → v2  
v2 → v3

Transformations must be:

- Pure functions
- Deterministic
- Idempotent
- Stateless

Transformation logic must live server-side.

Client must never run schema migrations.

---

# 3. Migration Chain Resolution

If entity stored at schema v1
Current schema = v4

Server must apply:

v1 → v2  
v2 → v3  
v3 → v4

Sequentially.

Skipping versions forbidden unless explicitly supported.

---

# 4. Write Path with Normalization

On commit:

1. Normalize incoming data to latest schema
2. Apply diff against reconstructed state
3. Persist diff with schemaVersion = latest

Old schemaVersion must not persist after mutation.

Lazy migration is default model.

---

# 5. Performance Requirements

Normalization must:

- Not require full history scan
- Use snapshot + diff reconstruction
- Apply transformation only once per read
- Be cacheable per version

Optional optimization:

- After normalization, persist new snapshot to reduce future transformation cost.

---

# 6. Breaking Change Rules

Breaking change requires:

- New schemaVersion
- Defined transformation from previous version
- Audit emission

Breaking change must not:

- Remove ability to reconstruct older versions
- Mutate stored historical schema

---

# 7. Rollback and Schema Interaction

If rolling back to older version:

- Reconstruct snapshot at that version
- Normalize to latest schema
- Persist as new version
- Store schemaVersion = latest

System must never reintroduce outdated schemaVersion after rollback.

---

# 8. Audit Events

Emit events:

- schema.created
- schema.activated
- schema.normalized
- schema.migrated_lazy

Include:

- entityType
- oldSchemaVersion
- newSchemaVersion
- workspaceId
- cellId

---

# 9. Retention Interaction

Retention must:

- Preserve ability to reconstruct entity at historical version
- Preserve schemaVersion reference
- Not delete transformation metadata required for normalization

Schema registry must not delete active or referenced schemaVersion.

---

# 10. Observability

Track:

- normalization_duration
- normalization_count
- schema_migration_invocations
- schema_version_distribution

This enables detection of lagging entities.

---

# 11. Forbidden Patterns

- Client-side schema adaptation
- Returning mixed schema representations
- Mutating historical schemaVersion
- Breaking change without transformation function
- Skipping transformation chain
- Overwriting stored schemaVersion retroactively

---

# 12. Definition of Done

Schema normalization is compliant if:

- Client always receives latest schema
- Transformation chain deterministic
- No client migration logic exists
- Rollback normalizes to latest schema
- Historical reconstruction preserved
- Audit emitted for schema evolution
