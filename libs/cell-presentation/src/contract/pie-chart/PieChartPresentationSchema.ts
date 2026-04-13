import { z } from 'zod';
import { ChartLegendPositionSchema } from '../chart-common/ChartCommonSchemas';

export const PieChartSliceSchema = z
  .object({
    label: z.string().min(1).describe('Segment label shown in legend and tooltip'),
    value: z.number().describe('Numeric value of the segment'),
    color: z.string().optional().describe('Optional CSS color string; defaults to --chart-N palette'),
  })
  .strict();

export const PieChartPresentationSchema = z
  .object({
    type: z.literal('pie-chart').describe('Primitive type discriminant'),
    data: z.array(PieChartSliceSchema).min(1).describe('Array of pie segments'),
    title: z.string().min(1).optional().describe('Optional chart title'),
    description: z.string().min(1).optional().describe('Optional chart description shown below the title'),
    height: z.number().int().min(100).max(800).optional().describe('Chart height in pixels (100–800)'),
    showLegend: z.boolean().optional().describe('Whether to show the legend (default true)'),
    legendPosition: ChartLegendPositionSchema.optional().describe('Legend position'),
    showTooltip: z.boolean().optional().describe('Whether to show hover tooltips (default true)'),
    innerRadius: z.number().int().min(0).optional().describe('Inner radius in px — 0 for pie, >0 for donut'),
    showLabels: z.boolean().optional().describe('Render value labels on each slice'),
  })
  .strict();

export type PieChartSlice = z.infer<typeof PieChartSliceSchema>;
export type PieChartPresentation = z.infer<typeof PieChartPresentationSchema>;
