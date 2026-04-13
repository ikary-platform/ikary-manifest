import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer, ChartHeader, ChartTooltipContent, resolveChartColors } from '../_chart-shared';
import type { LineChartViewProps } from './LineChart.types';

export function LineChart(props: LineChartViewProps) {
  const { data, xKey, series, title, description, height, showGrid, showLegend, legendPosition, showTooltip, strokeWidth, showDots, curved } = props;

  const colors = resolveChartColors(series.length, series.map((s) => s.color));
  const config = Object.fromEntries(series.map((s) => [s.dataKey, { label: s.label, color: s.color }]));
  const curveType = curved ? 'monotone' : 'linear';

  const legendProps = legendPosition !== 'none' && legendPosition !== 'bottom' && legendPosition !== 'top'
    ? { layout: 'vertical' as const, align: legendPosition as 'left' | 'right', verticalAlign: 'middle' as const }
    : { layout: 'horizontal' as const, align: 'center' as const, verticalAlign: (legendPosition === 'top' ? 'top' : 'bottom') as 'top' | 'bottom' };

  return (
    <div style={{ padding: '16px' }}>
      <ChartHeader title={title} description={description} />
      <ChartContainer config={config} height={height}>
        <RechartsLineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          {showTooltip && <Tooltip content={<ChartTooltipContent />} />}
          {showLegend && legendPosition !== 'none' && <Legend {...legendProps} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />}
          {series.map((s, i) => (
            <Line
              key={s.dataKey}
              type={curveType}
              dataKey={s.dataKey}
              name={s.label}
              stroke={colors[i]}
              strokeWidth={strokeWidth}
              dot={showDots ? { r: 3, strokeWidth: 2 } : false}
              activeDot={{ r: 5 }}
            />
          ))}
        </RechartsLineChart>
      </ChartContainer>
    </div>
  );
}
