import { describe, it, expect, vi, afterEach } from 'vitest';
import { cellApiFetch } from '../cell-api-client';
import { localEntityBaseUrl, localEntityItemUrl } from '../local-routes';

/**
 * These tests verify the exact URL patterns the adapter produces.
 * They mirror the contract tested in the e2e suite
 * (entity-adapter-urls.test.ts) but run without a server.
 */
describe('adapter entity key flow — URL correctness', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('localEntityBaseUrl with valid entity key', () => {
    expect(localEntityBaseUrl('account', 'http://localhost:4501'))
      .toBe('http://localhost:4501/entities/account/records');
  });

  it('localEntityBaseUrl with empty entity key produces broken URL', () => {
    // This is the bug — empty entity key produces /entities//records
    const url = localEntityBaseUrl('', 'http://localhost:4501');
    expect(url).toBe('http://localhost:4501/entities//records');
    // This demonstrates WHY the adapter must ensure entity key is set
  });

  it('localEntityItemUrl includes entity key and record id', () => {
    expect(localEntityItemUrl('account', 'abc-123', 'http://localhost:4501'))
      .toBe('http://localhost:4501/entities/account/records/abc-123');
  });

  it('cellApiFetch sends to the exact URL provided (no rewriting)', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { id: '1' } }), { status: 200 }),
    );

    const url = localEntityBaseUrl('account', 'http://localhost:4501');
    await cellApiFetch({ url, method: 'POST', body: { name: 'Test' }, token: null });

    expect(spy.mock.calls[0][0]).toBe('http://localhost:4501/entities/account/records');
  });

  it('full create flow: entity key → URL → POST', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { id: 'new-1', name: 'Acme' } }), { status: 201 }),
    );

    // Simulate what the adapter does: read entity key from ref, build URL, POST
    const entityKey = 'account'; // This is what the ref should contain
    const apiBase = 'http://localhost:4501';
    const url = localEntityBaseUrl(entityKey, apiBase);

    await cellApiFetch({
      url,
      method: 'POST',
      body: { name: 'Acme', industry: 'Tech' },
      token: null,
    });

    const calledUrl = new URL(spy.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/entities/account/records');
    expect(spy.mock.calls[0][1]?.method).toBe('POST');

    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['X-Correlation-ID']).toBeTruthy();
  });

  it('full update flow: entity key + id → URL → PATCH', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { id: 'abc', name: 'Updated' } }), { status: 200 }),
    );

    const entityKey = 'account';
    const id = 'abc-123';
    const apiBase = 'http://localhost:4501';
    const url = localEntityItemUrl(entityKey, id, apiBase);

    await cellApiFetch({
      url,
      method: 'PATCH',
      body: { name: 'Updated', expectedVersion: 1 },
      token: null,
    });

    const calledUrl = new URL(spy.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/entities/account/records/abc-123');
  });

  it('full delete flow: entity key + id → URL → DELETE', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    const entityKey = 'account';
    const id = 'abc-123';
    const apiBase = 'http://localhost:4501';
    const url = localEntityItemUrl(entityKey, id, apiBase);

    // DELETE returns 204 with no body — cellApiFetch will fail on res.json()
    // This tests that the URL is correct regardless
    try {
      await cellApiFetch({ url, method: 'DELETE', token: null });
    } catch {
      // 204 has no JSON body — expected
    }

    const calledUrl = new URL(spy.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/entities/account/records/abc-123');
  });
});
