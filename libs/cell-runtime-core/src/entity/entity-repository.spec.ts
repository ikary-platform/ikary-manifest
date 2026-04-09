import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';
import { EntitySchemaManager } from './entity-schema-manager.js';
import { EntityRepository } from './entity-repository.js';
import { EntityNotFoundError, VersionConflictError } from '../errors.js';
import type { CellRuntimeDatabase } from '../db/schema.js';
import type { CellManifestV1 } from '@ikary/contract';

const MANIFEST = {
  spec: {
    entities: [{
      key: 'item',
      name: 'Item',
      pluralName: 'Items',
      fields: [
        { key: 'name', type: 'string', name: 'Name' },
        { key: 'count', type: 'number', name: 'Count' },
      ],
    }],
  },
} as unknown as CellManifestV1;

describe('EntityRepository', () => {
  let dbService: DatabaseService<CellRuntimeDatabase>;
  let repo: EntityRepository;

  beforeEach(async () => {
    dbService = new DatabaseService<CellRuntimeDatabase>(
      databaseConnectionOptionsSchema.parse({ connectionString: 'sqlite://:memory:' }),
    );
    const manager = new EntitySchemaManager(dbService);
    await manager.ensureSystemTables();
    await manager.initFromManifest(MANIFEST);
    repo = new EntityRepository(dbService);
  });

  afterEach(async () => {
    await dbService.destroy();
  });

  // ── insert ──────────────────────────────────────────────────────────────

  describe('insert', () => {
    it('returns a row with system fields', async () => {
      const row = await repo.insert('item', { id: 'a1', name: 'Wrench', count: 3 });
      expect(row['id']).toBe('a1');
      expect(row['version']).toBe(1);
      expect(row['created_at']).toBeDefined();
      expect(row['updated_at']).toBeDefined();
    });

    it('sets deleted_at to null', async () => {
      const row = await repo.insert('item', { id: 'a2', name: 'Bolt' });
      expect(row['deleted_at']).toBeNull();
    });
  });

  // ── findById ────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the inserted row', async () => {
      await repo.insert('item', { id: 'b1', name: 'Nut' });
      const found = await repo.findById('item', 'b1');
      expect(found).not.toBeNull();
      expect(found?.['name']).toBe('Nut');
    });

    it('returns null for an unknown id', async () => {
      expect(await repo.findById('item', 'nonexistent')).toBeNull();
    });

    it('returns null for a soft-deleted row', async () => {
      await repo.insert('item', { id: 'b2', name: 'Pin' });
      await repo.softDelete('item', 'b2');
      expect(await repo.findById('item', 'b2')).toBeNull();
    });
  });

  // ── list ────────────────────────────────────────────────────────────────

  describe('list', () => {
    beforeEach(async () => {
      await repo.insert('item', { id: 'c1', name: 'A', count: 1 });
      await repo.insert('item', { id: 'c2', name: 'B', count: 2 });
      await repo.insert('item', { id: 'c3', name: 'C', count: 3 });
    });

    it('returns all non-deleted rows', async () => {
      const result = await repo.list('item');
      expect(result.data).toHaveLength(3);
    });

    it('excludes soft-deleted rows by default', async () => {
      await repo.softDelete('item', 'c1');
      const result = await repo.list('item');
      expect(result.data).toHaveLength(2);
    });

    it('includes deleted rows when includeDeleted=true', async () => {
      await repo.softDelete('item', 'c1');
      const result = await repo.list('item', { includeDeleted: true });
      expect(result.data).toHaveLength(3);
    });

    it('paginates: page=1, limit=2 returns first two', async () => {
      const result = await repo.list('item', { page: 1, limit: 2, sort: 'count', order: 'asc' });
      expect(result.data).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
    });

    it('paginates: page=2, limit=2 returns the third', async () => {
      const result = await repo.list('item', { page: 2, limit: 2, sort: 'count', order: 'asc' });
      expect(result.data).toHaveLength(1);
    });

    it('total reflects non-deleted count', async () => {
      await repo.softDelete('item', 'c1');
      const result = await repo.list('item');
      expect(result.total).toBe(2);
    });

    it('sorts by custom field ascending', async () => {
      const result = await repo.list('item', { sort: 'count', order: 'asc' });
      expect(result.data[0]?.['count']).toBe(1);
    });

    it('sorts by custom field descending', async () => {
      const result = await repo.list('item', { sort: 'count', order: 'desc' });
      expect(result.data[0]?.['count']).toBe(3);
    });

    it('accepts limit=200 (maximum allowed)', async () => {
      const result = await repo.list('item', { limit: 200 });
      expect(result.limit).toBe(200);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────

  describe('update', () => {
    it('increments version and updates fields', async () => {
      await repo.insert('item', { id: 'd1', name: 'Bolt', count: 1 });
      const updated = await repo.update('item', 'd1', { name: 'Super Bolt' });
      expect(updated['version']).toBe(2);
      expect(updated['name']).toBe('Super Bolt');
    });

    it('succeeds with correct expectedVersion', async () => {
      await repo.insert('item', { id: 'd2', name: 'Nut', count: 2 });
      await expect(repo.update('item', 'd2', { count: 5 }, 1)).resolves.not.toThrow();
    });

    it('throws VersionConflictError with wrong expectedVersion', async () => {
      await repo.insert('item', { id: 'd3', name: 'Washer' });
      await expect(repo.update('item', 'd3', { name: 'X' }, 99)).rejects.toThrow(VersionConflictError);
    });

    it('succeeds without expectedVersion (no version check)', async () => {
      await repo.insert('item', { id: 'd4', name: 'Screw' });
      await expect(repo.update('item', 'd4', { count: 10 })).resolves.not.toThrow();
    });

    it('throws EntityNotFoundError for unknown id', async () => {
      await expect(repo.update('item', 'unknown', { name: 'X' })).rejects.toThrow(EntityNotFoundError);
    });
  });

  // ── softDelete ──────────────────────────────────────────────────────────

  describe('softDelete', () => {
    it('sets deleted_at so findById returns null', async () => {
      await repo.insert('item', { id: 'e1', name: 'Nail' });
      await repo.softDelete('item', 'e1');
      expect(await repo.findById('item', 'e1')).toBeNull();
    });

    it('succeeds with correct expectedVersion', async () => {
      await repo.insert('item', { id: 'e2', name: 'Clip' });
      await expect(repo.softDelete('item', 'e2', 1)).resolves.not.toThrow();
    });

    it('throws VersionConflictError with wrong expectedVersion', async () => {
      await repo.insert('item', { id: 'e3', name: 'Tack' });
      await expect(repo.softDelete('item', 'e3', 99)).rejects.toThrow(VersionConflictError);
    });

    it('succeeds without expectedVersion', async () => {
      await repo.insert('item', { id: 'e4', name: 'Staple' });
      await expect(repo.softDelete('item', 'e4')).resolves.not.toThrow();
    });

    it('throws EntityNotFoundError for unknown id', async () => {
      await expect(repo.softDelete('item', 'unknown')).rejects.toThrow(EntityNotFoundError);
    });
  });

  // ── restoreSnapshot ─────────────────────────────────────────────────────

  describe('restoreSnapshot', () => {
    it('restores data and sets the new version', async () => {
      await repo.insert('item', { id: 'f1', name: 'Pin' });
      const restored = await repo.restoreSnapshot(
        'item',
        'f1',
        { id: 'f1', name: 'Pin v1', count: 0 },
        5,
      );
      expect(restored['version']).toBe(5);
      expect(restored['name']).toBe('Pin v1');
      expect(restored['deleted_at']).toBeNull();
    });
  });
});
