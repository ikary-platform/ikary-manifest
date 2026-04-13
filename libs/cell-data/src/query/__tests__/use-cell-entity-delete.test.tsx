import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CellApiProvider } from '../cell-api-context';
import { useCellEntityDelete } from '../hooks/use-cell-entity-delete';
import type { EntityRouteParams } from '@ikary/cell-contract';

const PARAMS: EntityRouteParams = {
  tenantId: 'local',
  workspaceId: 'local',
  cellKey: 'crm',
  entityKey: 'contact',
};

function makeWrapper(token: string | null = 'tok-789') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return { wrapper: Wrapper, queryClient };
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <CellApiProvider apiBase="http://api.test" getToken={() => token}>
          {children}
        </CellApiProvider>
      </QueryClientProvider>
    );
  }
}

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status }),
  );
}

describe('useCellEntityDelete', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends DELETE to local entity item URL', async () => {
    const spy = mockFetch({ data: { id: 'abc', deleted: true } });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityDelete(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]('abc');
    });

    const url = new URL(spy.mock.calls[0][0] as string);
    expect(url.pathname).toBe('/entities/contact/records/abc');
    expect(spy.mock.calls[0][1]?.method).toBe('DELETE');
  });

  it('sends X-Correlation-ID and Authorization headers', async () => {
    const spy = mockFetch({ data: { id: 'abc', deleted: true } });
    const { wrapper } = makeWrapper('tok-789');
    const { result } = renderHook(() => useCellEntityDelete(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]('abc');
    });

    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer tok-789');
    expect(headers['X-Correlation-ID']).toBeTruthy();
  });

  it('invalidates list and detail queries on success', async () => {
    mockFetch({ data: { id: 'abc', deleted: true } });
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCellEntityDelete(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]('abc');
    });

    const keys = invalidateSpy.mock.calls.map((c) => c[0]?.queryKey);
    expect(keys.some((k) => Array.isArray(k) && k.includes('list'))).toBe(true);
    expect(keys.some((k) => Array.isArray(k) && k.includes('abc'))).toBe(true);
  });
});
