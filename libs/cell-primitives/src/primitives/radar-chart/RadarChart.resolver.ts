import { validateRuntimeRadarChartPresentation } from '@ikary/cell-presentation';
import { buildRadarChartViewModel } from './RadarChart.adapter';
import type { RadarChartViewProps } from './RadarChart.types';

const EMPTY_STATE: RadarChartViewProps = {
  data: [{ subject: 'A', value: 0 }, { subject: 'B', value: 0 }, { subject: 'C', value: 0 }],
  series: [{ dataKey: 'value', label: 'Invalid', color: 'hsl(var(--chart-1))' }],
  subjectKey: 'subject',
  height: 320,
  showLegend: false,
  showTooltip: false,
  fillOpacity: 0.25,
};

export function resolveRadarChart(presentation: unknown): RadarChartViewProps {
  const parsed = validateRuntimeRadarChartPresentation(presentation);
  if (!parsed.ok) return EMPTY_STATE;
  return buildRadarChartViewModel(parsed.value);
}
