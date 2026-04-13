import { validateRuntimeLineChartPresentation } from '@ikary/cell-presentation';
import { buildLineChartViewModel } from './LineChart.adapter';
import type { LineChartViewProps } from './LineChart.types';

const EMPTY_STATE: LineChartViewProps = {
  data: [{ _placeholder: 0 }],
  xKey: '_placeholder',
  series: [{ dataKey: '_placeholder', label: 'Invalid', color: 'hsl(var(--chart-1))' }],
  height: 300,
  showGrid: true,
  showLegend: false,
  legendPosition: 'none',
  showTooltip: false,
  strokeWidth: 2,
  showDots: false,
  curved: true,
};

export function resolveLineChart(presentation: unknown): LineChartViewProps {
  const parsed = validateRuntimeLineChartPresentation(presentation);
  if (!parsed.ok) return EMPTY_STATE;
  return buildLineChartViewModel(parsed.value);
}
