import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { MetricCard } from './MetricCard';
import { resolveMetricCard, type MetricCardResolverRuntime } from './MetricCard.resolver';
import type { MetricCardViewProps } from './MetricCard.types';

const metricCardResolver: PrimitiveResolver<unknown, MetricCardViewProps, MetricCardResolverRuntime> = (
  presentation,
  runtime,
) => resolveMetricCard(presentation, runtime);

export function registerMetricCard(): void {
  registerPrimitive('metric-card', {
    component: MetricCard,
    resolver: metricCardResolver,
  });
}

registerMetricCard();
