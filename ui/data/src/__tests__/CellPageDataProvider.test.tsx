import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import type { CellManifestV1 } from '@ikary-manifest/contract';
import type { EntityRouteParams } from '@ikary-manifest/contract';
import { useRuntimeContext, type RuntimeContext } from '@ikary-manifest/primitives';

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({ id: 'test-id' })),
}));

vi.mock('../data-hooks', () => ({
  useDataHooks: vi.fn(() => ({
    useCellEntityGetOne: vi.fn(() => [{ data: { id: 'test-id', name: 'Test' } }, false, null]),
    useCellEntityList: vi.fn(() => [{ data: [], total: 0, page: 1, pageSize: 20, hasMore: false }, false, null]),
    useCellApi: vi.fn(() => ({ apiBase: '', getToken: () => null })),
    cellEntityQueryKeys: { detail: vi.fn(), list: vi.fn() },
    cellApiFetch: vi.fn(),
  })),
  DataHooksProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../use-secondary-providers', () => ({
  useSecondaryProviders: vi.fn(() => ({ mergedData: {}, isLoading: false, errors: [] })),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

import { CellPageDataProvider } from '../CellPageDataProvider';
import { useParams } from 'react-router-dom';
import { useDataHooks } from '../data-hooks';
import { useSecondaryProviders } from '../use-secondary-providers';

const ROUTE: Omit<EntityRouteParams, 'entityKey'> = {
  tenantId: '00000000-0000-0000-0000-000000000001',
  workspaceId: '00000000-0000-0000-0000-000000000002',
  cellKey: 'crm',
};

const MOCK_CONTEXT = {
  actions: { navigate: vi.fn(), mutate: vi.fn(), delete: vi.fn() },
  ui: { notify: vi.fn(), confirm: vi.fn() },
  permissions: [],
};

const MANIFEST = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'crm', name: 'CRM', version: '1.0.0' },
  spec: {
    mount: { mountPath: '/crm', landingPage: '/crm/customers' },
    entities: [{ key: 'customer', name: 'Customer', pluralName: 'Customers', fields: [] }],
    pages: [
      { key: 'customer-detail', type: 'entity-detail', title: 'Customer', path: '/customers/:id', entity: 'customer' },
      { key: 'customer-list', type: 'entity-list', title: 'Customers', path: '/customers', entity: 'customer' },
    ],
  },
} as unknown as CellManifestV1;

// ── Context consumer for assertions ──────────────────────────────────────────

function ContextCapture({ onCapture }: { onCapture: (ctx: RuntimeContext) => void }) {
  const ctx = useRuntimeContext();
  onCapture(ctx);
  return <span data-testid="child" />;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CellPageDataProvider', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({ id: 'cust-1' });
    const mockGetOne = vi.fn(() => [{ data: { id: 'cust-1', name: 'Alice', companyId: 'cmp-1' } }, false, null] as [any, any, any]);
    vi.mocked(useDataHooks).mockReturnValue({
      useCellEntityGetOne: mockGetOne,
      useCellEntityList: vi.fn(() => [{ data: [], total: 0, page: 1, pageSize: 20, hasMore: false }, false, null] as [any, any, any]),
      useCellApi: vi.fn(() => ({ apiBase: '', getToken: () => null })),
      cellEntityQueryKeys: { detail: vi.fn(), list: vi.fn() },
      cellApiFetch: vi.fn(),
    });
    vi.mocked(useSecondaryProviders).mockReturnValue({
      mergedData: {},
      isLoading: false,
      errors: [],
    });
  });

  it('renders children when data is loaded', () => {
    render(
      <CellPageDataProvider manifest={MANIFEST} pageKey="customer-detail" routeParams={ROUTE} context={MOCK_CONTEXT}>
        <span data-testid="child" />
      </CellPageDataProvider>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('injects the primary record into RuntimeContext', () => {
    let captured: RuntimeContext | null = null;
    render(
      <CellPageDataProvider manifest={MANIFEST} pageKey="customer-detail" routeParams={ROUTE} context={MOCK_CONTEXT}>
        <ContextCapture
          onCapture={(ctx) => {
            captured = ctx;
          }}
        />
      </CellPageDataProvider>,
    );
    expect(captured!.record).toEqual({ id: 'cust-1', name: 'Alice', companyId: 'cmp-1' });
  });

  it('merges secondary provider data into the record', () => {
    vi.mocked(useSecondaryProviders).mockReturnValue({
      mergedData: { company: { id: 'cmp-1', name: 'Acme' } },
      isLoading: false,
      errors: [],
    });

    let captured: RuntimeContext | null = null;
    render(
      <CellPageDataProvider manifest={MANIFEST} pageKey="customer-detail" routeParams={ROUTE} context={MOCK_CONTEXT}>
        <ContextCapture
          onCapture={(ctx) => {
            captured = ctx;
          }}
        />
      </CellPageDataProvider>,
    );
    expect(captured!.record?.['company']).toEqual({ id: 'cmp-1', name: 'Acme' });
  });

  it('shows loading state while primary single-record is fetching', () => {
    vi.mocked(useDataHooks).mockReturnValue({
      useCellEntityGetOne: vi.fn(() => [null, true, null] as [any, any, any]),
      useCellEntityList: vi.fn(() => [{ data: [], total: 0, page: 1, pageSize: 20, hasMore: false }, false, null] as [any, any, any]),
      useCellApi: vi.fn(() => ({ apiBase: '', getToken: () => null })),
      cellEntityQueryKeys: { detail: vi.fn(), list: vi.fn() },
      cellApiFetch: vi.fn(),
    });

    render(
      <CellPageDataProvider manifest={MANIFEST} pageKey="customer-detail" routeParams={ROUTE} context={MOCK_CONTEXT}>
        <span data-testid="child" />
      </CellPageDataProvider>,
    );
    expect(screen.queryByTestId('child')).toBeNull();
    expect(screen.getByTestId('cell-page-loading')).toBeTruthy();
  });

  it('shows error state on primary fetch error', () => {
    const err = new Error('Network error');
    vi.mocked(useDataHooks).mockReturnValue({
      useCellEntityGetOne: vi.fn(() => [null, false, err] as [any, any, any]),
      useCellEntityList: vi.fn(() => [{ data: [], total: 0, page: 1, pageSize: 20, hasMore: false }, false, null] as [any, any, any]),
      useCellApi: vi.fn(() => ({ apiBase: '', getToken: () => null })),
      cellEntityQueryKeys: { detail: vi.fn(), list: vi.fn() },
      cellApiFetch: vi.fn(),
    });

    render(
      <CellPageDataProvider manifest={MANIFEST} pageKey="customer-detail" routeParams={ROUTE} context={MOCK_CONTEXT}>
        <span data-testid="child" />
      </CellPageDataProvider>,
    );
    expect(screen.queryByTestId('child')).toBeNull();
    expect(screen.getByTestId('cell-page-error')).toBeTruthy();
  });

  it('renders immediately for entity-list pages (no loading gate)', () => {
    vi.mocked(useDataHooks).mockReturnValue({
      useCellEntityGetOne: vi.fn(() => [null, false, null] as [any, any, any]),
      useCellEntityList: vi.fn(() => [{ data: [], total: 0, page: 1, pageSize: 20, hasMore: false }, false, null] as [any, any, any]),
      useCellApi: vi.fn(() => ({ apiBase: '', getToken: () => null })),
      cellEntityQueryKeys: { detail: vi.fn(), list: vi.fn() },
      cellApiFetch: vi.fn(),
    });

    render(
      <CellPageDataProvider manifest={MANIFEST} pageKey="customer-list" routeParams={ROUTE} context={MOCK_CONTEXT}>
        <span data-testid="child" />
      </CellPageDataProvider>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });
});
