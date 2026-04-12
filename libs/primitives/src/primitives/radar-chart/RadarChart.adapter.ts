import type { RadarChartPresentation } from '@ikary/presentation';
import { resolveChartColors } from '../_chart-shared/chart-colors';
import type { RadarChartViewProps } from './RadarChart.types';

export function buildRadarChartViewModel(presentation: RadarChartPresentation): RadarChartViewProps {
  const colors = resolveChartColors(
    presentation.series.length,
    presentation.series.map((s) => s.color),
  );

  return {
    data: presentation.data as Record<string, string | number | null>[],
    series: presentation.series.map((s, i) => ({
      dataKey: s.dataKey,
      label: s.label,
      color: colors[i]!,
    })),
    subjectKey: presentation.subjectKey ?? 'subject',
    title: presentation.title,
    description: presentation.description,
    height: presentation.height ?? 320,
    showLegend: presentation.showLegend ?? true,
    showTooltip: presentation.showTooltip ?? true,
    fillOpacity: presentation.fillOpacity ?? 0.25,
  };
}
