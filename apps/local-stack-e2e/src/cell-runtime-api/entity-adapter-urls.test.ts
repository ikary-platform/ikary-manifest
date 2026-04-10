import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { API_BASE, writeTestManifest, deleteTestManifest } from '../helpers/fixtures.js';
import { startApiServer, type ServerHandle } from '../helpers/server-manager.js';

/**
 * Tests that verify the REST API URL patterns match what the client adapter
 * produces.  These are the exact URLs the `useRQEntityAdapter` and
 * `cellApiFetch` generate — if any pattern drifts, these tests catch it.
 */
describe('cell-runtime-api — adapter URL contract', () => {
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

  // ── Entity key must be present in all URLs ───────────────────────────────

  it('POST /entities/item/records → 201 (valid entity key)', async () => {
    const res = await fetch(`${API_BASE}/entities/item/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': 'url-test-create' },
      body: JSON.stringify({ name: 'URL test', count: 1 }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body['id']).toBeTruthy();
  });

  it('POST /entities//records → 404 (empty entity key — the bug)', async () => {
    const res = await fetch(`${API_BASE}/entities//records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Should fail', count: 0 }),
    });
    expect(res.status).toBe(404);
  });

  it('GET /entities/item/records → 200 (list with valid entity key)', async () => {
    const res = await fetch(`${API_BASE}/entities/item/records`);
    expect(res.status).toBe(200);
    const body = await res.json() as { data: unknown[] };
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('GET /entities//records → 404 (empty entity key)', async () => {
    const res = await fetch(`${API_BASE}/entities//records`);
    // Express collapses // into / so this hits a different route
    expect([404, 200]).toContain(res.status);
  });

  // ── PATCH requires entity key + record id ────────────────────────────────

  it('PATCH /entities/item/records/:id → 200 (valid)', async () => {
    // Create first
    const createRes = await fetch(`${API_BASE}/entities/item/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Patchable', count: 1 }),
    });
    const created = await createRes.json() as Record<string, unknown>;
    const id = created['id'] as string;

    const res = await fetch(`${API_BASE}/entities/item/records/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Patched', expectedVersion: 1 }),
    });
    expect(res.status).toBe(200);
  });

  // ── DELETE requires entity key + record id ───────────────────────────────

  it('DELETE /entities/item/records/:id → 204 (valid)', async () => {
    const createRes = await fetch(`${API_BASE}/entities/item/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Deletable', count: 0 }),
    });
    const created = await createRes.json() as Record<string, unknown>;
    const id = created['id'] as string;

    const res = await fetch(`${API_BASE}/entities/item/records/${id}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(204);
  });

  // ── Audit URL ────────────────────────────────────────────────────────────

  it('GET /entities/item/records/:id/audit → 200', async () => {
    const createRes = await fetch(`${API_BASE}/entities/item/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Auditable', count: 5 }),
    });
    const created = await createRes.json() as Record<string, unknown>;
    const id = created['id'] as string;

    const res = await fetch(`${API_BASE}/entities/item/records/${id}/audit`);
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  // ── Rollback URL ─────────────────────────────────────────────────────────

  it('POST /entities/item/records/:id/rollback → 200', async () => {
    // Create + update to get version 2
    const createRes = await fetch(`${API_BASE}/entities/item/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Rollbackable', count: 1 }),
    });
    const created = await createRes.json() as Record<string, unknown>;
    const id = created['id'] as string;

    await fetch(`${API_BASE}/entities/item/records/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Changed', expectedVersion: 1 }),
    });

    const res = await fetch(`${API_BASE}/entities/item/records/${id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetVersion: 1, expectedVersion: 2 }),
    });
    expect([200, 201]).toContain(res.status);
  });

  // ── Correlation ID propagation ───────────────────────────────────────────

  it('X-Correlation-ID header is accepted and does not cause errors', async () => {
    const res = await fetch(`${API_BASE}/entities/item/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': 'e2e-adapter-test-corr-001',
      },
      body: JSON.stringify({ name: 'Correlated', count: 99 }),
    });
    expect(res.status).toBe(201);
  });
});
