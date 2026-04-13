import type { LineChartPresentation } from '@ikary/cell-presentation';
import { resolveChartColors } from '../_chart-shared/chart-colors';
import type { LineChartViewProps } from './LineChart.types';

export function buildLineChartViewModel(presentation: LineChartPresentation): LineChartViewProps {
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
    strokeWidth: presentation.strokeWidth ?? 2,
    showDots: presentation.showDots ?? false,
    curved: presentation.curved ?? true,
  };
}
