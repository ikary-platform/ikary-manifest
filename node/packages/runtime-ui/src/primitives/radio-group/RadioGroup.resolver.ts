import { validateRuntimeRadioGroupPresentation } from '@ikary-manifest/presentation';
import { buildRadioGroupViewModel, type BuildRadioGroupViewModelInput } from './RadioGroup.adapter';
import type { RadioGroupViewProps } from './RadioGroup.types';

export type RadioGroupResolverRuntime = Omit<BuildRadioGroupViewModelInput, 'presentation'>;

export function resolveRadioGroup(presentation: unknown, runtime: RadioGroupResolverRuntime = {}): RadioGroupViewProps {
  const parsed = validateRuntimeRadioGroupPresentation(presentation);

  if (!parsed.ok) {
    return {
      options: [],
      invalid: true,
    };
  }

  return buildRadioGroupViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
