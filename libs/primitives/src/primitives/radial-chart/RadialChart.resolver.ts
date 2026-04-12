import { validateRuntimeRadialChartPresentation } from '@ikary/presentation';
import { buildRadialChartViewModel } from './RadialChart.adapter';
import type { RadialChartViewProps } from './RadialChart.types';

const EMPTY_STATE: RadialChartViewProps = {
  data: [{ label: 'No data', value: 0, color: 'hsl(var(--chart-1))' }],
  height: 320,
  showLegend: false,
  showTooltip: false,
  innerRadius: 30,
  outerRadius: 80,
};

export function resolveRadialChart(presentation: unknown): RadialChartViewProps {
  const parsed = validateRuntimeRadialChartPresentation(presentation);
  if (!parsed.ok) return EMPTY_STATE;
  return buildRadialChartViewModel(parsed.value);
}
