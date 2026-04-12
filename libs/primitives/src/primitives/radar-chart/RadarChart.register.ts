import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { RadarChart } from './RadarChart';
import { resolveRadarChart } from './RadarChart.resolver';
import type { RadarChartViewProps } from './RadarChart.types';

const radarChartResolver: PrimitiveResolver<unknown, RadarChartViewProps, Record<string, never>> = (presentation) =>
  resolveRadarChart(presentation);

registerPrimitive('radar-chart', {
  component: RadarChart,
  resolver: radarChartResolver,
});
