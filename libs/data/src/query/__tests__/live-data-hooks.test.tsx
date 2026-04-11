import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CellApiProvider } from '../cell-api-context';
import { liveDataHooks } from '../../live-data-hooks';
import type { EntityRouteParams } from '@ikary/contract';

const PARAMS: EntityRouteParams = {
  tenantId: 'local',
  workspaceId: 'local',
  cellKey: 'crm',
  entityKey: 'contact',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <CellApiProvider apiBase="http://api.test" getToken={() => null}>
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

describe('liveDataHooks', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useCellEntityList', () => {
    it('returns list data from API', async () => {
      mockFetch({ data: [{ id: '1' }], total: 1, page: 1, pageSize: 20, hasMore: false });
      const { result } = renderHook(() => liveDataHooks.useCellEntityList(PARAMS, {}), {
        wrapper: makeWrapper(),
      });
      await waitFor(() => expect(result.current[1]).toBe(false));
      expect(result.current[0].data).toEqual([{ id: '1' }]);
    });

    it('returns empty list while loading', () => {
      vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise(() => {}));
      const { result } = renderHook(() => liveDataHooks.useCellEntityList(PARAMS, {}), {
        wrapper: makeWrapper(),
      });
      expect(result.current[0].data).toEqual([]);
      expect(result.current[1]).toBe(true);
    });
  });

  describe('useCellEntityGetOne', () => {
    it('returns item data from API', async () => {
      mockFetch({ data: { id: 'abc', name: 'Acme' } });
      const { result } = renderHook(() => liveDataHooks.useCellEntityGetOne(PARAMS, 'abc'), {
        wrapper: makeWrapper(),
      });
      await waitFor(() => expect(result.current[1]).toBe(false));
      expect(result.current[0]).toEqual({ data: { id: 'abc', name: 'Acme' } });
    });

    it('returns null when id is null', () => {
      const { result } = renderHook(() => liveDataHooks.useCellEntityGetOne(PARAMS, null), {
        wrapper: makeWrapper(),
      });
      expect(result.current[0]).toBeNull();
      expect(result.current[1]).toBe(false);
    });
  });

  describe('useCellApi', () => {
    it('returns apiBase and getToken from context', () => {
      const { result } = renderHook(() => liveDataHooks.useCellApi(), {
        wrapper: makeWrapper(),
      });
      expect(result.current.apiBase).toBe('http://api.test');
      expect(result.current.getToken()).toBeNull();
    });
  });

  describe('cellEntityQueryKeys', () => {
    it('generates deterministic detail keys', () => {
      const k1 = liveDataHooks.cellEntityQueryKeys.detail(PARAMS, 'abc');
      const k2 = liveDataHooks.cellEntityQueryKeys.detail(PARAMS, 'abc');
      expect(k1).toEqual(k2);
    });

    it('generates deterministic list keys', () => {
      const k1 = liveDataHooks.cellEntityQueryKeys.list(PARAMS, { page: 1 });
      const k2 = liveDataHooks.cellEntityQueryKeys.list(PARAMS, { page: 1 });
      expect(k1).toEqual(k2);
    });
  });

  describe('cellApiFetch', () => {
    it('delegates to the underlying fetch client', async () => {
      const spy = mockFetch({ result: 'ok' });
      const data = await liveDataHooks.cellApiFetch<{ result: string }>({
        url: 'http://api.test/foo',
        method: 'GET',
        token: null,
      });
      expect(data.result).toBe('ok');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
