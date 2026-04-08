export { createDatabaseConnection } from './db/connection.js';
export type { DatabaseConnection } from './db/connection.js';
export type { CellRuntimeDatabase, AuditLogRow, NewAuditLog } from './db/schema.js';

export { EntitySchemaManager, tableName } from './entity/entity-schema-manager.js';
export { EntityRepository } from './entity/entity-repository.js';
export type { ListOptions, ListResult } from './entity/entity-repository.js';
export { EntityService } from './entity/entity-service.js';

export { AuditService } from './audit/audit-service.js';
export type { AuditEntry, ChangeKind } from './audit/audit-service.js';

export { EntityNotFoundError, VersionConflictError } from './errors.js';
