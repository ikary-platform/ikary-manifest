import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer, ChartHeader, ChartTooltipContent, resolveChartColors } from '../_chart-shared';
import type { RadarChartViewProps } from './RadarChart.types';

export function RadarChart(props: RadarChartViewProps) {
  const { data, series, subjectKey, title, description, height, showLegend, showTooltip, fillOpacity } = props;

  const colors = resolveChartColors(series.length, series.map((s) => s.color));
  const config = Object.fromEntries(series.map((s) => [s.dataKey, { label: s.label, color: s.color }]));

  return (
    <div style={{ padding: '16px' }}>
      <ChartHeader title={title} description={description} />
      <ChartContainer config={config} height={height}>
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey={subjectKey} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} />
          {showTooltip && <Tooltip content={<ChartTooltipContent />} />}
          {showLegend && <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />}
          {series.map((s, i) => (
            <Radar
              key={s.dataKey}
              name={s.label}
              dataKey={s.dataKey}
              stroke={colors[i]}
              fill={colors[i]}
              fillOpacity={fillOpacity}
            />
          ))}
        </RechartsRadarChart>
      </ChartContainer>
    </div>
  );
}
