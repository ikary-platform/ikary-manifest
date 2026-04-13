import { validateRuntimeInputPresentation } from '@ikary/cell-presentation';
import { buildInputViewModel, type BuildInputViewModelInput } from './Input.adapter';
import type { InputViewProps } from './Input.types';

export type InputResolverRuntime = Omit<BuildInputViewModelInput, 'presentation'>;

export function resolveInput(presentation: unknown, runtime: InputResolverRuntime = {}): InputViewProps {
  const parsed = validateRuntimeInputPresentation(presentation);

  if (!parsed.ok) {
    return {
      inputType: 'text',
      invalid: true,
    };
  }

  return buildInputViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
