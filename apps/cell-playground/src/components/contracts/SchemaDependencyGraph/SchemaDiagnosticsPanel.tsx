import type { SchemaGraphDiagnostic, SchemaGraphMetrics } from '../schema-graph-model';
import { MetricBadge } from './MetricBadge';
import { SeverityBadge } from './SeverityBadge';

export function SchemaDiagnosticsPanel({
  metrics,
  diagnostics,
  onSelectNode,
}: {
  metrics: SchemaGraphMetrics;
  diagnostics: readonly SchemaGraphDiagnostic[];
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Diagnostics</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Structural checks for cycles, drift, unresolved references, and isolated nodes.
        </p>
      </div>
      <div className="px-4 pb-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <MetricBadge label="Nodes" value={metrics.nodeCount} />
          <MetricBadge label="Edges" value={metrics.edgeCount} />
          <MetricBadge label="Leaves" value={metrics.leafCount} />
          <MetricBadge label="Roots" value={metrics.rootCount} />
          <MetricBadge label="Hotspots" value={metrics.hotspotCount} />
          <MetricBadge label="Cycles" value={metrics.cycleCount} />
          <MetricBadge label="Cross Ref" value={metrics.crossReferencedCount} />
          <MetricBadge label="Issues" value={diagnostics.length} />
        </div>

        <div className="rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-[auto_1.2fr_2fr_auto] gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            <span>Severity</span>
            <span>Code</span>
            <span>Message</span>
            <span>Focus</span>
          </div>

          {diagnostics.length === 0 ? (
            <div className="px-3 py-3 text-xs text-gray-400 dark:text-gray-500">
              No diagnostics detected for the current graph selection.
            </div>
          ) : (
            diagnostics.map((diagnostic) => (
              <div
                key={diagnostic.id}
                className="grid grid-cols-[auto_1.2fr_2fr_auto] gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0 items-center"
              >
                <SeverityBadge severity={diagnostic.severity} />
                <code className="font-mono text-[11px] text-gray-400 dark:text-gray-500 break-all">{diagnostic.code}</code>
                <span className="text-xs text-gray-700 dark:text-gray-300 break-words">{diagnostic.message}</span>
                {diagnostic.fromNodeId ? (
                  <button
                    type="button"
                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => onSelectNode(diagnostic.fromNodeId!)}
                  >
                    Open
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">-</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
