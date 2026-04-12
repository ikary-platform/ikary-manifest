import {
  RadialBarChart,
  RadialBar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartHeader, ChartTooltipContent } from '../_chart-shared';
import type { RadialChartViewProps } from './RadialChart.types';

export function RadialChart(props: RadialChartViewProps) {
  const { data, title, description, height, showLegend, showTooltip, innerRadius, outerRadius } = props;

  const chartData = data.map((d) => ({
    name: d.label,
    value: d.value,
    fill: d.color,
  }));

  return (
    <div style={{ padding: '16px' }}>
      <ChartHeader title={title} description={description} />
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          {showTooltip && <Tooltip content={<ChartTooltipContent />} />}
          {showLegend && (
            <Legend
              iconSize={8}
              iconType="circle"
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            />
          )}
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: '#f1f5f9' }}
            label={{ position: 'insideStart', fill: '#fff', fontSize: 10, formatter: (v: number) => `${v}%` }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
