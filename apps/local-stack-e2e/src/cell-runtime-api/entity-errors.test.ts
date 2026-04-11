import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { API_BASE, writeTestManifest, deleteTestManifest, withAuth } from '../helpers/fixtures.js';
import { startApiServer, type ServerHandle } from '../helpers/server-manager.js';

const ITEMS_URL = `${API_BASE}/entities/item/records`;

describe('cell-runtime-api — entity error responses', () => {
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

  it('GET by unknown id returns 404', async () => {
    const res = await fetch(`${ITEMS_URL}/nonexistent-id`, { headers: withAuth(handle.token) });
    expect(res.status).toBe(404);
  });

  it('PATCH unknown id returns 404', async () => {
    const res = await fetch(`${ITEMS_URL}/nonexistent-id`, {
      method: 'PATCH',
      headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: 'X' }),
    });
    expect(res.status).toBe(404);
  });

  it('DELETE unknown id returns 404', async () => {
    const res = await fetch(`${ITEMS_URL}/nonexistent-id`, { method: 'DELETE', headers: withAuth(handle.token) });
    expect(res.status).toBe(404);
  });

  it('PATCH with wrong expectedVersion returns 409', async () => {
    const createRes = await fetch(ITEMS_URL, {
      method: 'POST',
      headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: 'Washer', count: 1 }),
    });
    const created = await createRes.json() as Record<string, unknown>;
    const id = created['id'] as string;

    const patchRes = await fetch(`${ITEMS_URL}/${id}`, {
      method: 'PATCH',
      headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: 'X', expectedVersion: 999 }),
    });
    expect(patchRes.status).toBe(409);
  });
});
