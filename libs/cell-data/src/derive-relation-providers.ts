import type { EntityDefinition, DataProviderDefinition, BelongsToRelation } from '@ikary/cell-contract';

/**
 * Derives DataProviderDefinitions from an entity's belongs_to relations.
 *
 * For each belongs_to relation the system infers:
 *   - entityKey  = relation.entity
 *   - mode       = 'single'
 *   - idFrom     = relation.foreignKey ?? `${relation.key}Id`
 *
 * The result can be merged with explicitly declared page.dataProviders so that
 * JIT fetching works without any manual configuration in the manifest.
 *
 * @example
 * // Customer entity has belongs_to { key: 'company', entity: 'company' }
 * deriveRelationProviders(customerEntity)
 * // → [{ key: 'company', entityKey: 'company', mode: 'single', idFrom: 'companyId' }]
 */
export function deriveRelationProviders(entity: EntityDefinition): DataProviderDefinition[] {
  return (entity.relations ?? [])
    .filter((r): r is BelongsToRelation => r.relation === 'belongs_to')
    .map((rel) => ({
      key: rel.key,
      entityKey: rel.entity,
      mode: 'single' as const,
      idFrom: rel.foreignKey ?? `${rel.key}Id`,
    }));
}
