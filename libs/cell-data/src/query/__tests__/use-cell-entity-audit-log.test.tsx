import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CellApiProvider } from '../cell-api-context';
import { useCellEntityAuditLog } from '../hooks/use-cell-entity-audit-log';
import type { EntityRouteParams } from '@ikary/cell-contract';

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

const AUDIT_PAGE = {
  data: [
    {
      id: '1',
      eventType: 'created',
      resourceVersion: 1,
      actorId: null,
      actorType: 'system',
      actorEmail: null,
      changeKind: 'snapshot',
      snapshot: '{}',
      diff: null,
      occurredAt: '2026-01-01T00:00:00Z',
      requestId: null,
    },
  ],
  total: 1,
};

describe('useCellEntityAuditLog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns audit data on success', async () => {
    mockFetch(AUDIT_PAGE);
    const { result } = renderHook(() => useCellEntityAuditLog(PARAMS, 'abc'), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.total).toBe(1);
  });

  it('does not fetch when id is null', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    renderHook(() => useCellEntityAuditLog(PARAMS, null), { wrapper: makeWrapper() });
    expect(spy).not.toHaveBeenCalled();
  });

  it('builds correct audit URL with local pattern', async () => {
    const spy = mockFetch(AUDIT_PAGE);
    const { result } = renderHook(() => useCellEntityAuditLog(PARAMS, 'abc', 2, 10), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const url = new URL(spy.mock.calls[0][0] as string);
    expect(url.pathname).toBe('/entities/contact/records/abc/audit');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('pageSize')).toBe('10');
  });

  it('sends X-Correlation-ID header', async () => {
    const spy = mockFetch(AUDIT_PAGE);
    const { result } = renderHook(() => useCellEntityAuditLog(PARAMS, 'abc'), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['X-Correlation-ID']).toBeTruthy();
  });

  it('normalizes raw array response into AuditLogPage shape', async () => {
    // The local API returns a raw array, not { data: [...], total: N }
    const rawArray = [AUDIT_PAGE.data[0]];
    mockFetch(rawArray);
    const { result } = renderHook(() => useCellEntityAuditLog(PARAMS, 'abc'), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.total).toBe(1);
  });

  it('returns CellApiError on non-2xx response', async () => {
    mockFetch({ message: 'Not Found' }, 404);
    const { result } = renderHook(() => useCellEntityAuditLog(PARAMS, 'missing'), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.statusCode).toBe(404);
  });
});
