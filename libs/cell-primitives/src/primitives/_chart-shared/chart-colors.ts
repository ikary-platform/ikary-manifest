const CHART_PALETTE = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
] as const;

export function resolveChartColors(count: number, userColors?: (string | undefined)[]): string[] {
  return Array.from({ length: count }, (_, i) => {
    const userColor = userColors?.[i];
    return userColor ?? CHART_PALETTE[i % CHART_PALETTE.length]!;
  });
}
