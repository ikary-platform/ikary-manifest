import { describe, it, expect, vi, afterEach } from 'vitest';
import { cellApiFetch } from '../cell-api-client';
import { CellApiError } from '../cell-api-error';

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status }),
  );
}

describe('cellApiFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends X-Correlation-ID header on every request', async () => {
    const spy = mockFetch({ ok: true });
    await cellApiFetch({ url: 'http://api.test/foo', method: 'GET', token: null });
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['X-Correlation-ID']).toBeTruthy();
  });

  it('sends Content-Type application/json', async () => {
    const spy = mockFetch({ ok: true });
    await cellApiFetch({ url: 'http://api.test/foo', method: 'GET', token: null });
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('includes Authorization header when token is provided', async () => {
    const spy = mockFetch({ ok: true });
    await cellApiFetch({ url: 'http://api.test/foo', method: 'GET', token: 'jwt-abc' });
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer jwt-abc');
  });

  it('omits Authorization header when token is null', async () => {
    const spy = mockFetch({ ok: true });
    await cellApiFetch({ url: 'http://api.test/foo', method: 'GET', token: null });
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('serializes body as JSON for POST', async () => {
    const spy = mockFetch({ ok: true });
    await cellApiFetch({ url: 'http://api.test/foo', method: 'POST', body: { name: 'test' }, token: null });
    expect(spy.mock.calls[0][1]?.body).toBe('{"name":"test"}');
  });

  it('throws CellApiError on non-2xx response', async () => {
    mockFetch({ message: 'Forbidden' }, 403);
    await expect(
      cellApiFetch({ url: 'http://api.test/foo', method: 'GET', token: null }),
    ).rejects.toThrow(CellApiError);

    try {
      mockFetch({ message: 'Not found' }, 404);
      await cellApiFetch({ url: 'http://api.test/bar', method: 'GET', token: null });
    } catch (err) {
      expect(err).toBeInstanceOf(CellApiError);
      expect((err as CellApiError).statusCode).toBe(404);
    }
  });
});
