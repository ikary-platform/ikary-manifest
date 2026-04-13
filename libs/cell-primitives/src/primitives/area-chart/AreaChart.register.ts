import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { AreaChart } from './AreaChart';
import { resolveAreaChart } from './AreaChart.resolver';
import type { AreaChartViewProps } from './AreaChart.types';

const areaChartResolver: PrimitiveResolver<unknown, AreaChartViewProps, Record<string, never>> = (presentation) =>
  resolveAreaChart(presentation);

registerPrimitive('area-chart', {
  component: AreaChart,
  resolver: areaChartResolver,
});
