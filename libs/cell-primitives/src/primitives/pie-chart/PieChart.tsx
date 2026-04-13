import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer, ChartHeader, ChartTooltipContent } from '../_chart-shared';
import type { PieChartViewProps } from './PieChart.types';

export function PieChart(props: PieChartViewProps) {
  const { data, title, description, height, showLegend, legendPosition, showTooltip, innerRadius, showLabels } = props;

  const config = Object.fromEntries(data.map((s) => [s.label, { label: s.label, color: s.color }]));

  const legendProps = legendPosition !== 'none' && legendPosition !== 'bottom' && legendPosition !== 'top'
    ? { layout: 'vertical' as const, align: legendPosition as 'left' | 'right', verticalAlign: 'middle' as const }
    : { layout: 'horizontal' as const, align: 'center' as const, verticalAlign: (legendPosition === 'top' ? 'top' : 'bottom') as 'top' | 'bottom' };

  return (
    <div style={{ padding: '16px' }}>
      <ChartHeader title={title} description={description} />
      <ChartContainer config={config} height={height}>
        <RechartsPieChart>
          {showTooltip && <Tooltip content={<ChartTooltipContent />} />}
          {showLegend && legendPosition !== 'none' && (
            <Legend {...legendProps} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
          )}
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="70%"
            paddingAngle={innerRadius > 0 ? 2 : 0}
            label={showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
            labelLine={showLabels}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
        </RechartsPieChart>
      </ChartContainer>
    </div>
  );
}
