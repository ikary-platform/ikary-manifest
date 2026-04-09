import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PREVIEW_BASE, writeTestManifest, deleteTestManifest } from '../helpers/fixtures.js';
import { startPreviewServer, type ServerHandle } from '../helpers/server-manager.js';

describe('preview-server — GET /manifest.json', () => {
  let handle: ServerHandle;
  let manifestPath: string;

  beforeAll(async () => {
    manifestPath = writeTestManifest();
    handle = await startPreviewServer(manifestPath);
  });

  afterAll(async () => {
    await handle.stop();
    deleteTestManifest(manifestPath);
  });

  it('returns 200', async () => {
    const res = await fetch(`${PREVIEW_BASE}/manifest.json`);
    expect(res.status).toBe(200);
  });

  it('Content-Type is application/json', async () => {
    const res = await fetch(`${PREVIEW_BASE}/manifest.json`);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
  });

  it('response has apiVersion ikary.co/v1alpha1', async () => {
    const res = await fetch(`${PREVIEW_BASE}/manifest.json`);
    const body = await res.json() as Record<string, unknown>;
    expect(body['apiVersion']).toBe('ikary.co/v1alpha1');
  });

  it('response has compiled spec', async () => {
    const res = await fetch(`${PREVIEW_BASE}/manifest.json`);
    const body = await res.json() as Record<string, unknown>;
    expect(body['spec']).toBeDefined();
  });
});
