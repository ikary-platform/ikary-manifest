import type { PageDefinition } from '@ikary-manifest/contract';

export interface PrimaryDataContext {
  entityKey: string;
  idParam: string;
  mode: 'single' | 'list';
}

/**
 * Derives the primary data context from a page definition.
 *
 * - entity-detail / entity-edit  → single fetch, idParam from dataContext or 'id'
 * - entity-list                  → list (entity schema only; list data is loaded by primitives)
 * - entity-create                → null (no pre-existing record)
 * - dashboard / custom           → null unless an explicit dataContext override is provided
 */
export function derivePageDataContext(page: PageDefinition): PrimaryDataContext | null {
  switch (page.type) {
    case 'entity-detail':
    case 'entity-edit':
      return {
        entityKey: page.entity!,
        mode: 'single',
        idParam: page.dataContext?.idParam ?? 'id',
      };

    case 'entity-list':
      return {
        entityKey: page.entity!,
        mode: 'list',
        idParam: 'id',
      };

    case 'entity-create':
      return null;

    case 'dashboard':
    case 'custom':
      return page.dataContext
        ? {
            entityKey: page.dataContext.entityKey,
            mode: 'single',
            idParam: page.dataContext.idParam,
          }
        : null;

    default:
      return null;
  }
}
