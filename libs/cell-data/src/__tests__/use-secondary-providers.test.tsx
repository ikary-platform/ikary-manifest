import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { DataProviderDefinition } from '@ikary/cell-contract';
import type { EntityRouteParams } from '@ikary/cell-contract';

// Mock useDataHooks so we can control cellApiFetch directly.
const mockCellApiFetch = vi.fn();

vi.mock('../data-hooks', () => ({
  useDataHooks: () => ({
    useCellApi: () => ({ apiBase: 'http://api.test', getToken: () => 'tok' }),
    cellApiFetch: (...args: unknown[]) => mockCellApiFetch(...args),
    cellEntityQueryKeys: {
      detail: (p: EntityRouteParams, id: string) => ['cell', p.entityKey, 'detail', id],
      list: (p: EntityRouteParams, q: unknown) => ['cell', p.entityKey, 'list', q],
    },
    useCellEntityGetOne: vi.fn(),
    useCellEntityList: vi.fn(),
  }),
}));

import { useSecondaryProviders } from '../use-secondary-providers';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROUTE: Omit<EntityRouteParams, 'entityKey'> = {
  tenantId: '00000000-0000-0000-0000-000000000001',
  workspaceId: '00000000-0000-0000-0000-000000000002',
  cellKey: 'crm',
};

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useSecondaryProviders', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty mergedData and no loading when providers=[]', () => {
    const { result } = renderHook(() => useSecondaryProviders([], null, ROUTE), { wrapper: makeWrapper() });
    expect(result.current.mergedData).toEqual({});
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches a single-mode provider and merges it into mergedData', async () => {
    const companyRecord = { id: 'cmp-1', name: 'Acme' };
    mockCellApiFetch.mockResolvedValueOnce({ data: companyRecord });

    const provider: DataProviderDefinition = {
      key: 'company',
      entityKey: 'company',
      mode: 'single',
      idFrom: 'companyId',
    };
    const primary = { id: 'c1', companyId: 'cmp-1' };

    const { result } = renderHook(() => useSecondaryProviders([provider], primary, ROUTE), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.mergedData).toHaveProperty('company'));
    expect(result.current.mergedData).toEqual({ company: companyRecord });
  });

  it('does not fetch when idFrom is missing from primary record', () => {
    const provider: DataProviderDefinition = {
      key: 'company',
      entityKey: 'company',
      mode: 'single',
      idFrom: 'companyId',
    };
    // companyId is absent → id resolves to undefined → query disabled
    const primary = { id: 'c1' };

    const { result } = renderHook(() => useSecondaryProviders([provider], primary, ROUTE), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(mockCellApiFetch).not.toHaveBeenCalled();
    expect(result.current.mergedData).toEqual({});
  });

  it('fetches a list-mode provider and merges its data array', async () => {
    const invoices = [{ id: 'inv-1' }, { id: 'inv-2' }];
    mockCellApiFetch.mockResolvedValueOnce({
      data: invoices,
      total: 2,
      page: 1,
      pageSize: 5,
      hasMore: false,
    });

    const provider: DataProviderDefinition = {
      key: 'invoices',
      entityKey: 'invoice',
      mode: 'list',
      filterBy: { field: 'customerId', valueFrom: 'id' },
      query: { pageSize: 5, sortField: 'createdAt', sortDir: 'desc' },
    };
    const primary = { id: 'cust-1' };

    const { result } = renderHook(() => useSecondaryProviders([provider], primary, ROUTE), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.mergedData).toHaveProperty('invoices'));
    expect(result.current.mergedData).toEqual({ invoices });
  });

  it('single provider with no idFrom is disabled (query never fires)', () => {
    const provider: DataProviderDefinition = {
      key: 'company',
      entityKey: 'company',
      mode: 'single',
      // no idFrom → id = undefined → query disabled
    };

    const { result } = renderHook(
      () => useSecondaryProviders([provider], { id: 'c1' }, ROUTE),
      { wrapper: makeWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockCellApiFetch).not.toHaveBeenCalled();
  });

  it('single provider with null primaryRecord is disabled (no fetch)', () => {
    const provider: DataProviderDefinition = {
      key: 'company',
      entityKey: 'company',
      mode: 'single',
      idFrom: 'companyId',
    };

    // primaryRecord is null → resolveIdFrom({}, 'companyId') → undefined → query disabled
    const { result } = renderHook(() => useSecondaryProviders([provider], null, ROUTE), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockCellApiFetch).not.toHaveBeenCalled();
    expect(result.current.mergedData).toEqual({});
  });

  it('list provider without filterBy fetches all records', async () => {
    const items = [{ id: 'tag-1' }];
    mockCellApiFetch.mockResolvedValueOnce({ data: items, total: 1, page: 1, pageSize: 20, hasMore: false });

    const provider: DataProviderDefinition = {
      key: 'tags',
      entityKey: 'tag',
      mode: 'list',
      // no filterBy → filterValue = undefined (line 45 : undefined branch)
    };

    const { result } = renderHook(() => useSecondaryProviders([provider], null, ROUTE), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.mergedData).toHaveProperty('tags'));
    expect(result.current.mergedData).toEqual({ tags: items });
  });

  it('list provider with filterBy and null primaryRecord sends query without filter', async () => {
    const invoices = [{ id: 'inv-1' }];
    mockCellApiFetch.mockResolvedValueOnce({ data: invoices, total: 1, page: 1, pageSize: 20, hasMore: false });

    const provider: DataProviderDefinition = {
      key: 'invoices',
      entityKey: 'invoice',
      mode: 'list',
      filterBy: { field: 'customerId', valueFrom: 'customerId' },
    };

    // primaryRecord is null → resolveIdFrom({}, 'customerId') → undefined → filter = undefined
    const { result } = renderHook(() => useSecondaryProviders([provider], null, ROUTE), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.mergedData).toHaveProperty('invoices'));
    expect(result.current.mergedData).toEqual({ invoices });
  });

  it('runs multiple providers in parallel', async () => {
    mockCellApiFetch
      .mockResolvedValueOnce({ data: { id: 'cmp-1', name: 'Acme' } })
      .mockResolvedValueOnce({ data: [{ id: 'inv-1' }], total: 1, page: 1, pageSize: 20, hasMore: false });

    const providers: DataProviderDefinition[] = [
      { key: 'company', entityKey: 'company', mode: 'single', idFrom: 'companyId' },
      { key: 'invoices', entityKey: 'invoice', mode: 'list', filterBy: { field: 'customerId', valueFrom: 'id' } },
    ];
    const primary = { id: 'cust-1', companyId: 'cmp-1' };

    const { result } = renderHook(() => useSecondaryProviders(providers, primary, ROUTE), { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(result.current.mergedData).toHaveProperty('company');
      expect(result.current.mergedData).toHaveProperty('invoices');
    });
    expect(result.current.mergedData.company).toEqual({ id: 'cmp-1', name: 'Acme' });
    expect(result.current.mergedData.invoices).toEqual([{ id: 'inv-1' }]);
  });
});
