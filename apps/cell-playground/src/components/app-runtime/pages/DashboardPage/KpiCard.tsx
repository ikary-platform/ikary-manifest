export function KpiCard({
  title,
  value,
  subtitle,
  accent = 'default',
}: {
  title: string;
  value: string;
  subtitle?: string;
  accent?: 'default' | 'blue' | 'green' | 'amber' | 'red';
}) {
  const accentColor = {
    default: 'text-gray-900 dark:text-gray-100',
    blue:    'text-blue-600 dark:text-blue-400',
    green:   'text-green-600 dark:text-green-400',
    amber:   'text-amber-600 dark:text-amber-400',
    red:     'text-red-600 dark:text-red-400',
  }[accent];

  // Scale font down for long values so they never overflow the card
  const valueSize =
    value.length <= 4 ? 'text-2xl' :
    value.length <= 7 ? 'text-xl' :
    value.length <= 10 ? 'text-lg' : 'text-base';

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-4 min-w-0 overflow-hidden">
      <p className={`${valueSize} font-bold leading-none truncate ${accentColor}`} title={value}>{value}</p>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5 leading-tight">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
