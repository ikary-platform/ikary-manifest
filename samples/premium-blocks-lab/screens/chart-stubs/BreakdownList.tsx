interface BreakdownRow {
  label: string;
  value: string;
  share: number; // 0..1
}

export function BreakdownList({ heading, rows }: { heading?: string; rows: BreakdownRow[] }) {
  return (
    <div className="flex flex-col gap-2">
      {heading ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {heading}
        </span>
      ) : null}
      <ol className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate text-foreground">{row.label}</span>
              <span className="font-medium">{row.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(row.share * 100, 2).toFixed(1)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
