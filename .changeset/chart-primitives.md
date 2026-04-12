---
"@ikary/presentation": minor
"@ikary/primitives": minor
"@ikary/primitive-studio": patch
---

Add Area, Bar, Line, Pie, Radar, and Radial chart primitives

Six production-quality chart primitives built on recharts, each following the full ikary contract pattern: Zod strict schema with inferred types, runtime validator, YAML spec, React component, adapter, resolver, and register file.

Shared internal `_chart-shared` layer provides `ChartContainer` (ResponsiveContainer wrapper with CSS variable injection), `ChartTooltipContent`, `ChartHeader`, and `resolveChartColors`.

Charts are exposed in `PrimitiveStudio` under a new **Charts** category. Chart colours are driven by `--chart-1`…`--chart-5` CSS variables with light and dark mode variants.
