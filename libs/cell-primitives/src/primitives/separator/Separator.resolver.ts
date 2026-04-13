import { validateRuntimeSeparatorPresentation } from '@ikary/cell-presentation';
import { buildSeparatorViewModel, type BuildSeparatorViewModelInput } from './Separator.adapter';
import type { SeparatorViewProps } from './Separator.types';

export type SeparatorResolverRuntime = Omit<BuildSeparatorViewModelInput, 'presentation'>;

export function resolveSeparator(presentation: unknown, runtime: SeparatorResolverRuntime = {}): SeparatorViewProps {
  const parsed = validateRuntimeSeparatorPresentation(presentation);
  if (!parsed.ok) {
    return {};
  }
  return buildSeparatorViewModel({ presentation: parsed.value, ...runtime });
}
