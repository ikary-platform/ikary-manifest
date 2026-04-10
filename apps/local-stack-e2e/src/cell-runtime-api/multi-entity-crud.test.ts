import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { API_BASE, writeMultiEntityManifest, deleteTestManifest } from '../helpers/fixtures.js';
import { startApiServer, type ServerHandle } from '../helpers/server-manager.js';

/**
 * Full create → get → update → delete cycle for each entity in a multi-entity
 * manifest (account, contact, deal). This mirrors the real-world flow: the
 * preview UI creates records per entity, reads them back, edits, and deletes.
 */

function entityUrl(entityKey: string): string {
  return `${API_BASE}/entities/${entityKey}/records`;
}

async function createRecord(entityKey: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(entityUrl(entityKey), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': `e2e-${entityKey}-${Date.now()}`,
    },
    body: JSON.stringify(data),
  });
  expect(res.status).toBe(201);
  return res.json() as Promise<Record<string, unknown>>;
}

async function getRecord(entityKey: string, id: string): Promise<{ status: number; body: Record<string, unknown> | null }> {
  const res = await fetch(`${entityUrl(entityKey)}/${id}`);
  if (res.status === 404) return { status: 404, body: null };
  return { status: res.status, body: await res.json() as Record<string, unknown> };
}

async function listRecords(entityKey: string): Promise<{ data: Record<string, unknown>[]; total: number }> {
  const res = await fetch(entityUrl(entityKey));
  expect(res.status).toBe(200);
  return res.json() as Promise<{ data: Record<string, unknown>[]; total: number }>;
}

