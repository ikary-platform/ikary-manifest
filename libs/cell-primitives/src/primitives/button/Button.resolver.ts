import { validateRuntimeButtonPresentation } from '@ikary/cell-presentation';
import { buildButtonViewModel, type BuildButtonViewModelInput } from './Button.adapter';
import type { ButtonViewProps } from './Button.types';

export type ButtonResolverRuntime = Omit<BuildButtonViewModelInput, 'presentation'>;

export function resolveButton(presentation: unknown, runtime: ButtonResolverRuntime = {}): ButtonViewProps {
  const parsed = validateRuntimeButtonPresentation(presentation);
  if (!parsed.ok) {
    return { label: '', disabled: true };
  }
  return buildButtonViewModel({ presentation: parsed.value, ...runtime });
}
