import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  buildGraphExportPayload,
  buildSchemaGraphViewModel,
  toMermaid,
  type BuildSchemaGraphOptions,
  type GraphEdgeMode,
  type GraphNodeScope,
  type SchemaGraphNode,
} from './schema-graph-model';
import { SchemaDiagnosticsPanel } from './schema-diagnostics-panel';

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

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dependencies Workspace</CardTitle>
          <CardDescription>Inspect schema dependency structure with hybrid edges and diagnostics.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search nodes..."
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="hybrid">Hybrid edges</option>
            <option value="declared">Declared only</option>
            <option value="import">Import only</option>
          </select>
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as GraphNodeScope)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all_modules">All modules</option>
            <option value="public_only">Public only</option>
          </select>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as NodeSortMode)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="degree">Sort by degree</option>
            <option value="name">Sort by name</option>
            <option value="in_degree">Sort by in-degree</option>
            <option value="out_degree">Sort by out-degree</option>
            <option value="leaf_first">Leaf nodes first</option>
            <option value="hotspot_first">Hotspots first</option>
          </select>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => void handleCopyMermaid()}>
              Copy Mermaid
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleDownloadJson}>
              Download JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <Card className="min-h-[28rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Nodes ({sortedNodes.length})</CardTitle>
            <CardDescription>Select a node to inspect inbound/outbound dependencies.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-md border border-border max-h-[34rem] overflow-auto">
              {sortedNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full text-left px-3 py-2 border-b border-border last:border-b-0 ${
                    node.id === selectedNodeId ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold truncate">{node.label}</p>
                    <span className="text-[10px] text-muted-foreground">{node.totalDegree}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {node.category}
                    </Badge>
                    {node.isLeaf && (
                      <Badge variant="outline" className="text-[10px]">
                        leaf
                      </Badge>
                    )}
                    {node.isRoot && (
                      <Badge variant="outline" className="text-[10px]">
                        root
                      </Badge>
                    )}
                    {node.isHotspot && (
                      <Badge variant="secondary" className="text-[10px]">
                        hotspot
                      </Badge>
                    )}
                    {node.isCrossReferenced && (
                      <Badge variant="secondary" className="text-[10px]">
                        cross-ref
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[28rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Dependency Graph</CardTitle>
            <CardDescription>
              Edge direction: <span className="font-medium">A → B</span> means A depends on B.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-md border border-border overflow-auto max-h-[34rem]">
              <SchemaDependencyGraph
                nodes={viewModel.nodes}
                edges={viewModel.edges}
                width={viewModel.graphWidth}
                height={viewModel.graphHeight}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[28rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Selected Node</CardTitle>
            <CardDescription>Inbound and outbound dependency details.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {selectedNode ? (
              <>
                <div className="space-y-1">
                  <p className="font-mono text-xs font-semibold break-all">{selectedNode.label}</p>
                  <p className="text-[11px] text-muted-foreground break-all">{selectedNode.id}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {selectedNode.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      in: {selectedNode.inDegree}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      out: {selectedNode.outDegree}
                    </Badge>
                    {selectedNode.isLeaf && (
                      <Badge variant="outline" className="text-[10px]">
                        leaf
                      </Badge>
                    )}
                    {selectedNode.isRoot && (
                      <Badge variant="outline" className="text-[10px]">
                        root
                      </Badge>
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
              <p className="text-xs text-muted-foreground">No node selected.</p>
            )}
          </CardContent>
        </Card>
      </div>

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
    <svg width={width} height={height} className="bg-background">
      <defs>
        <marker id="schema-graph-arrow-declared" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 z" fill="hsl(var(--primary))" />
        </marker>
        <marker id="schema-graph-arrow-import" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 z" fill="hsl(var(--muted-foreground))" />
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
            stroke={edge.kind === 'declared' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
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
              fill={isSelected ? 'hsl(var(--accent))' : 'hsl(var(--card))'}
              stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
              strokeWidth={isSelected ? 2 : 1}
            />
            <text
              x={10}
              y={20}
              fill="hsl(var(--foreground))"
              fontSize="11"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontWeight={600}
            >
              {truncate(node.label, 25)}
            </text>
            <text
              x={10}
              y={38}
              fill="hsl(var(--muted-foreground))"
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
      <p className="text-xs font-semibold text-muted-foreground">
        {title} ({edges.length})
      </p>
      <div className="rounded-md border border-border overflow-hidden">
        {edges.length === 0 ? (
          <div className="px-2 py-2 text-xs text-muted-foreground">None</div>
        ) : (
          edges.map((edge, index) => {
            const nodeId = direction === 'from' ? edge.from : edge.to;
            const node = nodeById.get(nodeId);
            return (
              <button
                key={`${title}-${nodeId}-${edge.kind}-${index}`}
                type="button"
                onClick={() => onSelectNode(nodeId)}
                className="w-full text-left px-2 py-1.5 border-b border-border last:border-b-0 hover:bg-accent/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs truncate">{node?.label ?? nodeId}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {edge.kind}
                  </Badge>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
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