async function updateRecord(entityKey: string, id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(`${entityUrl(entityKey)}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': `e2e-update-${entityKey}-${Date.now()}`,
    },
    body: JSON.stringify(data),
  });
  expect(res.status).toBe(200);
  return res.json() as Promise<Record<string, unknown>>;
}

async function deleteRecord(entityKey: string, id: string): Promise<number> {
  const res = await fetch(`${entityUrl(entityKey)}/${id}`, {
    method: 'DELETE',
    headers: { 'X-Correlation-ID': `e2e-delete-${entityKey}-${Date.now()}` },
  });
  return res.status;
}

describe('multi-entity CRUD — account, contact, deal', () => {
  let handle: ServerHandle;
  let manifestPath: string;

  beforeAll(async () => {
    manifestPath = writeMultiEntityManifest();
    handle = await startApiServer(manifestPath);
  });

  afterAll(async () => {
    await handle.stop();
    deleteTestManifest(manifestPath);
  });

  // ── Account entity ─────────────────────────────────────────────────────────

  describe('account', () => {
    let accountId: string;

    it('creates an account', async () => {
      const record = await createRecord('account', {
        name: 'Acme Corp',
        industry: 'Technology',
        website: 'https://acme.example.com',
      });
      accountId = record['id'] as string;
      expect(accountId).toBeTruthy();
      expect(record['name']).toBe('Acme Corp');
      expect(record['version']).toBe(1);
    });

    it('gets the account by id', async () => {
      const { status, body } = await getRecord('account', accountId);
      expect(status).toBe(200);
      expect(body!['name']).toBe('Acme Corp');
      expect(body!['industry']).toBe('Technology');
    });

    it('lists accounts and finds the created one', async () => {
      const { data, total } = await listRecords('account');
      expect(total).toBeGreaterThanOrEqual(1);
      expect(data.some((r) => r['id'] === accountId)).toBe(true);
    });

    it('updates the account', async () => {
      const updated = await updateRecord('account', accountId, {
        industry: 'SaaS',
        expectedVersion: 1,
      });
      expect(updated['industry']).toBe('SaaS');
      expect(updated['version']).toBe(2);
    });

    it('deletes the account', async () => {
      const status = await deleteRecord('account', accountId);
      expect(status).toBe(204);
    });

    it('get after delete returns 404', async () => {
      const { status } = await getRecord('account', accountId);
      expect(status).toBe(404);
    });
  });

  // ── Contact entity ─────────────────────────────────────────────────────────

  describe('contact', () => {
    let contactId: string;

    it('creates a contact with enum field', async () => {
      const record = await createRecord('contact', {
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com',
        status: 'active',
      });
      contactId = record['id'] as string;
      expect(contactId).toBeTruthy();
      expect(record['status']).toBe('active');
    });

    it('gets the contact by id', async () => {
      const { status, body } = await getRecord('contact', contactId);
      expect(status).toBe(200);
      expect(body!['first_name']).toBe('Alice');
      expect(body!['email']).toBe('alice@example.com');
    });

    it('lists contacts', async () => {
      const { data } = await listRecords('contact');
      expect(data.some((r) => r['id'] === contactId)).toBe(true);
    });

    it('updates the contact status', async () => {
      const updated = await updateRecord('contact', contactId, {
        status: 'inactive',
        expectedVersion: 1,
      });
      expect(updated['status']).toBe('inactive');
    });

    it('deletes the contact', async () => {
      const status = await deleteRecord('contact', contactId);
      expect(status).toBe(204);

      const { status: getStatus } = await getRecord('contact', contactId);
      expect(getStatus).toBe(404);
    });
  });

  // ── Deal entity ────────────────────────────────────────────────────────────

  describe('deal', () => {
    let dealId: string;

    it('creates a deal with number field', async () => {
      const record = await createRecord('deal', {
        title: 'Enterprise License',
        amount: 50000,
        stage: 'prospecting',
      });
      dealId = record['id'] as string;
      expect(dealId).toBeTruthy();
      expect(record['amount']).toBe(50000);
      expect(record['stage']).toBe('prospecting');
    });

    it('gets the deal by id', async () => {
      const { status, body } = await getRecord('deal', dealId);
      expect(status).toBe(200);
      expect(body!['title']).toBe('Enterprise License');
      expect(body!['amount']).toBe(50000);
    });

    it('lists deals', async () => {
      const { data } = await listRecords('deal');
      expect(data.some((r) => r['id'] === dealId)).toBe(true);
    });

    it('updates the deal stage and amount', async () => {
      const updated = await updateRecord('deal', dealId, {
        stage: 'negotiation',
        amount: 75000,
        expectedVersion: 1,
      });
      expect(updated['stage']).toBe('negotiation');
      expect(updated['amount']).toBe(75000);
    });

    it('deletes the deal', async () => {
      const status = await deleteRecord('deal', dealId);
      expect(status).toBe(204);

      const { status: getStatus } = await getRecord('deal', dealId);
      expect(getStatus).toBe(404);
    });
  });

  // ── Cross-entity isolation ─────────────────────────────────────────────────

  describe('entity isolation', () => {
    it('records in one entity do not appear in another', async () => {
      const account = await createRecord('account', { name: 'Isolated Corp', industry: 'Test', website: '' });
      const accountId = account['id'] as string;

      // Should not appear in contacts or deals
      const { data: contacts } = await listRecords('contact');
      const { data: deals } = await listRecords('deal');

      expect(contacts.some((r) => r['id'] === accountId)).toBe(false);
      expect(deals.some((r) => r['id'] === accountId)).toBe(false);

      // Cleanup
      await deleteRecord('account', accountId);
    });

    it('different entity keys have independent tables', async () => {
      // Create a record in account
      const account = await createRecord('account', { name: 'Table Test', industry: 'X', website: '' });
      const accountId = account['id'] as string;

      // Create a record in deal
      const deal = await createRecord('deal', { title: 'Table Test', amount: 0, stage: 'prospecting' });
      const dealId = deal['id'] as string;

      // Fetching account ID from deals should fail
      const { status } = await getRecord('deal', accountId);
      expect(status).toBe(404);

      // Cleanup
      await deleteRecord('account', accountId);
      await deleteRecord('deal', dealId);
    });
  });
});
