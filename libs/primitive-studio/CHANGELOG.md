# @ikary/primitive-studio

## 0.2.0

### Minor Changes

- bdc8874: Add dark mode support: all inline styles now use CSS custom properties (`hsl(var(--background))`, `hsl(var(--foreground))`, `hsl(var(--border))`, `hsl(var(--muted))`, `hsl(var(--muted-foreground))`, `hsl(var(--accent))`, `hsl(var(--accent-foreground))`) so the studio adapts automatically to the host app's colour scheme.

### Patch Changes

- 4cca3dd: Add Area, Bar, Line, Pie, Radar, and Radial chart primitives

  Six production-quality chart primitives built on recharts, each following the full ikary contract pattern: Zod strict schema with inferred types, runtime validator, YAML spec, React component, adapter, resolver, and register file.

  Shared internal `_chart-shared` layer provides `ChartContainer` (ResponsiveContainer wrapper with CSS variable injection), `ChartTooltipContent`, `ChartHeader`, and `resolveChartColors`.

  Charts are exposed in `PrimitiveStudio` under a new **Charts** category. Chart colours are driven by `--chart-1`…`--chart-5` CSS variables with light and dark mode variants.

- Updated dependencies [4cca3dd]
- Updated dependencies [bdc8874]
  - @ikary/primitives@0.2.0
