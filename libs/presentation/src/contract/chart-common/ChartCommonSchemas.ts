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

/**
 * Cross-field refinement: validates that every data point contains the
 * `xKey` column and all series `dataKey` columns. Call inside `.superRefine()`
 * on Cartesian chart schemas (area, bar, line).
 */
export function validateChartDataKeys(
  data: ChartDataPoint[],
  xKey: string,
  series: ChartSeries[],
  ctx: z.RefinementCtx,
): void {
  data.forEach((point, i) => {
    if (!(xKey in point)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['data', i],
        message: `data[${i}] is missing the xKey field "${xKey}"`,
      });
    }
    series.forEach((s) => {
      if (!(s.dataKey in point)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['data', i],
          message: `data[${i}] is missing series dataKey field "${s.dataKey}"`,
        });
      }
    });
  });
}
