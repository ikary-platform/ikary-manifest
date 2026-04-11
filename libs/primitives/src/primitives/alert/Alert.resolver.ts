import { validateRuntimeAlertPresentation } from '@ikary/presentation';
import { buildAlertViewModel, type BuildAlertViewModelInput } from './Alert.adapter';
import type { AlertViewProps } from './Alert.types';

export type AlertResolverRuntime = Omit<BuildAlertViewModelInput, 'presentation'>;

export function resolveAlert(presentation: unknown, runtime: AlertResolverRuntime = {}): AlertViewProps {
  const parsed = validateRuntimeAlertPresentation(presentation);
  if (!parsed.ok) {
    return {};
  }
  return buildAlertViewModel({ presentation: parsed.value, ...runtime });
}
