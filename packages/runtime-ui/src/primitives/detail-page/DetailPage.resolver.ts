import { validateRuntimeDetailPagePresentation } from '@ikary-manifest/presentation';
import { buildDetailPageViewModel, type BuildDetailPageViewModelInput } from './DetailPage.adapter';
import type { DetailPageViewProps } from './DetailPage.types';

export type DetailPageResolverRuntime = Omit<BuildDetailPageViewModelInput, 'presentation'>;

export function resolveDetailPage(presentation: unknown, runtime: DetailPageResolverRuntime = {}): DetailPageViewProps {
  const parsed = validateRuntimeDetailPagePresentation(presentation);

  if (!parsed.ok) {
    return {
      title: 'Invalid detail page configuration',
      metadata: [],
      actions: [],
      tabs: [],
      activeTabKey: '',
      overviewEditable: false,
      isEditing: false,
      contentKey: 'invalid-detail-page',
      renderState: {
        kind: 'error',
        state: {
          title: 'Invalid detail page configuration',
          description: parsed.errors[0]?.message ?? 'The detail page presentation payload is invalid.',
          variant: 'page',
          severity: 'blocking',
        },
      },
    };
  }

  return buildDetailPageViewModel({
    presentation: parsed.value,
    ...runtime,
  });
}
