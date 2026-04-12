import { ResponsiveContainer } from 'recharts';
import type { CSSProperties, ReactNode } from 'react';

export interface ChartConfig {
  [key: string]: { label: string; color?: string };
}

interface ChartContainerProps {
  config: ChartConfig;
  height: number;
  children: ReactNode;
}

export function ChartContainer({ config, height, children }: ChartContainerProps) {
  const cssVars = Object.entries(config).reduce<CSSProperties>((acc, [key, value]) => {
    if (value.color) {
      (acc as Record<string, string>)[`--color-${key}`] = value.color;
    }
    return acc;
  }, {});

  return (
    <div style={{ width: '100%', fontFamily: 'inherit', fontSize: '12px', ...cssVars }}>
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
