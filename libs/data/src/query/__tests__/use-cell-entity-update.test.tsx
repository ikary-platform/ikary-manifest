import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CellApiProvider } from '../cell-api-context';
import { useCellEntityUpdate } from '../hooks/use-cell-entity-update';
import type { EntityRouteParams } from '@ikary/contract';

const PARAMS: EntityRouteParams = {
  tenantId: 'local',
  workspaceId: 'local',
  cellKey: 'crm',
  entityKey: 'contact',
};

function makeWrapper(token: string | null = 'tok-upd') {
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

describe('useCellEntityUpdate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends PATCH to local entity item URL', async () => {
    const spy = mockFetch({ data: { id: 'abc', name: 'Updated' } });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityUpdate(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]({ id: 'abc', data: { name: 'Updated' } });
    });

    const url = new URL(spy.mock.calls[0][0] as string);
    expect(url.pathname).toBe('/entities/contact/records/abc');
    expect(spy.mock.calls[0][1]?.method).toBe('PATCH');
  });

  it('sends X-Correlation-ID and Authorization headers', async () => {
    const spy = mockFetch({ data: { id: 'abc' } });
    const { wrapper } = makeWrapper('tok-upd');
    const { result } = renderHook(() => useCellEntityUpdate(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]({ id: 'abc', data: { name: 'X' } });
    });

    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer tok-upd');
    expect(headers['X-Correlation-ID']).toBeTruthy();
  });

  it('includes expectedVersion in body when provided', async () => {
    const spy = mockFetch({ data: { id: 'abc' } });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityUpdate(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]({ id: 'abc', data: { name: 'Y' }, expectedVersion: 3 });
    });

    const body = JSON.parse(spy.mock.calls[0][1]?.body as string);
    expect(body.expectedVersion).toBe(3);
    expect(body.name).toBe('Y');
  });

  it('omits expectedVersion from body when not provided', async () => {
    const spy = mockFetch({ data: { id: 'abc' } });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityUpdate(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]({ id: 'abc', data: { name: 'Z' } });
    });

    const body = JSON.parse(spy.mock.calls[0][1]?.body as string);
    expect(body.expectedVersion).toBeUndefined();
  });

  it('invalidates list and detail queries on success', async () => {
    mockFetch({ data: { id: 'abc' } });
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCellEntityUpdate(PARAMS), { wrapper });

    await act(async () => {
      await result.current[0]({ id: 'abc', data: { name: 'Y' } });
    });

    const keys = invalidateSpy.mock.calls.map((c) => c[0]?.queryKey);
    expect(keys.some((k) => Array.isArray(k) && k.includes('list'))).toBe(true);
    expect(keys.some((k) => Array.isArray(k) && k.includes('abc'))).toBe(true);
  });

  it('returns CellApiError on version conflict (409)', async () => {
    mockFetch({ message: 'Version conflict' }, 409);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCellEntityUpdate(PARAMS), { wrapper });

    await expect(
      act(async () => {
        await result.current[0]({ id: 'abc', data: { name: 'conflict' }, expectedVersion: 1 });
      }),
    ).rejects.toThrow();
  });
});
