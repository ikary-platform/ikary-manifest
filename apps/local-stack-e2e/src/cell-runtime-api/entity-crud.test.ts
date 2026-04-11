import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { API_BASE, writeTestManifest, deleteTestManifest, withAuth } from '../helpers/fixtures.js';
import { startApiServer, type ServerHandle } from '../helpers/server-manager.js';

const ITEMS_URL = `${API_BASE}/entities/item/records`;

describe('cell-runtime-api — entity CRUD', () => {
  let handle: ServerHandle;
  let manifestPath: string;

  async function post(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await fetch(ITEMS_URL, {
      method: 'POST',
      headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json() as Promise<Record<string, unknown>>;
  }

  beforeAll(async () => {
    manifestPath = writeTestManifest();
    handle = await startApiServer(manifestPath);
  });

  afterAll(async () => {
    await handle.stop();
    deleteTestManifest(manifestPath);
  });

  // ── create ───────────────────────────────────────────────────────────────

  describe('POST creates a record', () => {
    it('returns 201 with id and version:1', async () => {
      const res = await fetch(ITEMS_URL, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'Wrench', count: 3 }),
      });
      expect(res.status).toBe(201);
      const body = await res.json() as Record<string, unknown>;
      expect(typeof body['id']).toBe('string');
      expect(body['version']).toBe(1);
      expect(body['name']).toBe('Wrench');
    });
  });

  // ── read ─────────────────────────────────────────────────────────────────

  describe('GET list and GET by id', () => {
    let createdId: string;

    beforeAll(async () => {
      const record = await post({ name: 'Nut', count: 10 });
      createdId = record['id'] as string;
    });

    it('GET list includes the created record', async () => {
      const res = await fetch(ITEMS_URL, { headers: withAuth(handle.token) });
      expect(res.status).toBe(200);
      const body = await res.json() as { data: Record<string, unknown>[]; total: number };
      const found = body.data.find((r) => r['id'] === createdId);
      expect(found).toBeDefined();
      expect(found?.['name']).toBe('Nut');
    });

    it('GET by id returns 200 with matching record', async () => {
      const res = await fetch(`${ITEMS_URL}/${createdId}`, { headers: withAuth(handle.token) });
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body['id']).toBe(createdId);
      expect(body['name']).toBe('Nut');
    });
  });

  // ── update ───────────────────────────────────────────────────────────────

  describe('PATCH updates a record', () => {
    let recordId: string;

    beforeAll(async () => {
      const record = await post({ name: 'Bolt', count: 5 });
      recordId = record['id'] as string;
    });

    it('PATCH updates the field and increments version', async () => {
      const res = await fetch(`${ITEMS_URL}/${recordId}`, {
        method: 'PATCH',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ count: 99 }),
      });
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body['count']).toBe(99);
      expect(body['version']).toBe(2);
    });

    it('PATCH with correct expectedVersion in body succeeds', async () => {
      const res = await fetch(`${ITEMS_URL}/${recordId}`, {
        method: 'PATCH',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ count: 100, expectedVersion: 2 }),
      });
      expect(res.status).toBe(200);
    });
  });

  // ── delete ───────────────────────────────────────────────────────────────

  describe('DELETE removes a record', () => {
    let recordId: string;

    beforeAll(async () => {
      const record = await post({ name: 'Screw', count: 1 });
      recordId = record['id'] as string;
    });

    it('DELETE returns 204', async () => {
      const res = await fetch(`${ITEMS_URL}/${recordId}`, { method: 'DELETE', headers: withAuth(handle.token) });
      expect(res.status).toBe(204);
    });

    it('GET by id after DELETE returns 404', async () => {
      const res = await fetch(`${ITEMS_URL}/${recordId}`, { headers: withAuth(handle.token) });
      expect(res.status).toBe(404);
    });
  });

  // ── pagination ───────────────────────────────────────────────────────────

  describe('pagination and sort', () => {
    beforeAll(async () => {
      await post({ name: 'Alpha', count: 1 });
      await post({ name: 'Beta', count: 2 });
      await post({ name: 'Gamma', count: 3 });
    });

    it('page=1&limit=1 returns one record', async () => {
      const res = await fetch(`${ITEMS_URL}?page=1&limit=1&sort=count&order=asc`, { headers: withAuth(handle.token) });
      expect(res.status).toBe(200);
      const body = await res.json() as { data: Record<string, unknown>[]; total: number; page: number; limit: number };
      expect(body.data).toHaveLength(1);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(1);
      expect(body.total).toBeGreaterThanOrEqual(3);
    });

    it('page=2&limit=1 returns a different record than page=1', async () => {
      const res1 = await fetch(`${ITEMS_URL}?page=1&limit=1&sort=count&order=asc`, { headers: withAuth(handle.token) });
      const res2 = await fetch(`${ITEMS_URL}?page=2&limit=1&sort=count&order=asc`, { headers: withAuth(handle.token) });
      const body1 = await res1.json() as { data: Record<string, unknown>[] };
      const body2 = await res2.json() as { data: Record<string, unknown>[] };
      expect(body2.data).toHaveLength(1);
      expect(body2.data[0]?.['id']).not.toBe(body1.data[0]?.['id']);
    });

    it('sort by name asc returns records in ascending name order', async () => {
      const res = await fetch(`${ITEMS_URL}?sort=name&order=asc`, { headers: withAuth(handle.token) });
      const body = await res.json() as { data: Record<string, unknown>[] };
      const names = body.data.map((r) => r['name'] as string);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });
  });
});
