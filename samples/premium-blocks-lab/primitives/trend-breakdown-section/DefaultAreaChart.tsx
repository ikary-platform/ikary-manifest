/**
 * Inline SVG area chart used when the `chart` slot is empty. Renders two
 * stacked series with grid lines and x-axis labels so the primitive looks
 * complete out of the box.
 */

interface Series {
  label: string;
  color: string;
  points: number[];
}

const XLABELS = [
  'Apr 3','Apr 9','Apr 15','Apr 21','Apr 27','May 3','May 9','May 15','May 22','May 29','Jun 4','Jun 10','Jun 16','Jun 23','Jun 30',
];

const SERIES: Series[] = [
  {
    label: 'This period',
    color: 'hsl(var(--foreground))',
    points: [28, 54, 40, 70, 36, 64, 58, 88, 48, 62, 74, 52, 92, 68, 96],
  },
  {
    label: 'Previous',
    color: 'hsl(var(--muted-foreground))',
    points: [22, 30, 44, 38, 28, 52, 46, 66, 42, 58, 54, 70, 64, 80, 60],
  },
];

const W = 900;
const H = 220;
const PADDING_X = 0;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;

function buildAreaPath(points: number[], max: number): string {
  const n = points.length;
  const dx = (W - PADDING_X * 2) / (n - 1);
  const innerHeight = H - PADDING_TOP - PADDING_BOTTOM;
  const toY = (v: number) => PADDING_TOP + (1 - v / max) * innerHeight;

  let d = `M ${PADDING_X} ${toY(points[0])}`;
  for (let i = 1; i < n; i++) {
    const prevX = PADDING_X + (i - 1) * dx;
    const prevY = toY(points[i - 1]);
    const curX = PADDING_X + i * dx;
    const curY = toY(points[i]);
    const cp1x = prevX + dx * 0.4;
    const cp2x = curX - dx * 0.4;
    d += ` C ${cp1x} ${prevY}, ${cp2x} ${curY}, ${curX} ${curY}`;
  }
  d += ` L ${W - PADDING_X} ${H - PADDING_BOTTOM} L ${PADDING_X} ${H - PADDING_BOTTOM} Z`;
  return d;
}

export function DefaultAreaChart() {
  const max = Math.max(...SERIES.flatMap((s) => s.points)) * 1.1;
  return (
    <div className="flex h-full w-full flex-col gap-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        width="100%"
        height="220"
        style={{ display: 'block' }}
        aria-label="Trend area chart"
      >
        <defs>
          <linearGradient id="area-primary" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="area-muted" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={PADDING_X}
            x2={W - PADDING_X}
            y1={PADDING_TOP + (H - PADDING_TOP - PADDING_BOTTOM) * t}
            y2={PADDING_TOP + (H - PADDING_TOP - PADDING_BOTTOM) * t}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="3 3"
          />
        ))}

        <g className="text-muted-foreground">
          <path d={buildAreaPath(SERIES[1].points, max)} fill="url(#area-muted)" />
          <path
            d={buildAreaPath(SERIES[1].points, max).replace(/ L [\d.]+ [\d.]+ L [\d.]+ [\d.]+ Z$/, '')}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
        </g>
        <g className="text-foreground">
          <path d={buildAreaPath(SERIES[0].points, max)} fill="url(#area-primary)" />
          <path
            d={buildAreaPath(SERIES[0].points, max).replace(/ L [\d.]+ [\d.]+ L [\d.]+ [\d.]+ Z$/, '')}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.85"
            strokeWidth="1.5"
          />
        </g>
      </svg>

      <div
        className="text-muted-foreground"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${XLABELS.length}, minmax(0, 1fr))`,
          fontSize: 10,
        }}
      >
        {XLABELS.map((label) => (
          <span key={label} style={{ textAlign: 'center' }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DefaultSegmentedControl() {
  const options = ['Last 3 months', 'Last 30 days', 'Last 7 days'];
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-background p-1 text-xs">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          className={[
            'h-7 rounded-sm px-3 transition-colors',
            i === 0
              ? 'bg-muted text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
