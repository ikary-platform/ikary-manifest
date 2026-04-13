import { z } from 'zod';
import {
  ChartDataPointSchema,
  ChartSeriesSchema,
  ChartLegendPositionSchema,
  validateChartDataKeys,
} from '../chart-common/ChartCommonSchemas';

export const BarChartPresentationSchema = z
  .object({
    type: z.literal('bar-chart').describe('Primitive type discriminant'),
    data: z.array(ChartDataPointSchema).min(1).describe('Array of data points'),
    xKey: z.string().min(1).describe('Key in each data point used for the x-axis labels'),
    series: z.array(ChartSeriesSchema).min(1).describe('One or more series to render as bar groups'),
    title: z.string().min(1).optional().describe('Optional chart title'),
    description: z.string().min(1).optional().describe('Optional chart description shown below the title'),
    height: z.number().int().min(100).max(800).optional().describe('Chart height in pixels (100–800)'),
    showGrid: z.boolean().optional().describe('Whether to show grid lines (default true)'),
    showLegend: z.boolean().optional().describe('Whether to show the legend (default true)'),
    legendPosition: ChartLegendPositionSchema.optional().describe('Legend position'),
    showTooltip: z.boolean().optional().describe('Whether to show hover tooltips (default true)'),
    stacked: z.boolean().optional().describe('Stack bars on top of each other'),
    layout: z.enum(['horizontal', 'vertical']).optional().describe('Bar orientation (default "horizontal")'),
    radius: z.number().int().min(0).max(20).optional().describe('Corner radius of each bar in pixels (0–20)'),
  })
  .strict()
  .superRefine((val, ctx) => {
    validateChartDataKeys(val.data, val.xKey, val.series, ctx);
  });

export type BarChartPresentation = z.infer<typeof BarChartPresentationSchema>;
