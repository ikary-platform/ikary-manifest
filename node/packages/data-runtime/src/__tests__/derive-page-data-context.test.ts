import { describe, it, expect } from 'vitest';
import { derivePageDataContext } from '../derive-page-data-context';
import type { PageDefinition } from '@ikary-manifest/contract';

function makePage(overrides: Partial<PageDefinition>): PageDefinition {
  return {
    key: 'test-page',
    type: 'entity-detail',
    title: 'Test',
    path: '/test',
    ...overrides,
  } as PageDefinition;
}

describe('derivePageDataContext', () => {
  it('entity-detail → single with idParam=id by default', () => {
    const ctx = derivePageDataContext(makePage({ type: 'entity-detail', entity: 'customer' }));
    expect(ctx).toEqual({ entityKey: 'customer', mode: 'single', idParam: 'id' });
  });

  it('entity-detail → single with overridden idParam from dataContext', () => {
    const page = makePage({
      type: 'entity-detail',
      entity: 'customer',
      dataContext: { entityKey: 'customer', idParam: 'customerId' },
    });
    const ctx = derivePageDataContext(page);
    expect(ctx).toEqual({ entityKey: 'customer', mode: 'single', idParam: 'customerId' });
  });

  it('entity-edit → single with idParam=id', () => {
    const ctx = derivePageDataContext(makePage({ type: 'entity-edit', entity: 'order' }));
    expect(ctx).toEqual({ entityKey: 'order', mode: 'single', idParam: 'id' });
  });

  it('entity-list → list mode', () => {
    const ctx = derivePageDataContext(makePage({ type: 'entity-list', entity: 'invoice' }));
    expect(ctx).toEqual({ entityKey: 'invoice', mode: 'list', idParam: 'id' });
  });

  it('entity-create → null', () => {
    const ctx = derivePageDataContext(makePage({ type: 'entity-create', entity: 'product' }));
    expect(ctx).toBeNull();
  });

  it('dashboard with no dataContext → null', () => {
    const ctx = derivePageDataContext(makePage({ type: 'dashboard' }));
    expect(ctx).toBeNull();
  });

  it('custom with no dataContext → null', () => {
    const ctx = derivePageDataContext(makePage({ type: 'custom' }));
    expect(ctx).toBeNull();
  });

  it('custom with explicit dataContext → single using that context', () => {
    const page = makePage({
      type: 'custom',
      dataContext: { entityKey: 'profile', idParam: 'profileId' },
    });
    const ctx = derivePageDataContext(page);
    expect(ctx).toEqual({ entityKey: 'profile', mode: 'single', idParam: 'profileId' });
  });

  it('dashboard with explicit dataContext → single', () => {
    const page = makePage({
      type: 'dashboard',
      dataContext: { entityKey: 'summary', idParam: 'id' },
    });
    const ctx = derivePageDataContext(page);
    expect(ctx).toEqual({ entityKey: 'summary', mode: 'single', idParam: 'id' });
  });
});
