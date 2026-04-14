import { useMemo } from 'react';
import type { SchemaGraphNode } from '../schema-graph-model';
import { truncate } from './schemaGraphUtils';

const NODE_WIDTH = 188;
const NODE_HEIGHT = 56;

export function SchemaDependencyGraph({
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
    <svg width={width} height={height} style={{ background: 'hsl(var(--muted))' }}>
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
              fill={isSelected ? 'hsl(var(--accent))' : 'hsl(var(--background))'}
              stroke={isSelected ? '#3b82f6' : 'hsl(var(--border))'}
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
