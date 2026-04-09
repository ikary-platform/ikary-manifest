import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, readFileSync } from 'node:fs';
import { PREVIEW_BASE, writeTestManifest, deleteTestManifest } from '../helpers/fixtures.js';
import { startPreviewServer, type ServerHandle } from '../helpers/server-manager.js';

describe('preview-server — GET /manifest-events SSE', () => {
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

  it('sends connected event on initial connection', async () => {
    const controller = new AbortController();
    const res = await fetch(`${PREVIEW_BASE}/manifest-events`, {
      signal: controller.signal,
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/event-stream/);

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    const { value } = await reader.read();
    const text = decoder.decode(value);
    expect(text).toContain('connected');

    controller.abort();
  });

  it('sends manifest:changed event when file is modified', async () => {
    const controller = new AbortController();
    const collected: string[] = [];

    // Connect to SSE stream
    const res = await fetch(`${PREVIEW_BASE}/manifest-events`, {
      signal: controller.signal,
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    // Read the initial "connected" event, then wait for "manifest:changed"
    const changedPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        controller.abort();
        reject(new Error('Timeout waiting for manifest:changed event'));
      }, 8_000);

      async function readLoop() {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const text = decoder.decode(value);
            collected.push(text);
            if (text.includes('manifest:changed')) {
              clearTimeout(timeout);
              resolve();
              return;
            }
          }
        } catch {
          // AbortError when controller is aborted — that's expected
        }
      }

      readLoop();
    });

    // Wait briefly for the SSE connection to be registered server-side
    await new Promise<void>((r) => setTimeout(r, 500));

    // Touch the manifest file to trigger fs.watch
    const content = readFileSync(manifestPath, 'utf8');
    writeFileSync(manifestPath, content, 'utf8');

    await changedPromise;
    controller.abort();

    expect(collected.some((t) => t.includes('manifest:changed'))).toBe(true);
  });
});
