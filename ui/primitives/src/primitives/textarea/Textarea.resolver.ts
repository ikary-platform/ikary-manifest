import { validateRuntimeTextareaPresentation } from '@ikary/presentation';
import { buildTextareaViewModel, type BuildTextareaViewModelInput } from './Textarea.adapter';
import type { TextareaViewProps } from './Textarea.types';

export type TextareaResolverRuntime = Omit<BuildTextareaViewModelInput, 'presentation'>;

export function resolveTextarea(presentation: unknown, runtime: TextareaResolverRuntime = {}): TextareaViewProps {
  const parsed = validateRuntimeTextareaPresentation(presentation);

  if (!parsed.ok) {
    return {
      invalid: true,
    };
  }

  return buildTextareaViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
