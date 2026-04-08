import type { Kysely } from 'kysely';
import type { CellRuntimeDatabase } from '../db/schema.js';
import { EntityNotFoundError, VersionConflictError } from '../errors.js';
import { tableName } from './entity-schema-manager.js';

export interface ListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

type AnyDb = Kysely<any>;

export class EntityRepository {
  constructor(private readonly db: Kysely<CellRuntimeDatabase>) {}

  async list(entityKey: string, opts: ListOptions = {}): Promise<ListResult<Record<string, unknown>>> {
    const db = this.db as AnyDb;
    const table = tableName(entityKey);
    const page = opts.page ?? 1;
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = (page - 1) * limit;
    const sort = opts.sort ?? 'created_at';
    const order = opts.order ?? 'desc';

    let baseQuery = db.selectFrom(table).selectAll();

    if (!opts.includeDeleted) {
      baseQuery = baseQuery.where('deleted_at', 'is', null);
    }

    const [rows, countResult] = await Promise.all([
      baseQuery.orderBy(sort as any, order).limit(limit).offset(offset).execute(),
      db
        .selectFrom(table)
        .select((eb: any) => eb.fn.countAll().as('total'))
        .where('deleted_at', 'is', null)
        .executeTakeFirst(),
    ]);

    return {
      data: rows as Record<string, unknown>[],
      total: Number((countResult as any)?.total ?? 0),
      page,
      limit,
    };
  }

  async findById(entityKey: string, id: string): Promise<Record<string, unknown> | null> {
    const db = this.db as AnyDb;
    const table = tableName(entityKey);

    const row = await db
      .selectFrom(table)
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return (row as Record<string, unknown>) ?? null;
  }

  async insert(entityKey: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const db = this.db as AnyDb;
    const table = tableName(entityKey);
    const now = new Date().toISOString();
    const row = { ...data, version: 1, created_at: now, updated_at: now, deleted_at: null };

    await db.insertInto(table).values(row).execute();

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

    const db = this.db as AnyDb;
    const table = tableName(entityKey);
    const newVersion = (current['version'] as number) + 1;
    const now = new Date().toISOString();
    const updates = { ...patch, version: newVersion, updated_at: now };

    if (expectedVersion !== undefined) {
      const result = await db
        .updateTable(table)
        .set(updates)
        .where('id', '=', id)
        .where('version', '=', expectedVersion)
        .executeTakeFirst();

      if (!result || Number(result.numUpdatedRows) === 0) {
        throw new VersionConflictError(entityKey, id, expectedVersion, current['version'] as number);
      }
    } else {
      await db.updateTable(table).set(updates).where('id', '=', id).execute();
    }

    return { ...current, ...updates };
  }

  async softDelete(entityKey: string, id: string, expectedVersion?: number): Promise<void> {
    const current = await this.findById(entityKey, id);
    if (!current) throw new EntityNotFoundError(entityKey, id);

    if (expectedVersion !== undefined && current['version'] !== expectedVersion) {
      throw new VersionConflictError(entityKey, id, expectedVersion, current['version'] as number);
    }

    const db = this.db as AnyDb;
    const table = tableName(entityKey);
    const now = new Date().toISOString();

    let q = db
      .updateTable(table)
      .set({ deleted_at: now, updated_at: now })
      .where('id', '=', id);

    if (expectedVersion !== undefined) {
      q = q.where('version', '=', expectedVersion);
    }

    const result = await q.executeTakeFirst();

    if (expectedVersion !== undefined && Number((result as any)?.numUpdatedRows ?? 1) === 0) {
      throw new VersionConflictError(entityKey, id, expectedVersion, current['version'] as number);
    }
  }

  async restoreSnapshot(
    entityKey: string,
    id: string,
    snapshot: Record<string, unknown>,
    newVersion: number,
  ): Promise<Record<string, unknown>> {
    const db = this.db as AnyDb;
    const table = tableName(entityKey);
    const now = new Date().toISOString();
    const restoredData = { ...snapshot, version: newVersion, updated_at: now, deleted_at: null };

    await db.updateTable(table).set(restoredData).where('id', '=', id).execute();

    return restoredData;
  }
}
