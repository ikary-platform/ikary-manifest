import type { AreaChartPresentation } from '@ikary/cell-presentation';
import { resolveChartColors } from '../_chart-shared/chart-colors';
import type { AreaChartViewProps } from './AreaChart.types';

export function buildAreaChartViewModel(presentation: AreaChartPresentation): AreaChartViewProps {
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
    fillOpacity: presentation.fillOpacity ?? 0.3,
    curved: presentation.curved ?? true,
  };
}
