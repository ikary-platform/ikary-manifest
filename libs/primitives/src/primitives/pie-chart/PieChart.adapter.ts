import type { PieChartPresentation } from '@ikary/presentation';
import { resolveChartColors } from '../_chart-shared/chart-colors';
import type { PieChartViewProps } from './PieChart.types';

export function buildPieChartViewModel(presentation: PieChartPresentation): PieChartViewProps {
  const colors = resolveChartColors(
    presentation.data.length,
    presentation.data.map((s) => s.color),
  );

  return {
    data: presentation.data.map((s, i) => ({
      label: s.label,
      value: s.value,
      color: colors[i]!,
    })),
    title: presentation.title,
    description: presentation.description,
    height: presentation.height ?? 320,
    showLegend: presentation.showLegend ?? true,
    legendPosition: presentation.legendPosition ?? 'bottom',
    showTooltip: presentation.showTooltip ?? true,
    innerRadius: presentation.innerRadius ?? 0,
    showLabels: presentation.showLabels ?? false,
  };
}
