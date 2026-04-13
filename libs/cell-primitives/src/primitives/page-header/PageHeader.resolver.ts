import type { PageHeaderPresentation } from '@ikary/cell-presentation';
import { buildPageHeaderViewModel, type BuildPageHeaderViewModelInput } from './PageHeader.adapter';

export type PageHeaderResolverRuntime = Omit<BuildPageHeaderViewModelInput, 'presentation'>;

export function resolvePageHeader(presentation: PageHeaderPresentation, runtime: PageHeaderResolverRuntime) {
  return buildPageHeaderViewModel({
    presentation,
    ...runtime,
  });
}
