import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { LoadingState } from './LoadingState';
import { resolveLoadingState, type LoadingStateResolverRuntime } from './LoadingState.resolver';
import type { LoadingStateViewProps } from './LoadingState.types';

const loadingStateResolver: PrimitiveResolver<unknown, LoadingStateViewProps, LoadingStateResolverRuntime> = (
  presentation,
  runtime,
) => resolveLoadingState(presentation, runtime);

export function registerLoadingState(): void {
  registerPrimitive('loading-state', {
    component: LoadingState,
    resolver: loadingStateResolver,
  });
}

registerLoadingState();
