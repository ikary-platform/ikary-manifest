import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PREVIEW_BASE, writeTestManifest, deleteTestManifest } from '../helpers/fixtures.js';
import { startPreviewServer, type ServerHandle } from '../helpers/server-manager.js';

describe('preview-server — GET /health', () => {
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

  it('returns 200 with { status: "ok" }', async () => {
    const res = await fetch(`${PREVIEW_BASE}/health`);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toHaveProperty('status', 'ok');
  });
});
