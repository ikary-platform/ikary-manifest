import { validateRuntimeErrorStatePresentation } from '@ikary/cell-presentation';
import { buildErrorStateViewModel, type BuildErrorStateViewModelInput } from './ErrorState.adapter';
import type { ErrorStateViewProps } from './ErrorState.types';

export type ErrorStateResolverRuntime = Omit<BuildErrorStateViewModelInput, 'presentation'>;

export function resolveErrorState(presentation: unknown, runtime: ErrorStateResolverRuntime = {}): ErrorStateViewProps {
  const parsed = validateRuntimeErrorStatePresentation(presentation);

  if (!parsed.ok) {
    return {
      title: 'Something went wrong',
      description: parsed.errors[0]?.message ?? 'The error state configuration is invalid.',
      variant: 'unexpected',
      severity: 'blocking',
    };
  }

  return buildErrorStateViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
