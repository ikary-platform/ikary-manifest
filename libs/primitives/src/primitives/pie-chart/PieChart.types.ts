export interface PieChartSliceView {
  label: string;
  value: number;
  color: string;
}

export interface PieChartViewProps {
  data: PieChartSliceView[];
  title?: string;
  description?: string;
  height: number;
  showLegend: boolean;
  legendPosition: 'top' | 'right' | 'bottom' | 'left' | 'none';
  showTooltip: boolean;
  innerRadius: number;
  showLabels: boolean;
}
