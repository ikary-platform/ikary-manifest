// ── Native SVG donut chart (Recharts PieChart has container-sizing issues) ───

function EmptyChart() {
  return (
    <div className="h-24 flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
      No data
    </div>
  );
}

function DonutChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <EmptyChart />;

  const cx = 60, cy = 60, ro = 54, ri = 32;
  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const sweep = (d.count / total) * 2 * Math.PI;
    const a1 = angle, a2 = angle + sweep;
    angle = a2;
    const large = sweep > Math.PI ? 1 : 0;
    const path =
      `M ${cx + ro * Math.cos(a1)} ${cy + ro * Math.sin(a1)}` +
      ` A ${ro} ${ro} 0 ${large} 1 ${cx + ro * Math.cos(a2)} ${cy + ro * Math.sin(a2)}` +
      ` L ${cx + ri * Math.cos(a2)} ${cy + ri * Math.sin(a2)}` +
      ` A ${ri} ${ri} 0 ${large} 0 ${cx + ri * Math.cos(a1)} ${cy + ri * Math.sin(a1)} Z`;
    return { ...d, path };
  });

  return (
    <div className="px-4 pb-4 flex flex-col items-center gap-3">
      <svg width={120} height={120} viewBox="0 0 120 120">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} />
        ))}
        <text x={cx} y={cy - 7} textAnchor="middle" style={{ fontSize: '17px', fontWeight: 700, fill: 'hsl(var(--foreground))' }}>
          {total}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" style={{ fontSize: '9px', fill: 'hsl(var(--muted-foreground))' }}>
          total
        </text>
      </svg>
      <div className="w-full space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">{d.label}</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0 tabular-nums">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChartWidget({
  title,
  data,
}: {
  title: string;
  data: { label: string; count: number; color: string }[] | null;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 pt-4 pb-0">{title}</p>
      {data && data.length > 0 ? <DonutChart data={data} /> : <EmptyChart />}
    </div>
  );
}
