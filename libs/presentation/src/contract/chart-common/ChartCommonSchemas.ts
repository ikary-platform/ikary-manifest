import { z } from 'zod';

export const ChartLegendPositionSchema = z
  .enum(['top', 'right', 'bottom', 'left', 'none'])
  .describe('Position of the chart legend, or "none" to hide it');

export const ChartDataPointSchema = z
  .record(z.union([z.string(), z.number(), z.null()]))
  .describe('A single data point; keys map to xKey / series dataKeys');

export const ChartSeriesSchema = z
  .object({
    dataKey: z.string().min(1).describe('Key in each data point to plot'),
    label: z.string().min(1).describe('Human-readable series name shown in legend and tooltip'),
    color: z.string().optional().describe('Optional CSS color string; defaults to --chart-N palette'),
  })
  .strict();

export type ChartLegendPosition = z.infer<typeof ChartLegendPositionSchema>;
export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;
export type ChartSeries = z.infer<typeof ChartSeriesSchema>;
