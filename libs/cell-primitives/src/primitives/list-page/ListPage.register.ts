import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import type { ListPagePresentation } from '@ikary/cell-presentation';
import { ListPage } from './ListPage';
import { resolveListPage, type ListPageResolverRuntime } from './ListPage.resolver';
import type { ListPageViewProps } from './ListPage.types';

const listPageResolver: PrimitiveResolver<ListPagePresentation, ListPageViewProps, ListPageResolverRuntime> = (
  presentation,
  runtime,
) => resolveListPage(presentation, runtime);

registerPrimitive(
  'list-page',
  {
    component: ListPage,
    resolver: listPageResolver,
  },
  { isController: true },
);
