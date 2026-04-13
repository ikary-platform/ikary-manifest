# @ikary/presentation

## 0.2.0

### Minor Changes

- 4cca3dd: Add Area, Bar, Line, Pie, Radar, and Radial chart primitives

  Six production-quality chart primitives built on recharts, each following the full ikary contract pattern: Zod strict schema with inferred types, runtime validator, YAML spec, React component, adapter, resolver, and register file.

  Shared internal `_chart-shared` layer provides `ChartContainer` (ResponsiveContainer wrapper with CSS variable injection), `ChartTooltipContent`, `ChartHeader`, and `resolveChartColors`.

  Charts are exposed in `PrimitiveStudio` under a new **Charts** category. Chart colours are driven by `--chart-1`…`--chart-5` CSS variables with light and dark mode variants.

## 0.1.1

### Patch Changes

- a2acd7d: Rename package scope from @ikary-manifest to @ikary
