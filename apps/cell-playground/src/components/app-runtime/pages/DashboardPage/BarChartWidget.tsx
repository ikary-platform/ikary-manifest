// ── Native status-bar chart (Recharts vertical layout doesn't show labels reliably) ──

function EmptyChart() {
  return (
    <div className="h-24 flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
      No data
    </div>
  );
}

function StatusBars({ data }: { data: { label: string; count: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="px-4 py-3 space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 truncate text-right leading-none">
            {d.label}
          </span>
          <div className="flex-1 h-5 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {d.count > 0 && (
              <div
                className="h-full rounded transition-all duration-300"
                style={{ width: `${(d.count / max) * 100}%`, backgroundColor: d.color }}
              />
            )}
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-6 shrink-0 text-right tabular-nums">
            {d.count}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BarChartWidget({
  title,
  data,
}: {
  title: string;
  data: { label: string; count: number; color: string }[] | null;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 pt-4 pb-0">{title}</p>
      {data ? <StatusBars data={data} /> : <EmptyChart />}
    </div>
  );
}
