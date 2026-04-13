import type { PaginationPresentation } from '@ikary/cell-presentation';
import { buildPaginationViewModel, type BuildPaginationViewModelInput } from './Pagination.adapter';

export type PaginationResolverRuntime = Omit<BuildPaginationViewModelInput, 'presentation'>;

export function resolvePagination(presentation: PaginationPresentation, runtime: PaginationResolverRuntime) {
  return buildPaginationViewModel({
    presentation,
    ...runtime,
  });
}
