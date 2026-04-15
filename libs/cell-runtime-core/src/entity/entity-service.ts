import { randomUUID } from 'node:crypto';
import type { DatabaseService } from '@ikary/system-db-core';
import type { DomainEventEnvelope } from '@ikary/cell-contract';
import type { CellRuntimeDatabase, AuditLogRow } from '../db/schema.js';
import type { EntityRepository } from './entity-repository.js';
import type { ListOptionsInput, ListResult } from '../shared/list-options.schema.js';
import type { AuditService } from '../audit/audit-service.js';
import type { OutboxRepository } from '../outbox/outbox-repository.js';
import type { EntityRuntimeContext } from './entity-runtime-context.js';
import { EntityNotFoundError } from '../errors.js';

function computeDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, unknown> {
  const diff: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (before[key] !== after[key]) {
      diff[key] = { before: before[key], after: after[key] };
    }
  }
  return diff;
}

function stripFields(
  record: Record<string, unknown>,
  exclude: string[] | undefined,
): Record<string, unknown> {
  if (!exclude?.length) return record;
  return Object.fromEntries(Object.entries(record).filter(([k]) => !exclude.includes(k)));
}

function buildEnvelope(
  operation: 'created' | 'updated' | 'deleted' | 'rolled_back',
  entityKey: string,
  record: Record<string, unknown>,
  previous: Record<string, unknown>,
  ctx: EntityRuntimeContext | undefined,
): DomainEventEnvelope {
  const exclude = ctx?.excludeFields;
  return {
    event_id: randomUUID(),
    event_name: ctx?.eventNames?.[operation] ?? `entity.${operation}`,
    version: record['version'] as number,
    timestamp: new Date().toISOString(),
    // Fall back to 'local' in preview / OSS mode — platform populates real values
    tenant_id: ctx?.tenantId ?? 'local',
    workspace_id: ctx?.workspaceId ?? 'local',
    cell_id: ctx?.cellId ?? 'local',
    actor: {
      type: ctx?.actorId ? 'user' : 'system',
      id: ctx?.actorId ?? 'system',
    },
    entity: { type: entityKey, id: record['id'] as string },
    data: stripFields(record, exclude),
    previous: stripFields(previous, exclude),
    metadata: { requestId: ctx?.requestId ?? null },
  };
}

/** Optional structured logger for entity operations — decoupled from NestJS. */
export interface EntityLogger {
  log(message: string, context?: { operation: string; [key: string]: unknown }): void;
  error(message: string, context?: { operation: string; [key: string]: unknown }): void;
}

export class EntityService {
  constructor(
    private readonly db: DatabaseService<CellRuntimeDatabase>,
    private readonly repository: EntityRepository,
    private readonly audit: AuditService,
    private readonly outbox?: OutboxRepository,
    private readonly logger?: EntityLogger,
  ) {}

  async list(entityKey: string, opts?: ListOptionsInput): Promise<ListResult<Record<string, unknown>>> {
    return this.repository.list(entityKey, opts);
  }

  async findById(entityKey: string, id: string): Promise<Record<string, unknown> | null> {
    return this.repository.findById(entityKey, id);
  }

  async create(
    entityKey: string,
    data: Record<string, unknown>,
    ctx?: EntityRuntimeContext,
  ): Promise<Record<string, unknown>> {
    const id = (data.id as string | undefined) ?? randomUUID();
    const payload = { ...data, id };

    const record = await this.db.withTransaction(async (trx) => {
      const inserted = await this.repository.insert(entityKey, payload, trx);

      await this.audit.insert(
        {
          entityKey,
          entityId: id,
          eventType: 'entity.created',
          resourceVersion: 1,
          changeKind: 'snapshot',
          snapshot: inserted,
          actorId: ctx?.actorId,
          requestId: ctx?.requestId,
        },
        trx,
      );

      if (this.outbox) {
        await this.outbox.insert(buildEnvelope('created', entityKey, inserted, {}, ctx), trx);
      }

      return inserted;
    });

    this.logger?.log('Entity created', { operation: 'entity.create', entityKey, entityId: id });

    return record;
  }

