import { describe, it, expect } from 'vitest';
import { deriveRelationProviders } from '../derive-relation-providers';
import type { EntityDefinition } from '@ikary/contract';

function makeEntity(relations: unknown[] = []): EntityDefinition {
  return { key: 'customer', label: 'Customer', fields: [], relations } as unknown as EntityDefinition;
}

describe('deriveRelationProviders', () => {
  it('returns empty array when entity has no relations', () => {
    expect(deriveRelationProviders(makeEntity([]))).toEqual([]);
  });

  it('returns empty array when entity.relations is undefined', () => {
    const entity = { key: 'order', label: 'Order', fields: [] } as unknown as EntityDefinition;
    expect(deriveRelationProviders(entity)).toEqual([]);
  });

  it('ignores non-belongs_to relations', () => {
    const entity = makeEntity([{ relation: 'has_many', key: 'invoices', entity: 'invoice' }]);
    expect(deriveRelationProviders(entity)).toEqual([]);
  });

  it('derives a provider for a belongs_to relation with explicit foreignKey', () => {
    const entity = makeEntity([
      { relation: 'belongs_to', key: 'company', entity: 'company', foreignKey: 'company_id' },
    ]);
    const providers = deriveRelationProviders(entity);
    expect(providers).toHaveLength(1);
    expect(providers[0]).toEqual({
      key: 'company',
      entityKey: 'company',
      mode: 'single',
      idFrom: 'company_id',
    });
  });

  it('falls back to <key>Id when foreignKey is absent', () => {
    const entity = makeEntity([{ relation: 'belongs_to', key: 'company', entity: 'company' }]);
    const providers = deriveRelationProviders(entity);
    expect(providers[0].idFrom).toBe('companyId');
  });
});
