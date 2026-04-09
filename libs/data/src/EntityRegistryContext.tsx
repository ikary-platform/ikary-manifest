import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { CellManifestV1, EntityDefinition } from '@ikary/contract';

export interface EntityRegistry {
  entities: EntityDefinition[];
  getEntity: (key: string) => EntityDefinition | undefined;
}

const EntityRegistryCtx = createContext<EntityRegistry | null>(null);

/**
 * Provides the full entity registry derived from the cell manifest.
 * Wrap at the cell root (e.g. inside CellPageDataProvider) so any descendant
 * can look up entity definitions without prop-drilling.
 */
export function EntityRegistryProvider({ manifest, children }: { manifest: CellManifestV1; children: ReactNode }) {
  const registry = useMemo<EntityRegistry>(() => {
    const entities = manifest.spec.entities ?? [];
    return {
      entities,
      getEntity: (key) => entities.find((e) => e.key === key),
    };
  }, [manifest]);

  return <EntityRegistryCtx.Provider value={registry}>{children}</EntityRegistryCtx.Provider>;
}

/** Requires EntityRegistryProvider to be present in the tree. */
export function useEntityRegistry(): EntityRegistry {
  const ctx = useContext(EntityRegistryCtx);
  if (!ctx) {
    throw new Error('[data-runtime] useEntityRegistry must be used inside EntityRegistryProvider');
  }
  return ctx;
}

/** Safe variant — returns null when called outside a provider. */
export function useEntityRegistryOptional(): EntityRegistry | null {
  return useContext(EntityRegistryCtx);
}
