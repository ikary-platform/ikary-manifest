import { validateRuntimeEmptyStatePresentation } from '@ikary/presentation';
import { buildEmptyStateViewModel, type BuildEmptyStateViewModelInput } from './EmptyState.adapter';
import type { EmptyStateViewProps } from './EmptyState.types';

export type EmptyStateResolverRuntime = Omit<BuildEmptyStateViewModelInput, 'presentation'>;

export function resolveEmptyState(presentation: unknown, runtime: EmptyStateResolverRuntime = {}): EmptyStateViewProps {
  const parsed = validateRuntimeEmptyStatePresentation(presentation);

  if (!parsed.ok) {
    return {
      title: 'Invalid empty state',
      description: parsed.errors[0]?.message ?? 'The empty state configuration is invalid.',
      variant: 'section',
      density: 'comfortable',
    };
  }

  return buildEmptyStateViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
