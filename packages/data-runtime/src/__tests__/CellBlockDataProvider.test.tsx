import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { DataProviderDefinition } from '@ikary-manifest/contract';
import type { EntityRouteParams } from '@ikary-manifest/contract';
import type { RuntimeContext } from '@ikary-manifest/runtime-ui';
import { RuntimeContextProvider, useRuntimeContext } from '@ikary-manifest/runtime-ui';

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockSingleProvider = vi.fn();
const mockListProvider = vi.fn();

vi.mock('../use-single-provider', () => ({
  useSingleProvider: (...args: unknown[]) => mockSingleProvider(...args),
}));

vi.mock('../use-list-provider', () => ({
  useListProvider: (...args: unknown[]) => mockListProvider(...args),
}));

import { CellBlockDataProvider } from '../CellBlockDataProvider';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROUTE: Omit<EntityRouteParams, 'entityKey'> = {
  tenantId: '00000000-0000-0000-0000-000000000001',
  workspaceId: '00000000-0000-0000-0000-000000000002',
  cellKey: 'crm',
};

function makeContext(record?: Record<string, unknown>): RuntimeContext {
  return {
    entity: { key: 'test', name: 'Test', pluralName: 'Tests', fields: [] },
    record,
    actions: { navigate: vi.fn(), mutate: vi.fn(), delete: vi.fn() },
    ui: { notify: vi.fn(), confirm: vi.fn() },
    permissions: [],
  };
}

function ContextCapture({ onCapture }: { onCapture: (ctx: RuntimeContext) => void }) {
  const ctx = useRuntimeContext();
  onCapture(ctx);
  return <span data-testid="child" />;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CellBlockDataProvider', () => {
  beforeEach(() => {
    mockSingleProvider.mockReturnValue({ data: null, isLoading: false, error: null });
    mockListProvider.mockReturnValue({ data: [], isLoading: false, error: null });
  });

  it('renders children unmodified when there is no parent context', () => {
    const singleDef: DataProviderDefinition = {
      key: 'company',
      entityKey: 'company',
      mode: 'single',
      idFrom: 'companyId',
    };
    render(
      <CellBlockDataProvider definition={singleDef} routeParams={ROUTE}>
        <span data-testid="child" />
      </CellBlockDataProvider>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('single mode: merges fetched record into context under provider key', () => {
    const parentCtx = makeContext({ id: 'c1', companyId: 'cmp-1' });
    mockSingleProvider.mockReturnValue({
      data: { id: 'cmp-1', name: 'Acme' },
      isLoading: false,
      error: null,
    });

    const singleDef: DataProviderDefinition = {
      key: 'company',
      entityKey: 'company',
      mode: 'single',
      idFrom: 'companyId',
    };

    let captured: RuntimeContext | null = null;
    render(
      <RuntimeContextProvider context={parentCtx}>
        <CellBlockDataProvider definition={singleDef} routeParams={ROUTE}>
          <ContextCapture
            onCapture={(ctx) => {
              captured = ctx;
            }}
          />
        </CellBlockDataProvider>
      </RuntimeContextProvider>,
    );

    expect(captured!.record?.['company']).toEqual({ id: 'cmp-1', name: 'Acme' });
    // Existing parent record fields are preserved
    expect(captured!.record?.['id']).toBe('c1');
  });

  it('list mode: merges fetched array into context under provider key', () => {
    const parentCtx = makeContext({ id: 'c1' });
    mockListProvider.mockReturnValue({
      data: [{ id: 'inv-1' }, { id: 'inv-2' }],
      isLoading: false,
      error: null,
    });

    const listDef: DataProviderDefinition = {
      key: 'invoices',
      entityKey: 'invoice',
      mode: 'list',
      filterBy: { field: 'customerId', valueFrom: 'id' },
    };

    let captured: RuntimeContext | null = null;
    render(
      <RuntimeContextProvider context={parentCtx}>
        <CellBlockDataProvider definition={listDef} routeParams={ROUTE}>
          <ContextCapture
            onCapture={(ctx) => {
              captured = ctx;
            }}
          />
        </CellBlockDataProvider>
      </RuntimeContextProvider>,
    );

    expect(captured!.record?.['invoices']).toEqual([{ id: 'inv-1' }, { id: 'inv-2' }]);
    expect(captured!.record?.['id']).toBe('c1');
  });

  it('passes the correct routeParams to the provider hook', () => {
    const parentCtx = makeContext({ id: 'c1', companyId: 'cmp-1' });
    mockSingleProvider.mockReturnValue({ data: { id: 'cmp-1' }, isLoading: false, error: null });

    const singleDef: DataProviderDefinition = {
      key: 'company',
      entityKey: 'company',
      mode: 'single',
      idFrom: 'companyId',
    };
    render(
      <RuntimeContextProvider context={parentCtx}>
        <CellBlockDataProvider definition={singleDef} routeParams={ROUTE}>
          <span />
        </CellBlockDataProvider>
      </RuntimeContextProvider>,
    );

    // routeParams without entityKey should be forwarded
    expect(mockSingleProvider).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'company', entityKey: 'company' }),
      expect.anything(),
      ROUTE,
    );
  });
});
