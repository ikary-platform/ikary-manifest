import { validateRuntimeFilterBarPresentation } from '@ikary-manifest/presentation';
import { buildFilterBarViewModel, type BuildFilterBarViewModelInput } from './FilterBar.adapter';
import type { FilterBarViewProps } from './FilterBar.types';

export type FilterBarResolverRuntime = Omit<BuildFilterBarViewModelInput, 'presentation'>;

export function resolveFilterBar(presentation: unknown, runtime: FilterBarResolverRuntime = {}): FilterBarViewProps {
  const parsed = validateRuntimeFilterBarPresentation(presentation);

  if (!parsed.ok) {
    return {
      variant: 'list',
      density: 'comfortable',
      loading: false,
      search: {
        placeholder: 'Invalid filter configuration',
        disabled: true,
      },
    };
  }

  return buildFilterBarViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
