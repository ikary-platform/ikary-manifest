import { type ReactNode } from 'react';
import type { DataProviderDefinition } from '@ikary-manifest/contract';
import type { EntityRouteParams } from '@ikary-manifest/contract';
import { RuntimeContextProvider, useRuntimeContextOptional } from '@ikary-manifest/runtime-ui';
import type { RuntimeContext } from '@ikary-manifest/runtime-ui';
import { useSingleProvider } from './use-single-provider';
import { useListProvider } from './use-list-provider';

export interface CellBlockDataProviderProps {
  /** The data provider definition from the block's manifest. */
  definition: DataProviderDefinition;
  /** Route params without entityKey. */
  routeParams: Omit<EntityRouteParams, 'entityKey'>;
  children: ReactNode;
}

// ── Inner providers — each calls exactly one hook family ──────────────────────

interface InnerProps {
  definition: DataProviderDefinition;
  routeParams: Omit<EntityRouteParams, 'entityKey'>;
  parentContext: RuntimeContext;
  children: ReactNode;
}

function SingleInner({ definition, routeParams, parentContext, children }: InnerProps) {
  const { data } = useSingleProvider(
    definition as DataProviderDefinition & { mode: 'single' },
    parentContext.record ?? null,
    routeParams,
  );
  const record: Record<string, unknown> = {
    ...(parentContext.record ?? {}),
    [definition.key]: data,
  };
  return <RuntimeContextProvider context={{ ...parentContext, record }}>{children}</RuntimeContextProvider>;
}

function ListInner({ definition, routeParams, parentContext, children }: InnerProps) {
  const { data } = useListProvider(
    definition as DataProviderDefinition & { mode: 'list' },
    parentContext.record ?? null,
    routeParams,
  );
  const record: Record<string, unknown> = {
    ...(parentContext.record ?? {}),
    [definition.key]: data,
  };
  return <RuntimeContextProvider context={{ ...parentContext, record }}>{children}</RuntimeContextProvider>;
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * Lazily fetches one data provider's data and makes it available to children
 * by overriding the nearest RuntimeContext record.
 *
 * Used as the `blockWrapper` injected into `renderLayout` by consuming apps.
 */
export function CellBlockDataProvider({ definition, routeParams, children }: CellBlockDataProviderProps) {
  const parentContext = useRuntimeContextOptional();

  // No context available — render children unmodified rather than crashing.
  if (!parentContext) return <>{children}</>;

  if (definition.mode === 'single') {
    return (
      <SingleInner definition={definition} routeParams={routeParams} parentContext={parentContext}>
        {children}
      </SingleInner>
    );
  }

  return (
    <ListInner definition={definition} routeParams={routeParams} parentContext={parentContext}>
      {children}
    </ListInner>
  );
}
