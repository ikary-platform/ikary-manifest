import { useEffect, useMemo, useState } from 'react';
import {
  buildSchemaGraphViewModel,
  type BuildSchemaGraphOptions,
  type GraphEdgeMode,
  type GraphNodeScope,
  type SchemaGraphNode,
} from '../schema-graph-model';
import { sortNodes } from './schemaGraphUtils';

type NodeSortMode = 'degree' | 'name' | 'in_degree' | 'out_degree' | 'leaf_first' | 'hotspot_first';

export function useDependencyGraph() {
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

  return {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    mode,
    setMode,
    scope,
    setScope,
    sortMode,
    setSortMode,
    selectedNodeId,
    setSelectedNodeId,
    options,
    viewModel,
    selectedNode,
    sortedNodes,
    inboundEdges,
    outboundEdges,
    nodeById,
  };
}

export type { NodeSortMode, SchemaGraphNode };
