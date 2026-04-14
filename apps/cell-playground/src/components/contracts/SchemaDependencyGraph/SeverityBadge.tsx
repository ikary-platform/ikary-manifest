export function SeverityBadge({ severity }: { severity: 'error' | 'warning' | 'info' }) {
  if (severity === 'error') {
    return (
      <span className="px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-900/40 rounded text-red-700 dark:text-red-300 uppercase">Error</span>
    );
  }
  if (severity === 'warning') {
    return (
      <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 uppercase">Warning</span>
    );
  }
  return (
    <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400 uppercase">Info</span>
  );
}
