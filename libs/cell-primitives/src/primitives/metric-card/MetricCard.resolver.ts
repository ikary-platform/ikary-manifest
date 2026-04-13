import { validateRuntimeMetricCardPresentation } from '@ikary/cell-presentation';
import { buildMetricCardViewModel, type BuildMetricCardViewModelInput } from './MetricCard.adapter';
import type { MetricCardViewProps } from './MetricCard.types';

export type MetricCardResolverRuntime = Omit<BuildMetricCardViewModelInput, 'presentation'>;

export function resolveMetricCard(presentation: unknown, runtime: MetricCardResolverRuntime = {}): MetricCardViewProps {
  const parsed = validateRuntimeMetricCardPresentation(presentation);

  if (!parsed.ok) {
    return {
      variant: 'default',
      density: 'comfortable',
      label: 'Invalid metric configuration',
      value: '—',
      tone: 'default',
      renderState: {
        kind: 'error',
        state: {
          title: 'Invalid metric configuration',
          description: parsed.errors[0]?.message ?? 'The metric card presentation payload is invalid.',
          variant: 'inline',
          severity: 'soft',
        },
      },
    };
  }

  return buildMetricCardViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
