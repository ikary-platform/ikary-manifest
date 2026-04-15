import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { API_BASE, writeLifecycleManifest, deleteTestManifest, withAuth } from '../helpers/fixtures.js';
import { startApiServer, type ServerHandle } from '../helpers/server-manager.js';
import { queryOutbox } from '../helpers/db-query.js';

const ARTICLES_URL = `${API_BASE}/entities/article/records`;

describe('cell-runtime-api — lifecycle transitions', () => {
  let handle: ServerHandle;
  let manifestPath: string;

  async function createDraftArticle(title = 'Test Article'): Promise<Record<string, unknown>> {
    const res = await fetch(ARTICLES_URL, {
      method: 'POST',
      headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title, body: 'content', status: 'draft' }),
    });
    return res.json() as Promise<Record<string, unknown>>;
  }

  async function transition(
    id: string,
    transitionKey: string,
  ): Promise<Response> {
    return fetch(`${ARTICLES_URL}/${id}/transitions/${transitionKey}`, {
      method: 'POST',
      headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({}),
    });
  }

  beforeAll(async () => {
    manifestPath = writeLifecycleManifest();
    handle = await startApiServer(manifestPath);
  });

  afterAll(async () => {
    await handle.stop();
    deleteTestManifest(manifestPath);
  });

  // ── happy path ────────────────────────────────────────────────────────────

  describe('happy path', () => {
    it('POST .../transitions/publish returns 200', async () => {
      const record = await createDraftArticle('Publish Me');
      const res = await transition(record['id'] as string, 'publish');
      expect(res.status).toBe(200);
    });

    it('transitions status field from draft to published', async () => {
      const record = await createDraftArticle('Status Check');
      const id = record['id'] as string;

      const res = await transition(id, 'publish');
      const updated = await res.json() as Record<string, unknown>;
      expect(updated['status']).toBe('published');
    });

    it('version increments after transition', async () => {
      const record = await createDraftArticle('Version Check');
      const id = record['id'] as string;

      const res = await transition(id, 'publish');
      const updated = await res.json() as Record<string, unknown>;
      expect(updated['version']).toBe(2);
    });

    it('draft → published → archived via two transitions', async () => {
      const record = await createDraftArticle('Full Lifecycle');
      const id = record['id'] as string;

      const publishRes = await transition(id, 'publish');
      expect(publishRes.status).toBe(200);

      const archiveRes = await transition(id, 'archive');
      expect(archiveRes.status).toBe(200);
      const archived = await archiveRes.json() as Record<string, unknown>;
      expect(archived['status']).toBe('archived');
    });
  });

  // ── error cases ──────────────────────────────────────────────────────────

  describe('error cases', () => {
    it('returns 409 when current state does not match transition.from', async () => {
      const record = await createDraftArticle('Already Published');
      const id = record['id'] as string;

      // Publish once
      await transition(id, 'publish');

      // Try to publish again (current state is now 'published', not 'draft')
      const res = await transition(id, 'publish');
      expect(res.status).toBe(409);
    });

    it('returns 404 for a non-existent transition key', async () => {
      const record = await createDraftArticle('No Such Transition');
      const res = await transition(record['id'] as string, 'nonexistent_transition');
      expect(res.status).toBe(404);
    });

    it('returns 404 for a non-existent record id', async () => {
      const res = await transition('00000000-0000-0000-0000-000000000000', 'publish');
      expect(res.status).toBe(404);
    });
  });

  // ── outbox integration ───────────────────────────────────────────────────

  describe('outbox after transition', () => {
    it('writes article.published event to outbox (uses transition.event name)', async () => {
      const record = await createDraftArticle('Outbox Transition Test');
      const id = record['id'] as string;

      await transition(id, 'publish');

      const rows = await queryOutbox({ event_name: 'article.published', entity_id: id });
      expect(rows).toHaveLength(1);
    });

    it('outbox payload entity.id matches the transitioned record', async () => {
      const record = await createDraftArticle('Payload Entity Check');
      const id = record['id'] as string;

      await transition(id, 'publish');

      const rows = await queryOutbox({ event_name: 'article.published', entity_id: id });
      expect(rows[0]?.payload.entity.id).toBe(id);
    });

    it('writes entity.hook.invoked row for each declared hook', async () => {
      const record = await createDraftArticle('Hook Test');
      const id = record['id'] as string;

      await transition(id, 'publish');

      // publish transition declares hooks: ['notify_subscribers']
      const hookRows = await queryOutbox({ event_name: 'entity.hook.invoked', entity_id: id });
      expect(hookRows).toHaveLength(1);
      const hookData = hookRows[0]?.payload.data as Record<string, unknown>;
      expect(hookData['hook_key']).toBe('notify_subscribers');
    });

    it('archive transition writes article.archived event (no hooks)', async () => {
      const record = await createDraftArticle('Archive Hook Test');
      const id = record['id'] as string;

      await transition(id, 'publish');
      await transition(id, 'archive');

      const archiveRows = await queryOutbox({ event_name: 'article.archived', entity_id: id });
      expect(archiveRows).toHaveLength(1);

      // archive has no hooks
      const allRows = await queryOutbox({ entity_id: id });
      const hookCount = allRows.filter((r) => r.event_name === 'entity.hook.invoked').length;
      // only the publish hook (notify_subscribers)
      expect(hookCount).toBe(1);
    });
  });
});
