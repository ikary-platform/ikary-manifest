import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { DetailPage } from './DetailPage';
import { resolveDetailPage, type DetailPageResolverRuntime } from './DetailPage.resolver';
import type { DetailPageViewProps } from './DetailPage.types';

const detailPageResolver: PrimitiveResolver<unknown, DetailPageViewProps, DetailPageResolverRuntime> = (
  presentation,
  runtime,
) => resolveDetailPage(presentation, runtime);

export function registerDetailPage(): void {
  registerPrimitive('detail-page', {
    component: DetailPage,
    resolver: detailPageResolver,
  });
}

registerDetailPage();
