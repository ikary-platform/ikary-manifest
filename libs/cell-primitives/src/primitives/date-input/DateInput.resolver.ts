import { validateRuntimeDateInputPresentation } from '@ikary/cell-presentation';
import { buildDateInputViewModel, type BuildDateInputViewModelInput } from './DateInput.adapter';
import type { DateInputViewProps } from './DateInput.types';

export type DateInputResolverRuntime = Omit<BuildDateInputViewModelInput, 'presentation'>;

export function resolveDateInput(presentation: unknown, runtime: DateInputResolverRuntime = {}): DateInputViewProps {
  const parsed = validateRuntimeDateInputPresentation(presentation);

  if (!parsed.ok) {
    return {
      invalid: true,
    };
  }

  return buildDateInputViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
