/**
 * Inline SVG bar chart used by the dashboard screen to fill the `chart` slot of
 * `trend-breakdown-section`. The primitive itself is chart-library agnostic.
 */

interface Bar {
  label: string;
  value: number;
  tone?: 'default' | 'primary';
}

const BARS: Bar[] = [
  { label: 'W-13', value: 2.1 },
  { label: 'W-12', value: 2.9 },
  { label: 'W-11', value: 2.4 },
  { label: 'W-10', value: 3.6 },
  { label: 'W-9', value: 3.1 },
  { label: 'W-8', value: 4.2 },
  { label: 'W-7', value: 3.8 },
  { label: 'W-6', value: 4.7 },
  { label: 'W-5', value: 4.1 },
  { label: 'W-4', value: 4.9 },
  { label: 'W-3', value: 5.3 },
  { label: 'W-2', value: 5.0 },
  { label: 'W-1', value: 5.8, tone: 'primary' },
  { label: 'This week', value: 6.2, tone: 'primary' },
];

export function PipelineBars() {
  const max = Math.max(...BARS.map((b) => b.value));
  return (
    <div className="flex h-full min-h-[220px] flex-col gap-3">
      <div className="flex flex-1 items-end gap-2">
        {BARS.map((b, i) => {
          const pct = (b.value / max) * 100;
          const isPrimary = b.tone === 'primary';
          return (
            <div key={`${b.label}-${i}`} className="group flex flex-1 flex-col items-center gap-1">
              <div
                className={[
                  'flex w-full items-end justify-center rounded-t-sm transition-all',
                  isPrimary
                    ? 'bg-primary group-hover:opacity-90'
                    : 'bg-primary/30 group-hover:bg-primary/50',
                ].join(' ')}
                style={{ height: `${Math.max(pct, 4)}%` }}
                title={`${b.label} · $${b.value.toFixed(1)}M`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 text-[10px] text-muted-foreground">
        {BARS.map((b, i) => (
          <div key={`label-${i}`} className="flex-1 text-center">
            {i % 2 === 0 ? b.label : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
