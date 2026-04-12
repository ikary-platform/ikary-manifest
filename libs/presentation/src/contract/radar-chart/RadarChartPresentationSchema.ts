import { z } from 'zod';
import { ChartSeriesSchema, validateChartDataKeys } from '../chart-common/ChartCommonSchemas';

export const RadarChartDataPointSchema = z
  .record(z.union([z.string(), z.number(), z.null()]))
  .describe('Each point must contain a "subject" string key plus numeric values for each series dataKey');

export const RadarChartPresentationSchema = z
  .object({
    type: z.literal('radar-chart').describe('Primitive type discriminant'),
    data: z.array(RadarChartDataPointSchema).min(3).describe('Array of polygon vertices; minimum 3'),
    series: z.array(ChartSeriesSchema).min(1).describe('One or more series; each dataKey must exist in every data point'),
    subjectKey: z.string().min(1).optional().describe('Key used as axis label (default "subject")'),
    title: z.string().min(1).optional().describe('Optional chart title'),
    description: z.string().min(1).optional().describe('Optional chart description shown below the title'),
    height: z.number().int().min(100).max(800).optional().describe('Chart height in pixels (100–800)'),
    showLegend: z.boolean().optional().describe('Whether to show the legend (default true)'),
    showTooltip: z.boolean().optional().describe('Whether to show hover tooltips (default true)'),
    fillOpacity: z.number().min(0).max(1).optional().describe('Polygon fill opacity (0–1, default 0.25)'),
  })
  .strict()
  .superRefine((val, ctx) => {
    const subjectKey = val.subjectKey ?? 'subject';
    validateChartDataKeys(val.data, subjectKey, val.series, ctx);
  });

export type RadarChartDataPoint = z.infer<typeof RadarChartDataPointSchema>;
export type RadarChartPresentation = z.infer<typeof RadarChartPresentationSchema>;
