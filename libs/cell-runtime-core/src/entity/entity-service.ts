import { randomUUID } from 'node:crypto';
import type { EntityRepository, ListOptions, ListResult } from './entity-repository.js';
import type { AuditService } from '../audit/audit-service.js';
import type { AuditLogRow } from '../db/schema.js';
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

export class EntityService {
  constructor(
    private readonly repository: EntityRepository,
    private readonly audit: AuditService,
  ) {}

  async list(entityKey: string, opts?: ListOptions): Promise<ListResult<Record<string, unknown>>> {
    return this.repository.list(entityKey, opts);
  }

  async findById(entityKey: string, id: string): Promise<Record<string, unknown> | null> {
    return this.repository.findById(entityKey, id);
  }

  async create(
    entityKey: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const id = (data.id as string | undefined) ?? randomUUID();
    const record = await this.repository.insert(entityKey, { ...data, id });

    await this.audit.insert({
      entityKey,
      entityId: id,
      eventType: 'entity.created',
      resourceVersion: 1,
      changeKind: 'snapshot',
      snapshot: record,
    });

    return record;
  }

  async update(
    entityKey: string,
    id: string,
    patch: Record<string, unknown>,
    expectedVersion?: number,
  ): Promise<Record<string, unknown>> {
    const before = await this.repository.findById(entityKey, id);
    if (!before) throw new EntityNotFoundError(entityKey, id);

    const after = await this.repository.update(entityKey, id, patch, expectedVersion);

    await this.audit.insert({
      entityKey,
      entityId: id,
      eventType: 'entity.updated',
      resourceVersion: after.version as number,
      changeKind: 'patch',
      snapshot: after,
      diff: computeDiff(before, after),
    });

    return after;
  }

  async delete(
    entityKey: string,
    id: string,
    expectedVersion?: number,
  ): Promise<void> {
    const record = await this.repository.findById(entityKey, id);
    if (!record) throw new EntityNotFoundError(entityKey, id);

    await this.repository.softDelete(entityKey, id, expectedVersion);

    await this.audit.insert({
      entityKey,
      entityId: id,
      eventType: 'entity.deleted',
      resourceVersion: (record.version as number) + 1,
      changeKind: 'snapshot',
      snapshot: { ...record, deleted_at: new Date().toISOString() },
    });
  }

  async rollback(
    entityKey: string,
    id: string,
    targetVersion: number,
    expectedVersion?: number,
  ): Promise<Record<string, unknown>> {
    const current = await this.repository.findById(entityKey, id);
    if (!current) throw new EntityNotFoundError(entityKey, id);

    const auditEntry = await this.audit.findByVersion(entityKey, id, targetVersion);
    if (!auditEntry) {
      throw new EntityNotFoundError(entityKey, `${id}@v${targetVersion}`);
    }

    const snapshot = JSON.parse(auditEntry.snapshot) as Record<string, unknown>;
    const newVersion = ((current.version as number | undefined) ?? expectedVersion ?? 1) + 1;

    const restored = await this.repository.restoreSnapshot(entityKey, id, snapshot, newVersion);

    await this.audit.insert({
      entityKey,
      entityId: id,
      eventType: 'entity.rolled_back',
      resourceVersion: newVersion,
      changeKind: 'rollback',
      snapshot: restored,
      diff: computeDiff(current, restored),
    });

    return restored;
  }

  async getAuditLog(entityKey: string, entityId: string): Promise<AuditLogRow[]> {
    return this.audit.list(entityKey, entityId);
  }
}
