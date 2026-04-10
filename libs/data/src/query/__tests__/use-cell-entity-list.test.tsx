import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CellApiProvider } from '../cell-api-context';
import { useCellEntityList } from '../hooks/use-cell-entity-list';
import type { EntityRouteParams, EntityListResponse } from '@ikary/contract';

const PARAMS: EntityRouteParams = {
  tenantId: 'local',
  workspaceId: 'local',
  cellKey: 'crm',
  entityKey: 'contact',
};

function makeWrapper(token: string | null = 'test-token') {
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

function emptyList<T>(): EntityListResponse<T> {
  return { data: [], total: 0, page: 1, pageSize: 20, hasMore: false };
}

describe('useCellEntityList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns tuple with list data on success', async () => {
    const payload: EntityListResponse<{ id: string }> = {
      data: [{ id: 'abc' }],
      total: 1,
      page: 1,
      pageSize: 20,
      hasMore: false,
    };
    mockFetch(payload);

    const { result } = renderHook(
      () => useCellEntityList<{ id: string }>(PARAMS, { page: 1, pageSize: 20 }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current[1]).toBe(false));
    const [data, isLoading, error] = result.current;
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
    expect(data.data).toEqual([{ id: 'abc' }]);
    expect(data.total).toBe(1);
  });

  it('returns empty list placeholder while loading', () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useCellEntityList(PARAMS), { wrapper: makeWrapper() });
    expect(result.current[0]).toEqual(emptyList());
    expect(result.current[1]).toBe(true);
  });

  it('sends X-Correlation-ID header', async () => {
    const spy = mockFetch(emptyList());
    const { result } = renderHook(() => useCellEntityList(PARAMS), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current[1]).toBe(false));
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['X-Correlation-ID']).toBeTruthy();
  });

  it('includes Authorization header when token is provided', async () => {
    const spy = mockFetch(emptyList());
    const { result } = renderHook(() => useCellEntityList(PARAMS), { wrapper: makeWrapper('jwt-123') });
    await waitFor(() => expect(result.current[1]).toBe(false));
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer jwt-123');
  });

  it('omits Authorization header when token is null', async () => {
    const spy = mockFetch(emptyList());
    const { result } = renderHook(() => useCellEntityList(PARAMS), { wrapper: makeWrapper(null) });
    await waitFor(() => expect(result.current[1]).toBe(false));
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('builds URL using local entity pattern', async () => {
    const spy = mockFetch(emptyList());
    const { result } = renderHook(
      () => useCellEntityList(PARAMS, { page: 2, pageSize: 10, sortField: 'name', sortDir: 'asc' }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current[1]).toBe(false));
    const url = new URL(spy.mock.calls[0][0] as string);
    expect(url.pathname).toBe('/entities/contact/records');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('pageSize')).toBe('10');
    expect(url.searchParams.get('sortField')).toBe('name');
    expect(url.searchParams.get('sortDir')).toBe('asc');
  });

  it('serializes filter as JSON string in query param', async () => {
    const spy = mockFetch(emptyList());
    const filter = { logic: 'and' as const, rules: [{ field: 'name', operator: 'eq' as const, value: 'Acme' }] };
    const { result } = renderHook(() => useCellEntityList(PARAMS, { filter }), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current[1]).toBe(false));
    const url = new URL(spy.mock.calls[0][0] as string);
    expect(url.searchParams.get('filter')).toBe(JSON.stringify(filter));
  });

  it('includes search param in URL', async () => {
    const spy = mockFetch(emptyList());
    const { result } = renderHook(
      () => useCellEntityList(PARAMS, { search: 'acme' }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current[1]).toBe(false));
    const url = new URL(spy.mock.calls[0][0] as string);
    expect(url.searchParams.get('search')).toBe('acme');
  });

  it('returns CellApiError on non-2xx response', async () => {
    mockFetch({ message: 'Forbidden' }, 403);
    const { result } = renderHook(() => useCellEntityList(PARAMS), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current[2]).not.toBeNull());
    expect(result.current[2]?.statusCode).toBe(403);
    expect(result.current[2]?.name).toBe('CellApiError');
  });
});
