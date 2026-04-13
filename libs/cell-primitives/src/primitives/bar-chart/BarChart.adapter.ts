import type { BarChartPresentation } from '@ikary/cell-presentation';
import { resolveChartColors } from '../_chart-shared/chart-colors';
import type { BarChartViewProps } from './BarChart.types';

export function buildBarChartViewModel(presentation: BarChartPresentation): BarChartViewProps {
  const colors = resolveChartColors(
    presentation.series.length,
    presentation.series.map((s) => s.color),
  );

  return {
    data: presentation.data as Record<string, string | number | null>[],
    xKey: presentation.xKey,
    series: presentation.series.map((s, i) => ({
      dataKey: s.dataKey,
      label: s.label,
      color: colors[i]!,
    })),
    title: presentation.title,
    description: presentation.description,
    height: presentation.height ?? 300,
    showGrid: presentation.showGrid ?? true,
    showLegend: presentation.showLegend ?? true,
    legendPosition: presentation.legendPosition ?? 'bottom',
    showTooltip: presentation.showTooltip ?? true,
    stacked: presentation.stacked ?? false,
    layout: presentation.layout ?? 'horizontal',
    radius: presentation.radius ?? 4,
  };
}
