import { validateRuntimePieChartPresentation } from '@ikary/cell-presentation';
import { buildPieChartViewModel } from './PieChart.adapter';
import type { PieChartViewProps } from './PieChart.types';

const EMPTY_STATE: PieChartViewProps = {
  data: [{ label: 'No data', value: 1, color: 'hsl(var(--chart-1))' }],
  height: 320,
  showLegend: false,
  legendPosition: 'none',
  showTooltip: false,
  innerRadius: 0,
  showLabels: false,
};

export function resolvePieChart(presentation: unknown): PieChartViewProps {
  const parsed = validateRuntimePieChartPresentation(presentation);
  if (!parsed.ok) return EMPTY_STATE;
  return buildPieChartViewModel(parsed.value);
}
