export interface LineChartSeriesView {
  dataKey: string;
  label: string;
  color: string;
}

export interface LineChartViewProps {
  data: Record<string, string | number | null>[];
  xKey: string;
  series: LineChartSeriesView[];
  title?: string;
  description?: string;
  height: number;
  showGrid: boolean;
  showLegend: boolean;
  legendPosition: 'top' | 'right' | 'bottom' | 'left' | 'none';
  showTooltip: boolean;
  strokeWidth: number;
  showDots: boolean;
  curved: boolean;
}
