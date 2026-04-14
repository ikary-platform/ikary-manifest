import type { SchemaGraphNode } from '../schema-graph-model';

export function DependencyList({
  title,
  edges,
  direction,
  nodeById,
  onSelectNode,
}: {
  title: string;
  edges: readonly { from: string; to: string; kind: 'declared' | 'import' }[];
  direction: 'from' | 'to';
  nodeById: Map<string, SchemaGraphNode>;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
        {title} ({edges.length})
      </p>
      <div className="rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
        {edges.length === 0 ? (
          <div className="px-2 py-2 text-xs text-gray-400 dark:text-gray-500">None</div>
        ) : (
          edges.map((edge, index) => {
            const nodeId = direction === 'from' ? edge.from : edge.to;
            const node = nodeById.get(nodeId);
            return (
              <button
                key={`${title}-${nodeId}-${edge.kind}-${index}`}
                type="button"
                onClick={() => onSelectNode(nodeId)}
                className="w-full text-left px-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs truncate text-gray-700 dark:text-gray-300">{node?.label ?? nodeId}</span>
                  <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
                    {edge.kind}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
