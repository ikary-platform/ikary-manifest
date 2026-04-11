import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CellApiProvider } from '../cell-api-context';
import { useCellEntityCreate } from '../hooks/use-cell-entity-create';
import type { EntityRouteParams } from '@ikary/contract';

const PARAMS: EntityRouteParams = {
  tenantId: 'local',
  workspaceId: 'local',
  cellKey: 'crm',
  entityKey: 'contact',
};

function makeWrapper(token: string | null = 'tok-456') {
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

describe('useCellEntityCreate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends POST to local entity URL', async () => {
    const spy = mockFetch({ data: { id: 'new-1', name: 'Acme' } });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityCreate(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]({ name: 'Acme' });
    });

    const url = new URL(spy.mock.calls[0][0] as string);
    expect(url.pathname).toBe('/entities/contact/records');
    expect(spy.mock.calls[0][1]?.method).toBe('POST');
    expect(spy.mock.calls[0][1]?.body).toBe('{"name":"Acme"}');
  });

  it('sends X-Correlation-ID and Authorization headers', async () => {
    const spy = mockFetch({ data: { id: 'x' } });
    const { wrapper } = makeWrapper('tok-456');
    const { result } = renderHook(() => useCellEntityCreate(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]({ name: 'test' });
    });

    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer tok-456');
    expect(headers['X-Correlation-ID']).toBeTruthy();
  });

  it('invalidates list queries on success', async () => {
    mockFetch({ data: { id: 'new' } });
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCellEntityCreate(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]({ name: 'test' });
    });

    const keys = invalidateSpy.mock.calls.map((c) => c[0]?.queryKey);
    expect(keys.some((k) => Array.isArray(k) && k.includes('list'))).toBe(true);
  });

  it('returns CellApiError on failure', async () => {
    mockFetch({ message: 'Conflict' }, 409);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityCreate(PARAMS), { wrapper });

    await expect(
      act(async () => {
        await result.current[0]({ name: 'dup' });
      }),
    ).rejects.toThrow();
  });
});
