import { type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import type { CellManifestV1 } from '@ikary-manifest/contract';
import type { EntityRouteParams } from '@ikary-manifest/contract';
import { RuntimeContextProvider } from '@ikary-manifest/runtime-ui';
import type { RuntimeContext } from '@ikary-manifest/runtime-ui';
import { useDataHooks } from './data-hooks';
import { derivePageDataContext } from './derive-page-data-context';
import { useSecondaryProviders } from './use-secondary-providers';
import { EntityRegistryProvider } from './EntityRegistryContext';

export interface CellPageDataProviderProps {
  /** The compiled Cell manifest. */
  manifest: CellManifestV1;
  /** Key of the page to render (must exist in manifest.spec.pages). */
  pageKey: string;
  /** Route params without entityKey — the provider injects it per fetch. */
  routeParams: Omit<EntityRouteParams, 'entityKey'>;
  /** Runtime context excluding record + entity — those are derived here. */
  context: Omit<RuntimeContext, 'record' | 'entity'>;
  children: ReactNode;
}

/**
 * Reads the page definition from the manifest, derives the primary data context,
 * fetches the primary record (and all secondary dataProviders), merges everything
 * into a single flat record, and wraps children in a RuntimeContextProvider with
 * that record available.
 *
 * Primitives receive all data automatically without knowing how it was fetched.
 */
export function CellPageDataProvider({ manifest, pageKey, routeParams, context, children }: CellPageDataProviderProps) {
  const { useCellEntityGetOne } = useDataHooks();
  const page = manifest.spec.pages?.find((p) => p.key === pageKey) ?? null;
  const primary = page ? derivePageDataContext(page) : null;
  const entity = manifest.spec.entities?.find((e) => e.key === primary?.entityKey) ?? null;

  // Read the id param from the URL (react-router)
  const routeMatches = useParams<Record<string, string>>();
  const idParam = primary?.idParam ?? 'id';
  const rawId = routeMatches[idParam];

  // Only pass an id when we need a single-record fetch; null disables the hook.
  const singleId = primary?.mode === 'single' ? (rawId ?? null) : null;
  const primaryKey = primary?.entityKey ?? '';
  const primaryParams: EntityRouteParams = { ...routeParams, entityKey: primaryKey };

  const [singleResponse, primaryLoading, primaryError] = useCellEntityGetOne(primaryParams, singleId);

  const primaryRecord = (singleResponse?.data ?? null) as Record<string, unknown> | null;

  // Secondary providers (declared in page.dataProviders)
  const dataProviders = page?.dataProviders ?? [];
  const { mergedData, isLoading: _secondaryLoading } = useSecondaryProviders(dataProviders, primaryRecord, routeParams);

  // Only gate on loading when we're actually waiting for a single-record fetch.
  if (primary?.mode === 'single' && primaryLoading) {
    return <span data-testid="cell-page-loading" />;
  }

  if (primaryError) {
    return <span data-testid="cell-page-error" />;
  }

  const mergedRecord: Record<string, unknown> = primaryRecord ? { ...primaryRecord, ...mergedData } : { ...mergedData };

  const fullContext: RuntimeContext = {
    ...context,
    // Cast EntityDefinition → EntitySchema: shapes are structurally compatible in practice.
    entity: entity as unknown as RuntimeContext['entity'],
    record: Object.keys(mergedRecord).length > 0 ? mergedRecord : undefined,
  };

  return (
    <EntityRegistryProvider manifest={manifest}>
      <RuntimeContextProvider context={fullContext}>{children}</RuntimeContextProvider>
    </EntityRegistryProvider>
  );
}
