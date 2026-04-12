import { z } from 'zod';

export const RadialChartBarSchema = z
  .object({
    label: z.string().min(1).describe('Label for this arc'),
    value: z.number().min(0).max(100).describe('Progress value 0–100'),
    color: z.string().optional().describe('Optional CSS color string; defaults to --chart-N palette'),
  })
  .strict();

export const RadialChartPresentationSchema = z
  .object({
    type: z.literal('radial-chart').describe('Primitive type discriminant'),
    data: z.array(RadialChartBarSchema).min(1).describe('Array of radial progress arcs'),
    title: z.string().min(1).optional().describe('Optional chart title'),
    description: z.string().min(1).optional().describe('Optional chart description shown below the title'),
    height: z.number().int().min(100).max(800).optional().describe('Chart height in pixels (100–800)'),
    showLegend: z.boolean().optional().describe('Whether to show a legend below the chart (default true)'),
    showTooltip: z.boolean().optional().describe('Whether to show hover tooltips (default true)'),
    innerRadius: z.number().int().min(0).optional().describe('Inner radius in pixels'),
    outerRadius: z.number().int().min(0).optional().describe('Outer radius in pixels'),
  })
  .strict();

export type RadialChartBar = z.infer<typeof RadialChartBarSchema>;
export type RadialChartPresentation = z.infer<typeof RadialChartPresentationSchema>;
