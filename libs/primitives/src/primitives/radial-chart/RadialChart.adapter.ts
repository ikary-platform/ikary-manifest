import type { RadialChartPresentation } from '@ikary/presentation';
import { resolveChartColors } from '../_chart-shared/chart-colors';
import type { RadialChartViewProps } from './RadialChart.types';

export function buildRadialChartViewModel(presentation: RadialChartPresentation): RadialChartViewProps {
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
    showTooltip: presentation.showTooltip ?? true,
    innerRadius: presentation.innerRadius ?? 30,
    outerRadius: presentation.outerRadius ?? 80,
  };
}
