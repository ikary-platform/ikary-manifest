import { useEffect, useMemo, useState } from 'react';
import {
  buildGraphExportPayload,
  buildSchemaGraphViewModel,
  toMermaid,
  type BuildSchemaGraphOptions,
  type GraphEdgeMode,
  type GraphNodeScope,
  type SchemaGraphDiagnostic,
  type SchemaGraphMetrics,
  type SchemaGraphNode,
} from './schema-graph-model';

type NodeSortMode = 'degree' | 'name' | 'in_degree' | 'out_degree' | 'leaf_first' | 'hotspot_first';

const NODE_WIDTH = 188;
const NODE_HEIGHT = 56;

export function SchemaDependencyGraphWorkspace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [mode, setMode] = useState<GraphEdgeMode>('hybrid');
  const [scope, setScope] = useState<GraphNodeScope>('all_modules');
  const [sortMode, setSortMode] = useState<NodeSortMode>('degree');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');

  const options: BuildSchemaGraphOptions = useMemo(
    () => ({
      mode,
      scope,
      searchQuery,
      categoryFilter,
      hotspotTopN: 6,
    }),
    [categoryFilter, mode, scope, searchQuery],
  );

  const viewModel = useMemo(() => buildSchemaGraphViewModel(options), [options]);

  useEffect(() => {
    if (!viewModel.categories.includes(categoryFilter)) {
      setCategoryFilter('all');
    }
  }, [categoryFilter, viewModel.categories]);

  useEffect(() => {
    if (!viewModel.nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(viewModel.nodes[0]?.id ?? '');
    }
  }, [selectedNodeId, viewModel.nodes]);

  const selectedNode = viewModel.nodes.find((node) => node.id === selectedNodeId) ?? null;

  const sortedNodes = useMemo(() => sortNodes(viewModel.nodes, sortMode), [sortMode, viewModel.nodes]);

  const inboundEdges = useMemo(
    () => viewModel.edges.filter((edge) => edge.to === selectedNodeId),
    [selectedNodeId, viewModel.edges],
  );
  const outboundEdges = useMemo(
    () => viewModel.edges.filter((edge) => edge.from === selectedNodeId),
    [selectedNodeId, viewModel.edges],
  );

  const nodeById = useMemo(() => new Map(viewModel.nodes.map((node) => [node.id, node])), [viewModel.nodes]);

  async function handleCopyMermaid() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(toMermaid(viewModel));
  }

  function handleDownloadJson() {
    const payload = buildGraphExportPayload(viewModel, options);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'schema-dependency-graph-v1.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const selectClass = 'h-8 rounded border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="grid gap-4">
      {/* Controls card */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="px-4 pt-4 pb-3">
          <h3 className="text-sm font-semibold text-gray-800">Dependencies Workspace</h3>
          <p className="text-xs text-gray-500 mt-1">Inspect schema dependency structure with hybrid edges and diagnostics.</p>
        </div>
        <div className="px-4 pb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search nodes..."
            className={selectClass}
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className={selectClass}
          >
            {viewModel.categories.map((category) => (
              <option key={category} value={category}>
                {toCategoryLabel(category)}
              </option>
            ))}
          </select>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as GraphEdgeMode)}
            className={selectClass}
          >
            <option value="hybrid">Hybrid edges</option>
            <option value="declared">Declared only</option>
            <option value="import">Import only</option>
          </select>
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as GraphNodeScope)}
            className={selectClass}
          >
            <option value="all_modules">All modules</option>
            <option value="public_only">Public only</option>
          </select>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as NodeSortMode)}
            className={selectClass}
          >
            <option value="degree">Sort by degree</option>
            <option value="name">Sort by name</option>
            <option value="in_degree">Sort by in-degree</option>
            <option value="out_degree">Sort by out-degree</option>
            <option value="leaf_first">Leaf nodes first</option>
            <option value="hotspot_first">Hotspots first</option>
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleCopyMermaid()}
              className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
            >
              Copy Mermaid
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
            >
              Download JSON
            </button>
          </div>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* Node list */}
        <div className="border border-gray-200 rounded-lg bg-white min-h-[28rem]">
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">Nodes ({sortedNodes.length})</h3>
            <p className="text-xs text-gray-500 mt-1">Select a node to inspect inbound/outbound dependencies.</p>
          </div>
          <div className="px-4 pb-4">
            <div className="rounded border border-gray-200 max-h-[34rem] overflow-auto">
              {sortedNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full text-left px-3 py-2 border-b border-gray-100 last:border-b-0 ${
                    node.id === selectedNodeId ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold truncate">{node.label}</p>
                    <span className="text-[10px] text-gray-400">{node.totalDegree}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600">
                      {node.category}
                    </span>
                    {node.isLeaf && (
                      <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600">
                        leaf
                      </span>
                    )}
                    {node.isRoot && (
                      <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600">
                        root
                      </span>
                    )}
                    {node.isHotspot && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 rounded text-gray-600">
                        hotspot
                      </span>
                    )}
                    {node.isCrossReferenced && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 rounded text-gray-600">
                        cross-ref
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG graph */}
        <div className="border border-gray-200 rounded-lg bg-white min-h-[28rem]">
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">Dependency Graph</h3>
            <p className="text-xs text-gray-500 mt-1">
              Edge direction: <span className="font-medium">A → B</span> means A depends on B.
            </p>
          </div>
          <div className="px-4 pb-4">
            <div className="rounded border border-gray-200 overflow-auto max-h-[34rem]">
              <SchemaDependencyGraph
                nodes={viewModel.nodes}
                edges={viewModel.edges}
                width={viewModel.graphWidth}
                height={viewModel.graphHeight}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            </div>
          </div>
        </div>

        {/* Selected node detail */}
        <div className="border border-gray-200 rounded-lg bg-white min-h-[28rem]">
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">Selected Node</h3>
            <p className="text-xs text-gray-500 mt-1">Inbound and outbound dependency details.</p>
          </div>
          <div className="px-4 pb-4 space-y-4">
            {selectedNode ? (
              <>
                <div className="space-y-1">
                  <p className="font-mono text-xs font-semibold break-all">{selectedNode.label}</p>
                  <p className="text-[11px] text-gray-400 break-all">{selectedNode.id}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600">
                      {selectedNode.category}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600">
                      in: {selectedNode.inDegree}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600">
                      out: {selectedNode.outDegree}
                    </span>
                    {selectedNode.isLeaf && (
                      <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600">
                        leaf
                      </span>
                    )}
                    {selectedNode.isRoot && (
                      <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600">
                        root
                      </span>
                    )}
                  </div>
                </div>

                <DependencyList
                  title="Depends On"
                  edges={outboundEdges}
                  direction="to"
                  nodeById={nodeById}
                  onSelectNode={setSelectedNodeId}
                />

                <DependencyList
                  title="Used By"
                  edges={inboundEdges}
                  direction="from"
                  nodeById={nodeById}
                  onSelectNode={setSelectedNodeId}
                />
              </>
            ) : (
              <p className="text-xs text-gray-400">No node selected.</p>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostics panel */}
      <SchemaDiagnosticsPanel
        metrics={viewModel.metrics}
        diagnostics={viewModel.diagnostics}
        onSelectNode={setSelectedNodeId}
      />
    </div>
  );
}

