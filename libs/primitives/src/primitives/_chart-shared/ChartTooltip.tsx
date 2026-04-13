import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

export function ChartTooltipContent({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '8px 12px',
        fontSize: '12px',
        minWidth: '140px',
      }}
    >
      {label !== undefined && (
        <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '6px' }}>{String(label)}</div>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', color: 'hsl(var(--foreground))' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: entry.color ?? entry.fill ?? '#94a3b8',
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1, color: 'hsl(var(--muted-foreground))' }}>{entry.name}</span>
          <span style={{ fontWeight: 600 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
