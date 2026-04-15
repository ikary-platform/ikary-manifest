import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { API_BASE, writeLifecycleManifest, deleteTestManifest, withAuth } from '../helpers/fixtures.js';
import { startApiServer, type ServerHandle } from '../helpers/server-manager.js';
import { queryOutbox } from '../helpers/db-query.js';

const ARTICLES_URL = `${API_BASE}/entities/article/records`;

describe('cell-runtime-api — transactional outbox', () => {
  let handle: ServerHandle;
  let manifestPath: string;

  async function createArticle(data: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await fetch(ARTICLES_URL, {
      method: 'POST',
      headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title: 'Hello', status: 'draft', body: 'secret content', ...data }),
    });
    return res.json() as Promise<Record<string, unknown>>;
  }

  beforeAll(async () => {
    manifestPath = writeLifecycleManifest();
    handle = await startApiServer(manifestPath);
  });

  afterAll(async () => {
    await handle.stop();
    deleteTestManifest(manifestPath);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('outbox after create', () => {
    it('writes one article.created row to domain_event_outbox', async () => {
      const record = await createArticle({ title: 'Outbox Create Test' });
      const id = record['id'] as string;

      const rows = await queryOutbox({ event_name: 'article.created', entity_id: id });
      expect(rows).toHaveLength(1);
    });

    it('outbox row has correct event_name from manifest declaration', async () => {
      const record = await createArticle({ title: 'Event Name Test' });
      const rows = await queryOutbox({ entity_id: record['id'] as string });
      expect(rows[0]?.event_name).toBe('article.created');
    });

    it('outbox payload contains the entity id and type', async () => {
      const record = await createArticle({ title: 'Payload Test' });
      const id = record['id'] as string;

      const rows = await queryOutbox({ entity_id: id });
      const payload = rows[0]?.payload;
      expect(payload?.entity.id).toBe(id);
      expect(payload?.entity.type).toBe('article');
    });

    it('outbox payload strips excluded field (body) from data', async () => {
      const record = await createArticle({ title: 'Exclude Test', body: 'must not appear' });
      const id = record['id'] as string;

      const rows = await queryOutbox({ entity_id: id });
      const data = rows[0]?.payload.data as Record<string, unknown>;
      expect(data['body']).toBeUndefined();
      expect(data['title']).toBe('Exclude Test');
    });

    it('outbox row has cell_id matching manifest metadata.key', async () => {
      const record = await createArticle({ title: 'CellId Test' });
      const rows = await queryOutbox({ entity_id: record['id'] as string });
      expect(rows[0]?.cell_id).toBe('e2e_lifecycle');
    });

    it('outbox payload has a valid event_id (UUID format)', async () => {
      const record = await createArticle({ title: 'EventId Test' });
      const rows = await queryOutbox({ entity_id: record['id'] as string });
      expect(rows[0]?.payload.event_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('outbox after update', () => {
    it('writes article.updated row after PATCH', async () => {
      const record = await createArticle({ title: 'Before Update' });
      const id = record['id'] as string;

      await fetch(`${ARTICLES_URL}/${id}`, {
        method: 'PATCH',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title: 'After Update' }),
      });

      const rows = await queryOutbox({ event_name: 'article.updated', entity_id: id });
      expect(rows).toHaveLength(1);
    });

    it('outbox payload.previous contains the before-state title', async () => {
      const record = await createArticle({ title: 'Original Title' });
      const id = record['id'] as string;

      await fetch(`${ARTICLES_URL}/${id}`, {
        method: 'PATCH',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title: 'New Title' }),
      });

      const rows = await queryOutbox({ event_name: 'article.updated', entity_id: id });
      const previous = rows[0]?.payload.previous as Record<string, unknown>;
      expect(previous['title']).toBe('Original Title');
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe('outbox after delete', () => {
    it('writes article.deleted row after DELETE', async () => {
      const record = await createArticle({ title: 'To Delete' });
      const id = record['id'] as string;

      await fetch(`${ARTICLES_URL}/${id}`, {
        method: 'DELETE',
        headers: withAuth(handle.token),
      });

      const rows = await queryOutbox({ event_name: 'article.deleted', entity_id: id });
      expect(rows).toHaveLength(1);
    });
  });

  // ── rollback ──────────────────────────────────────────────────────────────

  describe('outbox after rollback', () => {
    it('writes entity.rolled_back row after rollback', async () => {
      const record = await createArticle({ title: 'v1 title' });
      const id = record['id'] as string;

      await fetch(`${ARTICLES_URL}/${id}`, {
        method: 'PATCH',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title: 'v2 title' }),
      });

      await fetch(`${ARTICLES_URL}/${id}/rollback`, {
        method: 'POST',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ targetVersion: 1 }),
      });

      const rows = await queryOutbox({ event_name: 'entity.rolled_back', entity_id: id });
      expect(rows).toHaveLength(1);
    });
  });

  // ── atomicity ─────────────────────────────────────────────────────────────

  describe('atomicity: one outbox row per mutation', () => {
    it('create + update + delete each write exactly one outbox row', async () => {
      const record = await createArticle({ title: 'Atom Test' });
      const id = record['id'] as string;

      await fetch(`${ARTICLES_URL}/${id}`, {
        method: 'PATCH',
        headers: withAuth(handle.token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title: 'Atom Updated' }),
      });

      await fetch(`${ARTICLES_URL}/${id}`, {
        method: 'DELETE',
        headers: withAuth(handle.token),
      });

      const all = await queryOutbox({ entity_id: id });
      expect(all).toHaveLength(3);
      expect(all.map((r) => r.event_name)).toEqual([
        'article.created',
        'article.updated',
        'article.deleted',
      ]);
    });
  });
});
