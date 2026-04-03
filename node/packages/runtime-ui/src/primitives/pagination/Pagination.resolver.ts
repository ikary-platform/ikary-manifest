import type { PaginationPresentation } from '@ikary-manifest/presentation';
import { buildPaginationViewModel, type BuildPaginationViewModelInput } from './Pagination.adapter';

export type PaginationResolverRuntime = Omit<BuildPaginationViewModelInput, 'presentation'>;

export function resolvePagination(presentation: PaginationPresentation, runtime: PaginationResolverRuntime) {
  return buildPaginationViewModel({
    presentation,
    ...runtime,
  });
}
