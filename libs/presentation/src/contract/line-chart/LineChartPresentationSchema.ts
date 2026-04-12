import { z } from 'zod';
import {
  ChartDataPointSchema,
  ChartSeriesSchema,
  ChartLegendPositionSchema,
  validateChartDataKeys,
} from '../chart-common/ChartCommonSchemas';

export const LineChartPresentationSchema = z
  .object({
    type: z.literal('line-chart').describe('Primitive type discriminant'),
    data: z.array(ChartDataPointSchema).min(1).describe('Array of data points'),
    xKey: z.string().min(1).describe('Key in each data point used for the x-axis labels'),
    series: z.array(ChartSeriesSchema).min(1).describe('One or more series to render as lines'),
    title: z.string().min(1).optional().describe('Optional chart title'),
    description: z.string().min(1).optional().describe('Optional chart description shown below the title'),
    height: z.number().int().min(100).max(800).optional().describe('Chart height in pixels (100–800)'),
    showGrid: z.boolean().optional().describe('Whether to show grid lines (default true)'),
    showLegend: z.boolean().optional().describe('Whether to show the legend (default true)'),
    legendPosition: ChartLegendPositionSchema.optional().describe('Legend position'),
    showTooltip: z.boolean().optional().describe('Whether to show hover tooltips (default true)'),
    strokeWidth: z.number().min(1).max(10).optional().describe('Line stroke width in pixels (1–10, default 2)'),
    showDots: z.boolean().optional().describe('Show a dot at each data point (default false)'),
    curved: z.boolean().optional().describe('Use a smooth monotone curve instead of straight lines'),
  })
  .strict()
  .superRefine((val, ctx) => {
    validateChartDataKeys(val.data, val.xKey, val.series, ctx);
  });

export type LineChartPresentation = z.infer<typeof LineChartPresentationSchema>;
