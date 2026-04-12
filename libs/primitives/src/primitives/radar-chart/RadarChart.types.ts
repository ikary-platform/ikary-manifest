export interface RadarChartSeriesView {
  dataKey: string;
  label: string;
  color: string;
}

export interface RadarChartViewProps {
  data: Record<string, string | number | null>[];
  series: RadarChartSeriesView[];
  subjectKey: string;
  title?: string;
  description?: string;
  height: number;
  showLegend: boolean;
  showTooltip: boolean;
  fillOpacity: number;
}
