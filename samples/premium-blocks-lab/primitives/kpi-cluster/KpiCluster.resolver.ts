import {
  KpiClusterPresentationSchema,
  type KpiClusterProps,
} from './KpiClusterPresentationSchema';

export function resolveKpiCluster(
  props: KpiClusterProps & { __slotContext?: unknown },
): KpiClusterProps {
  const { __slotContext, ...rest } = props as Record<string, unknown>;
  return KpiClusterPresentationSchema.parse(rest);
}
