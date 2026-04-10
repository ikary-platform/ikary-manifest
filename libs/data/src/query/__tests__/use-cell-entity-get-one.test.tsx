import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CellApiProvider } from '../cell-api-context';
import { useCellEntityGetOne } from '../hooks/use-cell-entity-get-one';
import type { EntityRouteParams } from '@ikary/contract';

const PARAMS: EntityRouteParams = {
  tenantId: 'local',
  workspaceId: 'local',
  cellKey: 'crm',
  entityKey: 'contact',
};

function makeWrapper(token: string | null = null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <CellApiProvider apiBase="http://api.test" getToken={() => token}>
          {children}
        </CellApiProvider>
      </QueryClientProvider>
    );
  };
}

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status }),
  );
}

describe('useCellEntityGetOne', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns item data on success', async () => {
    const payload = { data: { id: 'abc', name: 'Acme' } };
    mockFetch(payload);
    const { result } = renderHook(() => useCellEntityGetOne(PARAMS, 'abc'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current[1]).toBe(false));
    expect(result.current[0]).toEqual(payload);
  });

  it('does not fetch when id is null', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    const { result } = renderHook(() => useCellEntityGetOne(PARAMS, null), { wrapper: makeWrapper() });
    expect(result.current[0]).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it('sends X-Correlation-ID header', async () => {
    const spy = mockFetch({ data: { id: 'abc' } });
    const { result } = renderHook(() => useCellEntityGetOne(PARAMS, 'abc'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current[1]).toBe(false));
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['X-Correlation-ID']).toBeTruthy();
  });

  it('builds correct item URL with local pattern', async () => {
    const spy = mockFetch({ data: { id: 'abc' } });
    const { result } = renderHook(() => useCellEntityGetOne(PARAMS, 'abc'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current[1]).toBe(false));
    const url = new URL(spy.mock.calls[0][0] as string);
    expect(url.pathname).toBe('/entities/contact/records/abc');
  });

  it('returns CellApiError on non-2xx response', async () => {
    mockFetch({ message: 'Not Found' }, 404);
    const { result } = renderHook(() => useCellEntityGetOne(PARAMS, 'missing'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current[2]).not.toBeNull());
    expect(result.current[2]?.statusCode).toBe(404);
  });
});
