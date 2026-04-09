import type { DatabaseService } from '@ikary/system-db-core';
import type { CellRuntimeDatabase } from '../db/schema.js';
import { EntityNotFoundError, VersionConflictError } from '../errors.js';
import { tableName } from './entity-schema-manager.js';
import { listOptionsSchema } from '../shared/list-options.schema.js';
import type { ListOptions, ListOptionsInput, ListResult } from '../shared/list-options.schema.js';

export type { ListOptions, ListOptionsInput, ListResult };

export class EntityRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get db(): any {
    return this.dbService.db;
  }

  constructor(private readonly dbService: DatabaseService<CellRuntimeDatabase>) {}

  async list(entityKey: string, opts: ListOptionsInput = {}): Promise<ListResult<Record<string, unknown>>> {
    const parsed = listOptionsSchema.parse(opts);
    const table = tableName(entityKey);
    const { page, limit, sort, order, includeDeleted } = parsed;
    const offset = (page - 1) * limit;

    let baseQuery = this.db.selectFrom(table).selectAll();

    if (!includeDeleted) {
      baseQuery = baseQuery.where('deleted_at', 'is', null);
    }

    const [rows, countResult] = await Promise.all([
      baseQuery.orderBy(sort, order).limit(limit).offset(offset).execute(),
      this.db
        .selectFrom(table)
        .select((eb: any) => eb.fn.countAll().as('total'))
        .where('deleted_at', 'is', null)
        .executeTakeFirst(),
    ]);

    return {
      data: rows as Record<string, unknown>[],
      /* v8 ignore next */
      total: Number((countResult as any)?.total ?? 0),
      page,
      limit,
    };
  }

  async findById(entityKey: string, id: string): Promise<Record<string, unknown> | null> {
    const table = tableName(entityKey);

    const row = await this.db
      .selectFrom(table)
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return (row as Record<string, unknown>) ?? null;
  }

  async insert(entityKey: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const table = tableName(entityKey);
    const now = new Date().toISOString();
    const row = { ...data, version: 1, created_at: now, updated_at: now, deleted_at: null };

    await this.db.insertInto(table).values(row).execute();

    return row;
  }

  async update(
    entityKey: string,
    id: string,
    patch: Record<string, unknown>,
    expectedVersion?: number,
  ): Promise<Record<string, unknown>> {
    const current = await this.findById(entityKey, id);
    if (!current) throw new EntityNotFoundError(entityKey, id);

    if (expectedVersion !== undefined && current['version'] !== expectedVersion) {
      throw new VersionConflictError(entityKey, id, expectedVersion, current['version'] as number);
    }

    const table = tableName(entityKey);
    const newVersion = (current['version'] as number) + 1;
    const now = new Date().toISOString();
    const updates = { ...patch, version: newVersion, updated_at: now };

    if (expectedVersion !== undefined) {
      await this.db
        .updateTable(table)
        .set(updates)
        .where('id', '=', id)
        .where('version', '=', expectedVersion)
        .execute();
    } else {
      await this.db.updateTable(table).set(updates).where('id', '=', id).execute();
    }

    return { ...current, ...updates };
  }

  async softDelete(entityKey: string, id: string, expectedVersion?: number): Promise<void> {
    const current = await this.findById(entityKey, id);
    if (!current) throw new EntityNotFoundError(entityKey, id);

    if (expectedVersion !== undefined && current['version'] !== expectedVersion) {
      throw new VersionConflictError(entityKey, id, expectedVersion, current['version'] as number);
    }

    const table = tableName(entityKey);
    const now = new Date().toISOString();

    let q = this.db
      .updateTable(table)
      .set({ deleted_at: now, updated_at: now })
      .where('id', '=', id);

    if (expectedVersion !== undefined) {
      q = q.where('version', '=', expectedVersion);
    }

    await q.execute();
  }

  async restoreSnapshot(
    entityKey: string,
    id: string,
    snapshot: Record<string, unknown>,
    newVersion: number,
  ): Promise<Record<string, unknown>> {
    const table = tableName(entityKey);
    const now = new Date().toISOString();
    const restoredData = { ...snapshot, version: newVersion, updated_at: now, deleted_at: null };

    await this.db.updateTable(table).set(restoredData).where('id', '=', id).execute();

    return restoredData;
  }
}
