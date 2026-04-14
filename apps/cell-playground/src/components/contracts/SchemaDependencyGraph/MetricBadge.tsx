export function MetricBadge({ label, value }: { label: string; value: number }) {
  return (
    <span className="px-1.5 py-0.5 text-[11px] font-medium border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
      {label}: {value}
    </span>
  );
}