  async update(
    entityKey: string,
    id: string,
    patch: Record<string, unknown>,
    expectedVersion?: number,
    ctx?: EntityRuntimeContext,
  ): Promise<Record<string, unknown>> {
    // Read current state outside the transaction — throws EntityNotFoundError early
    const before = await this.repository.findById(entityKey, id);
    if (!before) throw new EntityNotFoundError(entityKey, id);

    const after = await this.db.withTransaction(async (trx) => {
      const updated = await this.repository.update(entityKey, id, patch, expectedVersion, trx);

      await this.audit.insert(
        {
          entityKey,
          entityId: id,
          eventType: 'entity.updated',
          resourceVersion: updated.version as number,
          changeKind: 'patch',
          snapshot: updated,
          diff: computeDiff(before, updated),
          actorId: ctx?.actorId,
          requestId: ctx?.requestId,
        },
        trx,
      );

      if (this.outbox) {
        await this.outbox.insert(buildEnvelope('updated', entityKey, updated, before, ctx), trx);
      }

      return updated;
    });

    this.logger?.log('Entity updated', { operation: 'entity.update', entityKey, entityId: id });

    return after;
  }

  async delete(
    entityKey: string,
    id: string,
    expectedVersion?: number,
    ctx?: EntityRuntimeContext,
  ): Promise<void> {
    const record = await this.repository.findById(entityKey, id);
    if (!record) throw new EntityNotFoundError(entityKey, id);

    await this.db.withTransaction(async (trx) => {
      await this.repository.softDelete(entityKey, id, expectedVersion, trx);

      const deletedSnapshot = { ...record, deleted_at: new Date().toISOString() };

      await this.audit.insert(
        {
          entityKey,
          entityId: id,
          eventType: 'entity.deleted',
          resourceVersion: (record.version as number) + 1,
          changeKind: 'snapshot',
          snapshot: deletedSnapshot,
          actorId: ctx?.actorId,
          requestId: ctx?.requestId,
        },
        trx,
      );

      if (this.outbox) {
        await this.outbox.insert(buildEnvelope('deleted', entityKey, deletedSnapshot, record, ctx), trx);
      }
    });

    this.logger?.log('Entity deleted', { operation: 'entity.delete', entityKey, entityId: id });
  }

  async rollback(
    entityKey: string,
    id: string,
    targetVersion: number,
    expectedVersion?: number,
    ctx?: EntityRuntimeContext,
  ): Promise<Record<string, unknown>> {
    const current = await this.repository.findById(entityKey, id);
    if (!current) throw new EntityNotFoundError(entityKey, id);

    const auditEntry = await this.audit.findByVersion(entityKey, id, targetVersion);
    if (!auditEntry) {
      throw new EntityNotFoundError(entityKey, `${id}@v${targetVersion}`);
    }

    const snapshot = JSON.parse(auditEntry.snapshot) as Record<string, unknown>;
    const newVersion = (current['version'] as number) + 1;

    const restored = await this.db.withTransaction(async (trx) => {
      const result = await this.repository.restoreSnapshot(entityKey, id, snapshot, newVersion, trx);

      await this.audit.insert(
        {
          entityKey,
          entityId: id,
          eventType: 'entity.rolled_back',
          resourceVersion: newVersion,
          changeKind: 'rollback',
          snapshot: result,
          diff: computeDiff(current, result),
          actorId: ctx?.actorId,
          requestId: ctx?.requestId,
        },
        trx,
      );

      if (this.outbox) {
        await this.outbox.insert(buildEnvelope('rolled_back', entityKey, result, current, ctx), trx);
      }

      return result;
    });

    this.logger?.log('Entity rolled back', {
      operation: 'entity.rollback',
      entityKey,
      entityId: id,
      targetVersion,
    });

    return restored;
  }

  async getAuditLog(entityKey: string, entityId: string): Promise<AuditLogRow[]> {
    return this.audit.list(entityKey, entityId);
  }
}
