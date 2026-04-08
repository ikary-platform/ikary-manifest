import { validateRuntimeSelectPresentation } from '@ikary/presentation';
import { buildSelectViewModel, type BuildSelectViewModelInput } from './Select.adapter';
import type { SelectViewProps } from './Select.types';

export type SelectResolverRuntime = Omit<BuildSelectViewModelInput, 'presentation'>;

export function resolveSelect(presentation: unknown, runtime: SelectResolverRuntime = {}): SelectViewProps {
  const parsed = validateRuntimeSelectPresentation(presentation);

  if (!parsed.ok) {
    return {
      options: [],
      invalid: true,
      emptyMessage: 'Invalid select configuration',
    };
  }

  return buildSelectViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
