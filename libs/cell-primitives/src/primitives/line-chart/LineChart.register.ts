import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { LineChart } from './LineChart';
import { resolveLineChart } from './LineChart.resolver';
import type { LineChartViewProps } from './LineChart.types';

const lineChartResolver: PrimitiveResolver<unknown, LineChartViewProps, Record<string, never>> = (presentation) =>
  resolveLineChart(presentation);

registerPrimitive('line-chart', {
  component: LineChart,
  resolver: lineChartResolver,
});
