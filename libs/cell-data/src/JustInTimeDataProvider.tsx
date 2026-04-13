import { type ReactNode } from 'react';
import type { EntityRouteParams } from '@ikary/cell-contract';
import type { BelongsToRelation } from '@ikary/cell-contract';
import { RuntimeContextProvider, useRuntimeContextOptional } from '@ikary/cell-primitives';
import type { RuntimeContext } from '@ikary/cell-primitives';
import { useSingleProvider } from './use-single-provider';
import { useEntityRegistryOptional } from './EntityRegistryContext';

export interface JustInTimeDataProviderProps {
  /**
   * Key of the belongs_to relation on the current entity (e.g. 'company').
   *
   * The provider looks up this relation in the EntityRegistry to automatically
   * resolve the target entity key and the FK field name from the current record.
   * Fetched data is exposed as `record[relationKey]` to all children.
   */
  relationKey: string;
  /**
   * Override the target entity key to fetch.
   * Defaults to the entity key declared on the relation definition.
   */
  entityKey?: string;
  /**
   * Override the dotted path used to read the FK value from the current record.
   * Defaults to `${relationKey}Id` (e.g. 'companyId' when relationKey='company').
   */
  idFrom?: string;
  /** Route params without entityKey — the provider injects it from the relation. */
  routeParams: Omit<EntityRouteParams, 'entityKey'>;
  children: ReactNode;
}

// ── Inner component — owns the single hook call ───────────────────────────────

interface JitInnerProps {
  entityKey: string;
  idFrom: string;
  contextKey: string;
  routeParams: Omit<EntityRouteParams, 'entityKey'>;
  parentContext: RuntimeContext;
  children: ReactNode;
}

function JitInner({ entityKey, idFrom, contextKey, routeParams, parentContext, children }: JitInnerProps) {
  const definition = { key: contextKey, entityKey, mode: 'single' as const, idFrom };
  const { data } = useSingleProvider(definition, parentContext.record ?? null, routeParams);

  const record: Record<string, unknown> = {
    ...(parentContext.record ?? {}),
    [contextKey]: data,
  };

  return <RuntimeContextProvider context={{ ...parentContext, record }}>{children}</RuntimeContextProvider>;
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * Just-In-Time data provider that lazily fetches a belongs_to related entity
 * when the wrapped block renders — never before.
 *
 * The component reads the current entity's relation definitions from
 * EntityRegistryContext (provided by CellPageDataProvider) to derive
 * the target entity key and FK field automatically, with no manifest
 * changes required.
 *
 * @example
 * // Customer detail page — auto-fetch the related company
 * <JustInTimeDataProvider relationKey="company" routeParams={routeParams}>
 *   <CompanySummaryCard />   // receives record.company
 * </JustInTimeDataProvider>
 */
export function JustInTimeDataProvider({
  relationKey,
  entityKey: entityKeyOverride,
  idFrom: idFromOverride,
  routeParams,
  children,
}: JustInTimeDataProviderProps) {
  const parentContext = useRuntimeContextOptional();
  const registry = useEntityRegistryOptional();

  // Gracefully degrade when called outside a runtime context
  if (!parentContext) return <>{children}</>;

  // Look up belongs_to relation from the entity registry
  const currentEntityKey = parentContext.entity?.key;
  const entityDef = registry?.getEntity(currentEntityKey ?? '');
  const relation = entityDef?.relations?.find(
    (r): r is BelongsToRelation => r.relation === 'belongs_to' && r.key === relationKey,
  );

  const resolvedEntityKey = entityKeyOverride ?? relation?.entity ?? relationKey;
  const resolvedIdFrom = idFromOverride ?? relation?.foreignKey ?? `${relationKey}Id`;

  return (
    <JitInner
      entityKey={resolvedEntityKey}
      idFrom={resolvedIdFrom}
      contextKey={relationKey}
      routeParams={routeParams}
      parentContext={parentContext}
    >
      {children}
    </JitInner>
  );
}
