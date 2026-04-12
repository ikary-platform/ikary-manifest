export interface RadialChartBarView {
  label: string;
  value: number;
  color: string;
}

export interface RadialChartViewProps {
  data: RadialChartBarView[];
  title?: string;
  description?: string;
  height: number;
  showLegend: boolean;
  showTooltip: boolean;
  innerRadius: number;
  outerRadius: number;
}
