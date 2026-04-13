export interface AreaChartSeriesView {
  dataKey: string;
  label: string;
  color: string;
}

export interface AreaChartViewProps {
  data: Record<string, string | number | null>[];
  xKey: string;
  series: AreaChartSeriesView[];
  title?: string;
  description?: string;
  height: number;
  showGrid: boolean;
  showLegend: boolean;
  legendPosition: 'top' | 'right' | 'bottom' | 'left' | 'none';
  showTooltip: boolean;
  stacked: boolean;
  fillOpacity: number;
  curved: boolean;
}
