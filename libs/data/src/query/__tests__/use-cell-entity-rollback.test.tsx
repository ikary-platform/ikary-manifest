import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CellApiProvider } from '../cell-api-context';
import { useCellEntityRollback } from '../hooks/use-cell-entity-rollback';
import type { EntityRouteParams } from '@ikary/contract';

const PARAMS: EntityRouteParams = {
  tenantId: 'local',
  workspaceId: 'local',
  cellKey: 'crm',
  entityKey: 'contact',
};

function makeWrapper(token: string | null = null) {
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

describe('useCellEntityRollback', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends POST to rollback URL', async () => {
    const spy = mockFetch({ data: { id: 'abc', version: 1 } });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityRollback(PARAMS), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'abc', targetVersion: 1 });
    });

    const url = new URL(spy.mock.calls[0][0] as string);
    expect(url.pathname).toBe('/entities/contact/records/abc/rollback');
    expect(spy.mock.calls[0][1]?.method).toBe('POST');
  });

  it('includes targetVersion in body', async () => {
    const spy = mockFetch({ data: { id: 'abc' } });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityRollback(PARAMS), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'abc', targetVersion: 2 });
    });

    const body = JSON.parse(spy.mock.calls[0][1]?.body as string);
    expect(body.targetVersion).toBe(2);
  });

  it('includes expectedVersion when provided', async () => {
    const spy = mockFetch({ data: { id: 'abc' } });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityRollback(PARAMS), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'abc', targetVersion: 1, expectedVersion: 3 });
    });

    const body = JSON.parse(spy.mock.calls[0][1]?.body as string);
    expect(body.expectedVersion).toBe(3);
  });

  it('sends X-Correlation-ID header', async () => {
    const spy = mockFetch({ data: { id: 'abc' } });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityRollback(PARAMS), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'abc', targetVersion: 1 });
    });

    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['X-Correlation-ID']).toBeTruthy();
  });

  it('invalidates list, detail, and audit queries on success', async () => {
    mockFetch({ data: { id: 'abc' } });
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCellEntityRollback(PARAMS), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'abc', targetVersion: 1 });
    });

    const keys = invalidateSpy.mock.calls.map((c) => c[0]?.queryKey);
    expect(keys.some((k) => Array.isArray(k) && k.includes('list'))).toBe(true);
    expect(keys.some((k) => Array.isArray(k) && k.includes('detail') && k.includes('abc'))).toBe(true);
    expect(keys.some((k) => Array.isArray(k) && k.includes('audit') && k.includes('abc'))).toBe(true);
  });
});
