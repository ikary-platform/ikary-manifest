export type { CellRuntimeDatabase, AuditLogRow, NewAuditLog, OutboxRow } from './db/schema.js';

export { EntitySchemaManager, tableName, fieldTypeToSql } from './entity/entity-schema-manager.js';
export { EntityRepository } from './entity/entity-repository.js';
export type { ListOptions, ListOptionsInput, ListResult } from './shared/list-options.schema.js';
export { listOptionsSchema } from './shared/list-options.schema.js';
export { EntityService, type EntityLogger } from './entity/entity-service.js';
export type { EntityRuntimeContext } from './entity/entity-runtime-context.js';

export { AuditService } from './audit/audit-service.js';
export type { AuditEntry, ChangeKind } from './shared/audit-entry.schema.js';
export { auditEntrySchema, changeKindSchema } from './shared/audit-entry.schema.js';

export { fieldTypeSchema } from './shared/field-type.schema.js';
export type { FieldType } from './shared/field-type.schema.js';

export { EntityNotFoundError, VersionConflictError, InvalidTransitionError, CapabilityNotFoundError } from './errors.js';

// ── Transition execution ──────────────────────────────────────────────────────
export { TransitionService } from './transition/transition-service.js';

// ── Outbox (transactional event staging) ─────────────────────────────────────
export { OutboxRepository } from './outbox/outbox-repository.js';
export { OutboxDomainEventPublisher } from './outbox/outbox-event-publisher.js';
export { NullDomainEventPublisher } from './outbox/null-event-publisher.js';
