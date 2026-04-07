import type { DetailItem as DetailItemPresentation } from '@ikary/presentation';
import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { buildDetailItemViewModel, type BuildDetailItemViewModelInput } from './DetailItem.adapter';
import { DetailItem } from './DetailItem';
import type { DetailItemViewProps } from './DetailItem.types';

export type DetailItemResolverRuntime = Omit<BuildDetailItemViewModelInput, 'presentation'>;

const resolveDetailItem: PrimitiveResolver<DetailItemPresentation, DetailItemViewProps, DetailItemResolverRuntime> = (
  presentation,
  runtime,
) =>
  buildDetailItemViewModel({
    presentation,
    ...runtime,
  });

registerPrimitive('detail-item', {
  component: DetailItem,
  resolver: resolveDetailItem,
});
