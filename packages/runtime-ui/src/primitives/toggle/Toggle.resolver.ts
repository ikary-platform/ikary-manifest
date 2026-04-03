import { validateRuntimeTogglePresentation } from '@ikary-manifest/presentation';
import { buildToggleViewModel, type BuildToggleViewModelInput } from './Toggle.adapter';
import type { ToggleViewProps } from './Toggle.types';

export type ToggleResolverRuntime = Omit<BuildToggleViewModelInput, 'presentation'>;

export function resolveToggle(presentation: unknown, runtime: ToggleResolverRuntime = {}): ToggleViewProps {
  const parsed = validateRuntimeTogglePresentation(presentation);

  if (!parsed.ok) {
    return {
      invalid: true,
    };
  }

  return buildToggleViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
