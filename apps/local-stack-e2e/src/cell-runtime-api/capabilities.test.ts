import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { API_BASE, writeLifecycleManifest, deleteTestManifest, withAuth } from '../helpers/fixtures.js';
import { startApiServer, type ServerHandle } from '../helpers/server-manager.js';
import { queryOutbox } from '../helpers/db-query.js';

const ARTICLES_URL = `${API_BASE}/entities/article/records`;

describe('cell-runtime-api — capabilities', () => {
  let handle: ServerHandle;
  let manifestPath: string;

  async function createDraftArticle(title = 'Test Article'): Promise<Record<string, unknown>> {
    const res = await fetch(ARTICLES_URL, {
      method: 'POST',
      headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title, body: 'content', status: 'draft', featured: false }),
    });
    return res.json() as Promise<Record<string, unknown>>;
  }

  async function executeCapability(
    id: string,
    capabilityKey: string,
    body: Record<string, unknown> = {},
  ): Promise<Response> {
    return fetch(`${ARTICLES_URL}/${id}/capabilities/${capabilityKey}`, {
      method: 'POST',
      headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
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

  // ── type: transition ──────────────────────────────────────────────────────

  describe('type: transition capability', () => {
    it('publish_article capability returns 200 and updated record', async () => {
      const record = await createDraftArticle('Transition Cap Test');
      const id = record['id'] as string;

      const res = await executeCapability(id, 'publish_article');
      expect(res.status).toBe(200);
      const updated = await res.json() as Record<string, unknown>;
      expect(updated['status']).toBe('published');
    });

    it('publish_article fails with 409 when already published', async () => {
      const record = await createDraftArticle('Already Published Cap');
      const id = record['id'] as string;

      await executeCapability(id, 'publish_article');
      const res = await executeCapability(id, 'publish_article');
      expect(res.status).toBe(409);
    });
  });

  // ── type: mutation ────────────────────────────────────────────────────────

  describe('type: mutation capability', () => {
    it('feature_article capability applies declared updates patch', async () => {
      const record = await createDraftArticle('Feature Test');
      const id = record['id'] as string;

      const res = await executeCapability(id, 'feature_article');
      expect(res.status).toBe(200);
      const updated = await res.json() as Record<string, unknown>;
      expect(updated['featured']).toBe(true);
    });

    it('feature_article writes article.updated to outbox', async () => {
      const record = await createDraftArticle('Feature Outbox Test');
      const id = record['id'] as string;

      await executeCapability(id, 'feature_article');

      const rows = await queryOutbox({ event_name: 'article.updated', entity_id: id });
      expect(rows).toHaveLength(1);
    });
  });

  // ── type: workflow ────────────────────────────────────────────────────────

  describe('type: workflow capability', () => {
    it('send_newsletter returns { queued: true, event_id } without calling external service', async () => {
      const record = await createDraftArticle('Newsletter Test');
      const id = record['id'] as string;

      const res = await executeCapability(id, 'send_newsletter');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body['queued']).toBe(true);
      expect(typeof body['event_id']).toBe('string');
    });

    it('send_newsletter writes capability.workflow.triggered to outbox', async () => {
      const record = await createDraftArticle('Newsletter Outbox Test');
      const id = record['id'] as string;

      await executeCapability(id, 'send_newsletter');

      const rows = await queryOutbox({ event_name: 'capability.workflow.triggered', entity_id: id });
      expect(rows).toHaveLength(1);
    });

    it('workflow outbox payload contains capability_key and capability_type', async () => {
      const record = await createDraftArticle('Workflow Payload Test');
      const id = record['id'] as string;

      await executeCapability(id, 'send_newsletter', { recipient: 'test@example.com' });

      const rows = await queryOutbox({ event_name: 'capability.workflow.triggered', entity_id: id });
      const data = rows[0]?.payload.data as Record<string, unknown>;
      expect(data['capability_key']).toBe('send_newsletter');
      expect(data['capability_type']).toBe('workflow');
    });
  });

  // ── type: export ──────────────────────────────────────────────────────────

  describe('type: export capability', () => {
    it('export_pdf returns { queued: true } and writes capability.export.triggered', async () => {
      const record = await createDraftArticle('Export Test');
      const id = record['id'] as string;

      const res = await executeCapability(id, 'export_pdf');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body['queued']).toBe(true);

      const rows = await queryOutbox({ event_name: 'capability.export.triggered', entity_id: id });
      expect(rows).toHaveLength(1);
    });
  });

  // ── type: integration ─────────────────────────────────────────────────────

  describe('type: integration capability', () => {
    it('notify_crm returns { queued: true } and writes capability.integration.triggered', async () => {
      const record = await createDraftArticle('Integration Test');
      const id = record['id'] as string;

      const res = await executeCapability(id, 'notify_crm');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body['queued']).toBe(true);

      const rows = await queryOutbox({ event_name: 'capability.integration.triggered', entity_id: id });
      expect(rows).toHaveLength(1);
    });
  });

  // ── error cases ──────────────────────────────────────────────────────────

  describe('error cases', () => {
    it('returns 404 for non-existent capability key', async () => {
      const record = await createDraftArticle('Bad Cap Test');
      const res = await executeCapability(record['id'] as string, 'no_such_capability');
      expect(res.status).toBe(404);
    });

    it('returns 404 for non-existent entity key in manifest', async () => {
      const res = await fetch(`${API_BASE}/entities/nonexistent/records/some-id/capabilities/foo`, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(404);
    });

    it('returns 404 for non-existent record id (transition capability)', async () => {
      const res = await executeCapability('00000000-0000-0000-0000-000000000000', 'publish_article');
      expect(res.status).toBe(404);
    });

    it('returns 404 for non-existent record id (async/workflow capability)', async () => {
      const res = await executeCapability('00000000-0000-0000-0000-000000000000', 'send_newsletter');
      expect(res.status).toBe(404);
    });
  });
});
