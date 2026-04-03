import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { ErrorState } from './ErrorState';
import { resolveErrorState, type ErrorStateResolverRuntime } from './ErrorState.resolver';
import type { ErrorStateViewProps } from './ErrorState.types';

const errorStateResolver: PrimitiveResolver<unknown, ErrorStateViewProps, ErrorStateResolverRuntime> = (
  presentation,
  runtime,
) => resolveErrorState(presentation, runtime);

export function registerErrorState(): void {
  registerPrimitive('error-state', {
    component: ErrorState,
    resolver: errorStateResolver,
  });
}

registerErrorState();
