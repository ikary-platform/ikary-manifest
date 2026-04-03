import { validateRuntimeDashboardPagePresentation } from '@ikary-manifest/presentation';
import { buildDashboardPageViewModel, type BuildDashboardPageViewModelInput } from './DashboardPage.adapter';
import type { DashboardPageViewProps } from './DashboardPage.types';

export type DashboardPageResolverRuntime = Omit<BuildDashboardPageViewModelInput, 'presentation'>;

export function resolveDashboardPage(
  presentation: unknown,
  runtime: DashboardPageResolverRuntime = {},
): DashboardPageViewProps {
  const parsed = validateRuntimeDashboardPagePresentation(presentation);

  if (!parsed.ok) {
    return {
      variant: 'cell',
      density: 'comfortable',
      title: 'Invalid dashboard configuration',
      actions: [],
      kpis: [],
      primaryWidgets: [],
      secondaryWidgets: [],
      renderState: {
        kind: 'error',
        state: {
          title: 'Invalid dashboard configuration',
          description: parsed.errors[0]?.message ?? 'The dashboard page presentation payload is invalid.',
          variant: 'page',
          severity: 'blocking',
        },
      },
    };
  }

  return buildDashboardPageViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
