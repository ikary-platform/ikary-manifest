import { describe, it, expect } from 'vitest';
import { mockDataHooks } from '../mock-data-hooks';
import type { EntityRouteParams } from '@ikary-manifest/contract';

const ROUTE: EntityRouteParams = {
  tenantId: '00000000-0000-0000-0000-000000000001',
  workspaceId: '00000000-0000-0000-0000-000000000002',
  cellKey: 'crm',
  entityKey: 'customer',
};

describe('mockDataHooks', () => {
  it('useCellEntityGetOne returns idle tuple [null, false, null]', () => {
    const result = mockDataHooks.useCellEntityGetOne(ROUTE, 'some-id');
    expect(result).toEqual([null, false, null]);
  });

  it('useCellEntityGetOne with null id returns idle tuple', () => {
    const result = mockDataHooks.useCellEntityGetOne(ROUTE, null);
    expect(result).toEqual([null, false, null]);
  });

  it('useCellEntityList returns empty paginated result', () => {
    const result = mockDataHooks.useCellEntityList(ROUTE, {});
    expect(result[0]).toMatchObject({ data: [], total: 0, page: 1, pageSize: 20, hasMore: false });
    expect(result[1]).toBe(false);
    expect(result[2]).toBeNull();
  });

  it('useCellApi returns empty apiBase and null token getter', () => {
    const api = mockDataHooks.useCellApi();
    expect(api.apiBase).toBe('');
    expect(api.getToken()).toBeNull();
  });

  it('cellEntityQueryKeys.detail returns stable key', () => {
    const key = mockDataHooks.cellEntityQueryKeys.detail(ROUTE, 'abc');
    expect(key).toEqual(['cell', 'customer', 'detail', 'abc']);
  });

  it('cellEntityQueryKeys.list returns stable key', () => {
    const query = { page: 1 };
    const key = mockDataHooks.cellEntityQueryKeys.list(ROUTE, query);
    expect(key).toEqual(['cell', 'customer', 'list', query]);
  });

  it('cellApiFetch resolves to undefined', async () => {
    const result = await mockDataHooks.cellApiFetch({ url: 'http://x', method: 'GET', token: null });
    expect(result).toBeUndefined();
  });
});
