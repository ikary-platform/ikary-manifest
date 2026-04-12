import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer, ChartHeader, ChartTooltipContent, resolveChartColors } from '../_chart-shared';
import type { BarChartViewProps } from './BarChart.types';

export function BarChart(props: BarChartViewProps) {
  const { data, xKey, series, title, description, height, showGrid, showLegend, legendPosition, showTooltip, stacked, layout, radius } = props;

  const colors = resolveChartColors(series.length, series.map((s) => s.color));
  const config = Object.fromEntries(series.map((s) => [s.dataKey, { label: s.label, color: s.color }]));
  const isVertical = layout === 'vertical';

  const legendProps = legendPosition !== 'none' && legendPosition !== 'bottom' && legendPosition !== 'top'
    ? { layout: 'vertical' as const, align: legendPosition as 'left' | 'right', verticalAlign: 'middle' as const }
    : { layout: 'horizontal' as const, align: 'center' as const, verticalAlign: (legendPosition === 'top' ? 'top' : 'bottom') as 'top' | 'bottom' };

  return (
    <div style={{ padding: '16px' }}>
      <ChartHeader title={title} description={description} />
      <ChartContainer config={config} height={height}>
        <RechartsBarChart
          data={data}
          layout={isVertical ? 'vertical' : 'horizontal'}
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={!isVertical} vertical={isVertical} />}
          {isVertical ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            </>
          )}
          {showTooltip && <Tooltip content={<ChartTooltipContent />} />}
          {showLegend && legendPosition !== 'none' && <Legend {...legendProps} iconSize={8} iconType="square" wrapperStyle={{ fontSize: '11px' }} />}
          {series.map((s, i) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.label}
              fill={colors[i]}
              radius={radius}
              stackId={stacked ? 'stack' : undefined}
              maxBarSize={48}
            />
          ))}
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
}