function SchemaDependencyGraph({
  nodes,
  edges,
  width,
  height,
  selectedNodeId,
  onSelectNode,
}: {
  nodes: readonly SchemaGraphNode[];
  edges: readonly { from: string; to: string; kind: 'declared' | 'import' }[];
  width: number;
  height: number;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}) {
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  const relatedNodeIds = useMemo(() => {
    if (!selectedNodeId) {
      return new Set<string>();
    }
    const related = new Set<string>([selectedNodeId]);
    for (const edge of edges) {
      if (edge.from === selectedNodeId || edge.to === selectedNodeId) {
        related.add(edge.from);
        related.add(edge.to);
      }
    }
    return related;
  }, [edges, selectedNodeId]);

  return (
    <svg width={width} height={height} style={{ background: '#f8fafc' }}>
      <defs>
        <marker id="schema-graph-arrow-declared" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 z" fill="#3b82f6" />
        </marker>
        <marker id="schema-graph-arrow-import" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 z" fill="#94a3b8" />
        </marker>
      </defs>

      {edges.map((edge, index) => {
        const from = nodeById.get(edge.from);
        const to = nodeById.get(edge.to);
        if (!from || !to) {
          return null;
        }

        const x1 = from.x + NODE_WIDTH;
        const y1 = from.y + NODE_HEIGHT / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_HEIGHT / 2;
        const c1x = x1 + 40;
        const c2x = x2 - 40;
        const isSelected = selectedNodeId && (edge.from === selectedNodeId || edge.to === selectedNodeId);
        const shouldDim = Boolean(selectedNodeId) && !isSelected;

        return (
          <path
            key={`${edge.from}-${edge.to}-${edge.kind}-${index}`}
            d={`M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke={edge.kind === 'declared' ? '#3b82f6' : '#94a3b8'}
            strokeWidth={isSelected ? 2.2 : 1.4}
            strokeDasharray={edge.kind === 'import' ? '5 4' : undefined}
            opacity={shouldDim ? 0.15 : isSelected ? 0.95 : 0.45}
            markerEnd={
              edge.kind === 'declared' ? 'url(#schema-graph-arrow-declared)' : 'url(#schema-graph-arrow-import)'
            }
          />
        );
      })}

      {nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const isRelated = relatedNodeIds.has(node.id);
        const shouldDim = Boolean(selectedNodeId) && !isRelated;

        return (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            role="button"
            tabIndex={0}
            onClick={() => onSelectNode(node.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectNode(node.id);
              }
            }}
            style={{ cursor: 'pointer', opacity: shouldDim ? 0.25 : 1 }}
          >
            <rect
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx={8}
              ry={8}
              fill={isSelected ? '#eff6ff' : '#ffffff'}
              stroke={isSelected ? '#3b82f6' : '#e2e8f0'}
              strokeWidth={isSelected ? 2 : 1}
            />
            <text
              x={10}
              y={20}
              fill="#1e293b"
              fontSize="11"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontWeight={600}
            >
              {truncate(node.label, 25)}
            </text>
            <text
              x={10}
              y={38}
              fill="#94a3b8"
              fontSize="10"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              {node.category} · in {node.inDegree} · out {node.outDegree}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DependencyList({
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
      <p className="text-xs font-semibold text-gray-500">
        {title} ({edges.length})
      </p>
      <div className="rounded border border-gray-200 overflow-hidden">
        {edges.length === 0 ? (
          <div className="px-2 py-2 text-xs text-gray-400">None</div>
        ) : (
          edges.map((edge, index) => {
            const nodeId = direction === 'from' ? edge.from : edge.to;
            const node = nodeById.get(nodeId);
            return (
              <button
                key={`${title}-${nodeId}-${edge.kind}-${index}`}
                type="button"
                onClick={() => onSelectNode(nodeId)}
                className="w-full text-left px-2 py-1.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs truncate">{node?.label ?? nodeId}</span>
                  <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600">
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

function SchemaDiagnosticsPanel({
  metrics,
  diagnostics,
  onSelectNode,
}: {
  metrics: SchemaGraphMetrics;
  diagnostics: readonly SchemaGraphDiagnostic[];
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-semibold text-gray-800">Diagnostics</h3>
        <p className="text-xs text-gray-500 mt-1">
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

        <div className="rounded border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[auto_1.2fr_2fr_auto] gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-500">
            <span>Severity</span>
            <span>Code</span>
            <span>Message</span>
            <span>Focus</span>
          </div>

          {diagnostics.length === 0 ? (
            <div className="px-3 py-3 text-xs text-gray-400">
              No diagnostics detected for the current graph selection.
            </div>
          ) : (
            diagnostics.map((diagnostic) => (
              <div
                key={diagnostic.id}
                className="grid grid-cols-[auto_1.2fr_2fr_auto] gap-2 px-3 py-2 border-b border-gray-100 last:border-b-0 items-center"
              >
                <SeverityBadge severity={diagnostic.severity} />
                <code className="font-mono text-[11px] text-gray-400 break-all">{diagnostic.code}</code>
                <span className="text-xs text-gray-700 break-words">{diagnostic.message}</span>
                {diagnostic.fromNodeId ? (
                  <button
                    type="button"
                    className="text-[11px] font-medium text-blue-600 hover:underline"
                    onClick={() => onSelectNode(diagnostic.fromNodeId!)}
                  >
                    Open
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-400">-</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value: number }) {
  return (
    <span className="px-1.5 py-0.5 text-[11px] font-medium border border-gray-200 rounded text-gray-600">
      {label}: {value}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: 'error' | 'warning' | 'info' }) {
  if (severity === 'error') {
    return (
      <span className="px-1.5 py-0.5 text-[10px] bg-red-100 rounded text-red-700 uppercase">Error</span>
    );
  }
  if (severity === 'warning') {
    return (
      <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 rounded text-gray-600 uppercase">Warning</span>
    );
  }
  return (
    <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600 uppercase">Info</span>
  );
}

function sortNodes(nodes: readonly SchemaGraphNode[], sortMode: NodeSortMode): SchemaGraphNode[] {
  const items = [...nodes];

  items.sort((a, b) => {
    if (sortMode === 'name') {
      return a.label.localeCompare(b.label);
    }
    if (sortMode === 'in_degree') {
      return b.inDegree - a.inDegree || a.label.localeCompare(b.label);
    }
    if (sortMode === 'out_degree') {
      return b.outDegree - a.outDegree || a.label.localeCompare(b.label);
    }
    if (sortMode === 'leaf_first') {
      return Number(b.isLeaf) - Number(a.isLeaf) || a.label.localeCompare(b.label);
    }
    if (sortMode === 'hotspot_first') {
      return (
        Number(b.isHotspot) - Number(a.isHotspot) || b.totalDegree - a.totalDegree || a.label.localeCompare(b.label)
      );
    }
    return b.totalDegree - a.totalDegree || a.label.localeCompare(b.label);
  });

  return items;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}

function toCategoryLabel(category: string): string {
  if (category === 'all') {
    return 'All categories';
  }

  return category
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
