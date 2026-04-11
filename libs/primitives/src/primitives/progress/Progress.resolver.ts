import { validateRuntimeProgressPresentation } from '@ikary/presentation';
import { buildProgressViewModel, type BuildProgressViewModelInput } from './Progress.adapter';
import type { ProgressViewProps } from './Progress.types';

export type ProgressResolverRuntime = Omit<BuildProgressViewModelInput, 'presentation'>;

export function resolveProgress(presentation: unknown, runtime: ProgressResolverRuntime = {}): ProgressViewProps {
  const parsed = validateRuntimeProgressPresentation(presentation);
  if (!parsed.ok) {
    return {};
  }
  return buildProgressViewModel({ presentation: parsed.value, ...runtime });
}
