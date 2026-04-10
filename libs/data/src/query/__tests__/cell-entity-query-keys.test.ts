import { describe, it, expect } from 'vitest';
import { cellEntityQueryKeys } from '../cell-entity-query-keys';
import type { EntityRouteParams } from '@ikary/contract';

const PARAMS: EntityRouteParams = {
  tenantId: 'local',
  workspaceId: 'local',
  cellKey: 'crm',
  entityKey: 'contact',
};

describe('cellEntityQueryKeys', () => {
  it('produces scoped keys for all()', () => {
    const key = cellEntityQueryKeys.all(PARAMS);
    expect(key).toEqual(['cell-entity', 'local', 'local', 'crm', 'contact']);
  });

  it('list keys extend from all()', () => {
    const key = cellEntityQueryKeys.list(PARAMS, { page: 2 });
    expect(key[0]).toBe('cell-entity');
    expect(key).toContain('list');
  });

  it('detail keys include record id', () => {
    const key = cellEntityQueryKeys.detail(PARAMS, 'abc-123');
    expect(key).toContain('detail');
    expect(key).toContain('abc-123');
  });

  it('audit keys include record id', () => {
    const key = cellEntityQueryKeys.audit(PARAMS, 'abc-123');
    expect(key).toContain('audit');
    expect(key).toContain('abc-123');
  });

  it('different entityKeys produce different keys', () => {
    const contactKey = cellEntityQueryKeys.all(PARAMS);
    const invoiceKey = cellEntityQueryKeys.all({ ...PARAMS, entityKey: 'invoice' });
    expect(contactKey).not.toEqual(invoiceKey);
  });

  it('different cellKeys produce different keys', () => {
    const crm = cellEntityQueryKeys.all(PARAMS);
    const hr = cellEntityQueryKeys.all({ ...PARAMS, cellKey: 'hr' });
    expect(crm).not.toEqual(hr);
  });

  it('list() without query defaults to empty object', () => {
    const key = cellEntityQueryKeys.list(PARAMS);
    const last = key[key.length - 1];
    expect(last).toEqual({});
  });
});
