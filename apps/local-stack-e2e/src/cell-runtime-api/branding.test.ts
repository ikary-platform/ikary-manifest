import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { API_BASE, writeTestManifest, deleteTestManifest, withAuth } from '../helpers/fixtures.js';
import { startApiServer, type ServerHandle } from '../helpers/server-manager.js';

const CELL_ID = '11111111-1111-1111-1111-111111111111';
const URL_BASE = `${API_BASE}/cells/${CELL_ID}/branding`;

interface BrandingResponse {
  data: {
    cellId: string;
    version: number;
    accentColor: string | null;
    titleFontFamily: string | null;
    bodyFontFamily: string | null;
    defaultThemeMode: 'light' | 'dark' | null;
    isCustomized: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

async function getJson(url: string, token: string | null): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, { headers: withAuth(token) });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function patchJson(
  url: string,
  token: string | null,
  payload: Record<string, unknown>,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: withAuth(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function postJson(
  url: string,
  token: string | null,
  payload: Record<string, unknown>,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: withAuth(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

describe('cell-runtime-api — branding', () => {
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

  it('GET returns the system default before any write', async () => {
    const { status, body } = await getJson(URL_BASE, handle.token);
    expect(status).toBe(200);
    const data = (body as BrandingResponse).data;
    expect(data.cellId).toBe(CELL_ID);
    expect(data.version).toBe(0);
    expect(data.accentColor).toBeNull();
    expect(data.titleFontFamily).toBeNull();
    expect(data.bodyFontFamily).toBeNull();
    expect(data.defaultThemeMode).toBeNull();
    expect(data.isCustomized).toBe(false);
  });

  it('PATCH with expectedVersion=0 inserts the row and returns version 1', async () => {
    const { status, body } = await patchJson(URL_BASE, handle.token, {
      expectedVersion: 0,
      accentColor: '#16A34A',
      titleFontFamily: '"Merriweather", serif',
    });
    expect(status).toBe(200);
    const data = (body as BrandingResponse).data;
    expect(data.version).toBe(1);
    expect(data.accentColor).toBe('#16A34A');
    expect(data.titleFontFamily).toBe('"Merriweather", serif');
    expect(data.bodyFontFamily).toBeNull();
    expect(data.isCustomized).toBe(true);
  });

  it('GET after PATCH reflects the persisted state', async () => {
    const { status, body } = await getJson(URL_BASE, handle.token);
    expect(status).toBe(200);
    const data = (body as BrandingResponse).data;
    expect(data.version).toBe(1);
    expect(data.accentColor).toBe('#16A34A');
  });

  it('PATCH with stale expectedVersion returns 409', async () => {
    const { status } = await patchJson(URL_BASE, handle.token, {
      expectedVersion: 0,
      accentColor: '#000000',
    });
    expect(status).toBe(409);
  });

  it('PATCH with invalid hex returns 400', async () => {
    const { status } = await patchJson(URL_BASE, handle.token, {
      expectedVersion: 1,
      accentColor: 'not-a-color',
    });
    expect(status).toBe(400);
  });

  it('PATCH with current version updates and bumps to version 2', async () => {
    const { status, body } = await patchJson(URL_BASE, handle.token, {
      expectedVersion: 1,
      defaultThemeMode: 'dark',
    });
    expect(status).toBe(200);
    const data = (body as BrandingResponse).data;
    expect(data.version).toBe(2);
    expect(data.defaultThemeMode).toBe('dark');
    expect(data.accentColor).toBe('#16A34A');
  });

  it('POST /reset with current version nulls all overrides and bumps version', async () => {
    const { status, body } = await postJson(`${URL_BASE}/reset`, handle.token, {
      expectedVersion: 2,
    });
    expect(status).toBe(200);
    const data = (body as BrandingResponse).data;
    expect(data.version).toBe(3);
    expect(data.accentColor).toBeNull();
    expect(data.titleFontFamily).toBeNull();
    expect(data.bodyFontFamily).toBeNull();
    expect(data.defaultThemeMode).toBeNull();
    expect(data.isCustomized).toBe(false);
  });

  it('POST /reset with stale expectedVersion returns 409', async () => {
    const { status } = await postJson(`${URL_BASE}/reset`, handle.token, {
      expectedVersion: 0,
    });
    expect(status).toBe(409);
  });

  it('GET on a different cellId returns its own defaults independently', async () => {
    const otherCell = '22222222-2222-2222-2222-222222222222';
    const { status, body } = await getJson(`${API_BASE}/cells/${otherCell}/branding`, handle.token);
    expect(status).toBe(200);
    const data = (body as BrandingResponse).data;
    expect(data.cellId).toBe(otherCell);
    expect(data.version).toBe(0);
    expect(data.isCustomized).toBe(false);
  });
});
