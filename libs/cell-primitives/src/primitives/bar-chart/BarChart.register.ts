import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { BarChart } from './BarChart';
import { resolveBarChart } from './BarChart.resolver';
import type { BarChartViewProps } from './BarChart.types';

const barChartResolver: PrimitiveResolver<unknown, BarChartViewProps, Record<string, never>> = (presentation) =>
  resolveBarChart(presentation);

registerPrimitive('bar-chart', {
  component: BarChart,
  resolver: barChartResolver,
});
