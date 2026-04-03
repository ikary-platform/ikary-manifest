import { validateRuntimeLoadingStatePresentation } from '@ikary-manifest/presentation';
import { buildLoadingStateViewModel, type BuildLoadingStateViewModelInput } from './LoadingState.adapter';
import type { LoadingStateViewProps } from './LoadingState.types';

export type LoadingStateResolverRuntime = Omit<BuildLoadingStateViewModelInput, 'presentation'>;

export function resolveLoadingState(
  presentation: unknown,
  runtime: LoadingStateResolverRuntime = {},
): LoadingStateViewProps {
  const parsed = validateRuntimeLoadingStatePresentation(presentation);

  if (!parsed.ok) {
    return {
      variant: 'section',
      density: 'comfortable',
      mode: 'spinner',
      label: 'Loading',
    };
  }

  return buildLoadingStateViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
