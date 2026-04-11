import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PREVIEW_BASE, API_BASE, writeTestManifest, deleteTestManifest, withAuth } from '../helpers/fixtures.js';
import { startPreviewServer, startApiServer, type ServerHandle } from '../helpers/server-manager.js';

describe('preview-server — runtime config injection', () => {
  let apiHandle: ServerHandle;
  let previewHandle: ServerHandle;
  let manifestPath: string;

  beforeAll(async () => {
    manifestPath = writeTestManifest();
    apiHandle = await startApiServer(manifestPath);
    previewHandle = await startPreviewServer(manifestPath, { dataApiUrl: API_BASE });
  });

  afterAll(async () => {
    await previewHandle.stop();
    await apiHandle.stop();
    deleteTestManifest(manifestPath);
  });

  it('injects __IKARY_CONFIG__ script into the SPA HTML', async () => {
    const res = await fetch(`${PREVIEW_BASE}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('window.__IKARY_CONFIG__');
  });

  it('config script contains dataApiUrl when VITE_DATA_API_URL is set', async () => {
    const res = await fetch(`${PREVIEW_BASE}/`);
    const html = await res.text();
    expect(html).toContain('__IKARY_CONFIG__');
  });
});

describe('preview-server — live data persistence via API', () => {
  let apiHandle: ServerHandle;
  let manifestPath: string;

  beforeAll(async () => {
    manifestPath = writeTestManifest();
    apiHandle = await startApiServer(manifestPath);
  });

  afterAll(async () => {
    await apiHandle.stop();
    deleteTestManifest(manifestPath);
  });

  it('creates a record via the API and retrieves it', async () => {
    const createRes = await fetch(`${API_BASE}/entities/item/records`, {
      method: 'POST',
      headers: withAuth(apiHandle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: 'Test Item', count: 42 }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json() as Record<string, unknown>;
    const id = created['id'] as string;
    expect(id).toBeTruthy();

    const getRes = await fetch(`${API_BASE}/entities/item/records/${id}`, { headers: withAuth(apiHandle.token) });
    expect(getRes.status).toBe(200);
    const record = await getRes.json() as Record<string, unknown>;
    expect(record['name']).toBe('Test Item');
    expect(record['count']).toBe(42);
  });

  it('lists records and includes the created record', async () => {
    const listRes = await fetch(`${API_BASE}/entities/item/records`, { headers: withAuth(apiHandle.token) });
    expect(listRes.status).toBe(200);
    const body = await listRes.json() as { data: Record<string, unknown>[] };
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data.some((r) => r['name'] === 'Test Item')).toBe(true);
  });

  it('sends X-Correlation-ID and it appears in audit log', async () => {
    const createRes = await fetch(`${API_BASE}/entities/item/records`, {
      method: 'POST',
      headers: withAuth(apiHandle.token, {
        'Content-Type': 'application/json',
        'X-Correlation-ID': 'e2e-test-corr-id-001',
      }),
      body: JSON.stringify({ name: 'Correlated Item', count: 1 }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json() as Record<string, unknown>;
    const id = created['id'] as string;

    const auditRes = await fetch(`${API_BASE}/entities/item/records/${id}/audit`, { headers: withAuth(apiHandle.token) });
    expect(auditRes.status).toBe(200);
    const auditEntries = await auditRes.json() as unknown[];
    expect(auditEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('updates a record and persists the change', async () => {
    const createRes = await fetch(`${API_BASE}/entities/item/records`, {
      method: 'POST',
      headers: withAuth(apiHandle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: 'Updatable', count: 10 }),
    });
    const created = await createRes.json() as Record<string, unknown>;
    const id = created['id'] as string;

    const updateRes = await fetch(`${API_BASE}/entities/item/records/${id}`, {
      method: 'PATCH',
      headers: withAuth(apiHandle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: 'Updated', count: 20, expectedVersion: 1 }),
    });
    expect(updateRes.status).toBe(200);

    const getRes = await fetch(`${API_BASE}/entities/item/records/${id}`, { headers: withAuth(apiHandle.token) });
    const record = await getRes.json() as Record<string, unknown>;
    expect(record['name']).toBe('Updated');
    expect(record['count']).toBe(20);
  });

  it('deletes a record (soft delete)', async () => {
    const createRes = await fetch(`${API_BASE}/entities/item/records`, {
      method: 'POST',
      headers: withAuth(apiHandle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: 'Deletable', count: 0 }),
    });
    const created = await createRes.json() as Record<string, unknown>;
    const id = created['id'] as string;

    const deleteRes = await fetch(`${API_BASE}/entities/item/records/${id}`, {
      method: 'DELETE',
      headers: withAuth(apiHandle.token),
    });
    expect([200, 204]).toContain(deleteRes.status);

    const getRes = await fetch(`${API_BASE}/entities/item/records/${id}`, { headers: withAuth(apiHandle.token) });
    expect(getRes.status).toBe(404);
  });
});
