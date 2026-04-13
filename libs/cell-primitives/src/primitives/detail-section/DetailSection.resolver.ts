import type { DetailSectionPresentation } from '@ikary/cell-presentation';
import { buildDetailSectionViewModel, type BuildDetailSectionViewModelInput } from './DetailSection.adapter';

export type DetailSectionResolverRuntime = Omit<BuildDetailSectionViewModelInput, 'presentation'>;

export function resolveDetailSection(presentation: DetailSectionPresentation, runtime: DetailSectionResolverRuntime) {
  return buildDetailSectionViewModel({
    presentation,
    ...runtime,
  });
}
