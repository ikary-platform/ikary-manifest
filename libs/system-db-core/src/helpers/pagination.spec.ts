import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { applyPagination, buildPaginatedResponse } from './pagination.js';
import { DatabaseService } from '../kysely/database.service.js';
import { sql } from 'kysely';

// Simple in-memory table for testing applyPagination
interface TestDb {
  items: { id: number; name: string };
}

describe('applyPagination', () => {
  let db: DatabaseService<TestDb>;

  beforeEach(async () => {
    const testUrl = process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test';
    db = new DatabaseService<TestDb>({ connectionString: testUrl, maxPoolSize: 1, ssl: false, slowQueryThresholdMs: 0 });
    await sql`DROP TABLE IF EXISTS items`.execute(db.db);
    await sql`CREATE TABLE items (id SERIAL PRIMARY KEY, name TEXT)`.execute(db.db);
    await sql`INSERT INTO items (id, name) VALUES (1, 'a'), (2, 'b'), (3, 'c'), (4, 'd'), (5, 'e')`.execute(db.db);
  });

  afterEach(async () => {
    await sql`DROP TABLE IF EXISTS items`.execute(db.db);
    await db.destroy();
  });

  it('limits results to pageSize', async () => {
    const query = db.db.selectFrom('items').selectAll();
    const results = await applyPagination(query, { page: 1, pageSize: 2 }).execute();
    expect(results).toHaveLength(2);
  });

  it('offsets results for page 2', async () => {
    const query = db.db.selectFrom('items').selectAll();
    const results = await applyPagination(query, { page: 2, pageSize: 2 }).execute();
    expect(results).toHaveLength(2);
    expect(results[0]?.id).toBe(3);
  });

  it('returns empty array when offset exceeds total rows', async () => {
    const query = db.db.selectFrom('items').selectAll();
    const results = await applyPagination(query, { page: 10, pageSize: 5 }).execute();
    expect(results).toHaveLength(0);
  });
});

describe('buildPaginatedResponse', () => {
  it('hasMore is true when there are more pages', () => {
    const result = buildPaginatedResponse({ data: ['a', 'b'], total: 10, page: 1, pageSize: 2 });
    expect(result.hasMore).toBe(true);
  });

  it('hasMore is false on the last page', () => {
    const result = buildPaginatedResponse({ data: ['a', 'b'], total: 4, page: 2, pageSize: 2 });
    expect(result.hasMore).toBe(false);
  });

  it('hasMore is false when total fits in one page', () => {
    const result = buildPaginatedResponse({ data: ['a'], total: 1, page: 1, pageSize: 10 });
    expect(result.hasMore).toBe(false);
  });

  it('returns data, total, page, pageSize unchanged', () => {
    const data = [{ id: 1 }];
    const result = buildPaginatedResponse({ data, total: 100, page: 3, pageSize: 5 });
    expect(result.data).toBe(data);
    expect(result.total).toBe(100);
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(5);
  });
});
