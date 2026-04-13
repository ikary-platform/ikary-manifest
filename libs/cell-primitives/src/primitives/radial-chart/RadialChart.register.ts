import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { RadialChart } from './RadialChart';
import { resolveRadialChart } from './RadialChart.resolver';
import type { RadialChartViewProps } from './RadialChart.types';

const radialChartResolver: PrimitiveResolver<unknown, RadialChartViewProps, Record<string, never>> = (presentation) =>
  resolveRadialChart(presentation);

registerPrimitive('radial-chart', {
  component: RadialChart,
  resolver: radialChartResolver,
});
