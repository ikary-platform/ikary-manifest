import { validateRuntimeLabelPresentation } from '@ikary/cell-presentation';
import { buildLabelViewModel, type BuildLabelViewModelInput } from './Label.adapter';
import type { LabelViewProps } from './Label.types';

export type LabelResolverRuntime = Omit<BuildLabelViewModelInput, 'presentation'>;

export function resolveLabel(presentation: unknown, runtime: LabelResolverRuntime = {}): LabelViewProps {
  const parsed = validateRuntimeLabelPresentation(presentation);
  if (!parsed.ok) {
    return { text: '' };
  }
  return buildLabelViewModel({ presentation: parsed.value, ...runtime });
}
