import type { ExecutionResult } from '../types';

// ── Status badge colors ───────────────────────────────────────────────────────

function statusColor(status: number): string {
  if (status === 200) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
  if (status === 201) return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
  return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface EndpointResponseProps {
  result: ExecutionResult | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EndpointResponse({ result }: EndpointResponseProps) {
  if (!result) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
      <div className="flex items-center gap-3">
        <span
          className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold leading-none ${statusColor(result.response.status)}`}
        >
          {result.response.status}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {result.durationMs}ms
        </span>
      </div>
      <pre className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-80 leading-relaxed">
        {JSON.stringify(result.response.body, null, 2)}
      </pre>
    </div>
  );
}
