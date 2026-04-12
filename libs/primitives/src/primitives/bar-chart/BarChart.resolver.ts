import { validateRuntimeBarChartPresentation } from '@ikary/presentation';
import { buildBarChartViewModel } from './BarChart.adapter';
import type { BarChartViewProps } from './BarChart.types';

const EMPTY_STATE: BarChartViewProps = {
  data: [{ _placeholder: 0 }],
  xKey: '_placeholder',
  series: [{ dataKey: '_placeholder', label: 'Invalid', color: 'hsl(var(--chart-1))' }],
  height: 300,
  showGrid: true,
  showLegend: false,
  legendPosition: 'none',
  showTooltip: false,
  stacked: false,
  layout: 'horizontal',
  radius: 4,
};

export function resolveBarChart(presentation: unknown): BarChartViewProps {
  const parsed = validateRuntimeBarChartPresentation(presentation);
  if (!parsed.ok) return EMPTY_STATE;
  return buildBarChartViewModel(parsed.value);
}
