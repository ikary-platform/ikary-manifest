import type { ListPagePresentation } from '@ikary-manifest/presentation';
import { ListPage } from './ListPage';
import { useListPageRuntime, type UseListPageRuntimeInput } from './useListPageControllerRuntime';
import { resolveListPage } from './ListPage.resolver';

export type ListPageControllerProps = UseListPageRuntimeInput & {
  presentation: ListPagePresentation;
};

export function ListPageController({ presentation, ...runtimeInput }: ListPageControllerProps) {
  const { runtime } = useListPageRuntime({
    presentation,
    ...runtimeInput,
  });

  const viewModel = resolveListPage(presentation, runtime);

  return <ListPage {...viewModel} />;
}
