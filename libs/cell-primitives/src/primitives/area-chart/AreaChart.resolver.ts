import { validateRuntimeAreaChartPresentation } from '@ikary/cell-presentation';
import { buildAreaChartViewModel } from './AreaChart.adapter';
import type { AreaChartViewProps } from './AreaChart.types';

const EMPTY_STATE: AreaChartViewProps = {
  data: [{ _placeholder: 0 }],
  xKey: '_placeholder',
  series: [{ dataKey: '_placeholder', label: 'Invalid', color: 'hsl(var(--chart-1))' }],
  height: 300,
  showGrid: true,
  showLegend: false,
  legendPosition: 'none',
  showTooltip: false,
  stacked: false,
  fillOpacity: 0.3,
  curved: true,
};

export function resolveAreaChart(presentation: unknown): AreaChartViewProps {
  const parsed = validateRuntimeAreaChartPresentation(presentation);
  if (!parsed.ok) return EMPTY_STATE;
  return buildAreaChartViewModel(parsed.value);
}
