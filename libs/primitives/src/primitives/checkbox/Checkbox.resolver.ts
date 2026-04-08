import { validateRuntimeCheckboxPresentation } from '@ikary/presentation';
import { buildCheckboxViewModel, type BuildCheckboxViewModelInput } from './Checkbox.adapter';
import type { CheckboxViewProps } from './Checkbox.types';

export type CheckboxResolverRuntime = Omit<BuildCheckboxViewModelInput, 'presentation'>;

export function resolveCheckbox(presentation: unknown, runtime: CheckboxResolverRuntime = {}): CheckboxViewProps {
  const parsed = validateRuntimeCheckboxPresentation(presentation);

  if (!parsed.ok) {
    return {
      invalid: true,
    };
  }

  return buildCheckboxViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
