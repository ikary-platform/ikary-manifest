import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { PieChart } from './PieChart';
import { resolvePieChart } from './PieChart.resolver';
import type { PieChartViewProps } from './PieChart.types';

const pieChartResolver: PrimitiveResolver<unknown, PieChartViewProps, Record<string, never>> = (presentation) =>
  resolvePieChart(presentation);

registerPrimitive('pie-chart', {
  component: PieChart,
  resolver: pieChartResolver,
});
