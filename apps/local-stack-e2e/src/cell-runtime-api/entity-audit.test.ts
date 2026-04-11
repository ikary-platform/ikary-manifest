import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { API_BASE, writeTestManifest, deleteTestManifest, withAuth } from '../helpers/fixtures.js';
import { startApiServer, type ServerHandle } from '../helpers/server-manager.js';

const ITEMS_URL = `${API_BASE}/entities/item/records`;

describe('cell-runtime-api — entity audit and rollback', () => {
  let handle: ServerHandle;
  let manifestPath: string;

  beforeAll(async () => {
    manifestPath = writeTestManifest();
    handle = await startApiServer(manifestPath);
  });

  afterAll(async () => {
    await handle.stop();
    deleteTestManifest(manifestPath);
  });

  describe('audit log', () => {
    it('GET audit log after create returns one entity.created entry', async () => {
      const createRes = await fetch(ITEMS_URL, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'Pin', count: 1 }),
      });
      const record = await createRes.json() as Record<string, unknown>;
      const id = record['id'] as string;

      const auditRes = await fetch(`${ITEMS_URL}/${id}/audit`, { headers: withAuth(handle.token) });
      expect(auditRes.status).toBe(200);
      const audit = await auditRes.json() as Array<Record<string, unknown>>;
      expect(audit).toHaveLength(1);
      expect(audit[0]?.['eventType']).toBe('entity.created');
    });

    it('audit log grows after update', async () => {
      const createRes = await fetch(ITEMS_URL, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'Tack', count: 5 }),
      });
      const record = await createRes.json() as Record<string, unknown>;
      const id = record['id'] as string;

      await fetch(`${ITEMS_URL}/${id}`, {
        method: 'PATCH',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ count: 10 }),
      });

      const auditRes = await fetch(`${ITEMS_URL}/${id}/audit`, { headers: withAuth(handle.token) });
      const audit = await auditRes.json() as Array<Record<string, unknown>>;
      expect(audit).toHaveLength(2);
      expect(audit[1]?.['eventType']).toBe('entity.updated');
    });
  });

  describe('rollback', () => {
    it('POST rollback restores v1 snapshot', async () => {
      const createRes = await fetch(ITEMS_URL, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'Clip v1', count: 1 }),
      });
      const record = await createRes.json() as Record<string, unknown>;
      const id = record['id'] as string;

      await fetch(`${ITEMS_URL}/${id}`, {
        method: 'PATCH',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'Clip v2', count: 2 }),
      });

      const rollbackRes = await fetch(`${ITEMS_URL}/${id}/rollback`, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ targetVersion: 1 }),
      });
      expect(rollbackRes.status).toBe(201);
      const restored = await rollbackRes.json() as Record<string, unknown>;
      expect(restored['name']).toBe('Clip v1');
    });

    it('audit log after rollback has entity.rolled_back entry', async () => {
      const createRes = await fetch(ITEMS_URL, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'Staple v1', count: 10 }),
      });
      const record = await createRes.json() as Record<string, unknown>;
      const id = record['id'] as string;

      await fetch(`${ITEMS_URL}/${id}`, {
        method: 'PATCH',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'Staple v2' }),
      });

      await fetch(`${ITEMS_URL}/${id}/rollback`, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ targetVersion: 1 }),
      });

      const auditRes = await fetch(`${ITEMS_URL}/${id}/audit`, { headers: withAuth(handle.token) });
      const audit = await auditRes.json() as Array<Record<string, unknown>>;
      expect(audit.at(-1)?.['eventType']).toBe('entity.rolled_back');
    });

    it('rollback to non-existent version returns 404', async () => {
      const createRes = await fetch(ITEMS_URL, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'Nail' }),
      });
      const record = await createRes.json() as Record<string, unknown>;
      const id = record['id'] as string;

      const rollbackRes = await fetch(`${ITEMS_URL}/${id}/rollback`, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ targetVersion: 999 }),
      });
      expect(rollbackRes.status).toBe(404);
    });
  });
});
