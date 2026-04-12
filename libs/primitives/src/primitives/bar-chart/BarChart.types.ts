export interface BarChartSeriesView {
  dataKey: string;
  label: string;
  color: string;
}

export interface BarChartViewProps {
  data: Record<string, string | number | null>[];
  xKey: string;
  series: BarChartSeriesView[];
  title?: string;
  description?: string;
  height: number;
  showGrid: boolean;
  showLegend: boolean;
  legendPosition: 'top' | 'right' | 'bottom' | 'left' | 'none';
  showTooltip: boolean;
  stacked: boolean;
  layout: 'horizontal' | 'vertical';
  radius: number;
}
