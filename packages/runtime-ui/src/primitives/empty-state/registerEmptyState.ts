import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { EmptyState } from './EmptyState';
import { resolveEmptyState, type EmptyStateResolverRuntime } from './EmptyState.resolver';
import type { EmptyStateViewProps } from './EmptyState.types';

const emptyStateResolver: PrimitiveResolver<unknown, EmptyStateViewProps, EmptyStateResolverRuntime> = (
  presentation,
  runtime,
) => resolveEmptyState(presentation, runtime);

export function registerEmptyState(): void {
  registerPrimitive('empty-state', {
    component: EmptyState,
    resolver: emptyStateResolver,
  });
}

registerEmptyState();
