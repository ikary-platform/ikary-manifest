import type { DatabaseService, Queryable } from '@ikary/system-db-core';
import type { CellRuntimeDatabase } from '../db/schema.js';
import { EntityNotFoundError, VersionConflictError } from '../errors.js';
import { tableName } from './entity-schema-manager.js';
import { listOptionsSchema } from '../shared/list-options.schema.js';
import type { ListOptions, ListOptionsInput, ListResult } from '../shared/list-options.schema.js';

export type { ListOptions, ListOptionsInput, ListResult };

export class EntityRepository {
  constructor(private readonly dbService: DatabaseService<CellRuntimeDatabase>) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dbFor(qb?: Queryable<CellRuntimeDatabase>): any {
    return qb ?? this.dbService.db;
  }

  async list(entityKey: string, opts: ListOptionsInput = {}): Promise<ListResult<Record<string, unknown>>> {
    const parsed = listOptionsSchema.parse(opts);
    const table = tableName(entityKey);
    const { page, limit, sort, order, includeDeleted } = parsed;
    const offset = (page - 1) * limit;
    const db = this.dbFor();

    let baseQuery = db.selectFrom(table).selectAll();

    if (!includeDeleted) {
      baseQuery = baseQuery.where('deleted_at', 'is', null);
    }

    const [rows, countResult] = await Promise.all([
      baseQuery.orderBy(sort, order).limit(limit).offset(offset).execute(),
      db
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

  async findById(
    entityKey: string,
    id: string,
    qb?: Queryable<CellRuntimeDatabase>,
  ): Promise<Record<string, unknown> | null> {
    const table = tableName(entityKey);
    const db = this.dbFor(qb);

    const row = await db
      .selectFrom(table)
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return (row as Record<string, unknown>) ?? null;
  }

  async insert(
    entityKey: string,
    data: Record<string, unknown>,
    qb?: Queryable<CellRuntimeDatabase>,
  ): Promise<Record<string, unknown>> {
    const table = tableName(entityKey);
    const now = new Date().toISOString();
    const row = { ...data, version: 1, created_at: now, updated_at: now, deleted_at: null };

    await this.dbFor(qb).insertInto(table).values(row).execute();

    return row;
  }

  async update(
    entityKey: string,
    id: string,
    patch: Record<string, unknown>,
    expectedVersion?: number,
    qb?: Queryable<CellRuntimeDatabase>,
  ): Promise<Record<string, unknown>> {
    const db = this.dbFor(qb);
    const current = await this.findById(entityKey, id, qb);
    if (!current) throw new EntityNotFoundError(entityKey, id);

    if (expectedVersion !== undefined && current['version'] !== expectedVersion) {
      throw new VersionConflictError(entityKey, id, expectedVersion, current['version'] as number);
    }

    const table = tableName(entityKey);
    const newVersion = (current['version'] as number) + 1;
    const now = new Date().toISOString();
    const updates = { ...patch, version: newVersion, updated_at: now };

    if (expectedVersion !== undefined) {
      await db
        .updateTable(table)
        .set(updates)
        .where('id', '=', id)
        .where('version', '=', expectedVersion)
        .execute();
    } else {
      await db.updateTable(table).set(updates).where('id', '=', id).execute();
    }

    return { ...current, ...updates };
  }

  async softDelete(
    entityKey: string,
    id: string,
    expectedVersion?: number,
    qb?: Queryable<CellRuntimeDatabase>,
  ): Promise<void> {
    const db = this.dbFor(qb);
    const current = await this.findById(entityKey, id, qb);
    if (!current) throw new EntityNotFoundError(entityKey, id);

    if (expectedVersion !== undefined && current['version'] !== expectedVersion) {
      throw new VersionConflictError(entityKey, id, expectedVersion, current['version'] as number);
    }

    const table = tableName(entityKey);
    const now = new Date().toISOString();

    let q = db
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
    qb?: Queryable<CellRuntimeDatabase>,
  ): Promise<Record<string, unknown>> {
    const table = tableName(entityKey);
    const now = new Date().toISOString();
    const restoredData = { ...snapshot, version: newVersion, updated_at: now, deleted_at: null };

    await this.dbFor(qb).updateTable(table).set(restoredData).where('id', '=', id).execute();

    return restoredData;
  }
}
