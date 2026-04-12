import {
  CELL_SCHEMA_CATALOG,
  CELL_SCHEMA_MODULE_GRAPH,
  type SchemaCategory,
  type SchemaModuleCategory,
} from '@ikary/contract';

export type GraphEdgeMode = 'hybrid' | 'declared' | 'import';
export type GraphNodeScope = 'all_modules' | 'public_only';
export type GraphEdgeKind = 'declared' | 'import';
export type GraphNodeCategory = SchemaCategory | SchemaModuleCategory;

export type SchemaGraphDiagnosticCode =
  | 'cycle_detected'
  | 'unresolved_declared_reference'
  | 'unresolved_module_import'
  | 'declared_vs_import_drift'
  | 'isolated_node'
  | 'category_mismatch';

export interface SchemaGraphNode {
  readonly id: string;
  readonly label: string;
  readonly category: GraphNodeCategory;
  readonly sourcePath?: string;
  readonly publicSchemaName?: string;
  readonly isPublic: boolean;
  readonly inDegree: number;
  readonly outDegree: number;
  readonly totalDegree: number;
  readonly isLeaf: boolean;
  readonly isRoot: boolean;
  readonly isHotspot: boolean;
  readonly isCrossReferenced: boolean;
  readonly x: number;
  readonly y: number;
}

export interface SchemaGraphEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly kind: GraphEdgeKind;
}

export interface SchemaGraphMetrics {
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly leafCount: number;
  readonly rootCount: number;
  readonly hotspotCount: number;
  readonly cycleCount: number;
  readonly crossReferencedCount: number;
}

export interface SchemaGraphDiagnostic {
  readonly id: string;
  readonly code: SchemaGraphDiagnosticCode;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
  readonly fromNodeId?: string;
  readonly toNodeId?: string;
  readonly nodeIds?: readonly string[];
}

export interface SchemaGraphViewModel {
  readonly nodes: readonly SchemaGraphNode[];
  readonly edges: readonly SchemaGraphEdge[];
  readonly metrics: SchemaGraphMetrics;
  readonly diagnostics: readonly SchemaGraphDiagnostic[];
  readonly categories: readonly string[];
  readonly graphWidth: number;
  readonly graphHeight: number;
}

export interface BuildSchemaGraphOptions {
  readonly mode: GraphEdgeMode;
  readonly scope: GraphNodeScope;
  readonly searchQuery?: string;
  readonly categoryFilter?: string;
  readonly hotspotTopN?: number;
}

const COLUMN_WIDTH = 260;
const ROW_HEIGHT = 82;
const NODE_WIDTH = 188;
const GRAPH_PADDING_X = 20;
const GRAPH_PADDING_Y = 24;
const DEFAULT_HOTSPOT_TOP_N = 6;

interface NodeBase {
  id: string;
  label: string;
  category: GraphNodeCategory;
  sourcePath?: string;
  publicSchemaName?: string;
  isPublic: boolean;
}

interface EdgeBase {
  from: string;
  to: string;
  kind: GraphEdgeKind;
}

const PUBLIC_BY_NAME = new Map(CELL_SCHEMA_CATALOG.map((entry) => [entry.name, entry]));
const PUBLIC_BY_SOURCE_PATH = new Map(CELL_SCHEMA_CATALOG.map((entry) => [entry.sourcePath, entry]));

const MODULE_NODE_TABLE = new Map(CELL_SCHEMA_MODULE_GRAPH.nodes.map((node) => [node.id, node]));

const MODULE_NODES_BASE: readonly NodeBase[] = CELL_SCHEMA_MODULE_GRAPH.nodes
  .map((node) => ({
    id: node.id,
    label: node.publicSchemaName ?? shortLabel(node.sourcePath),
    category: node.category,
    sourcePath: node.sourcePath,
    publicSchemaName: node.publicSchemaName,
    isPublic: Boolean(node.publicSchemaName),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const PUBLIC_NODES_BASE: readonly NodeBase[] = CELL_SCHEMA_CATALOG.map((entry) => ({
  id: entry.name,
  label: entry.name,
  category: entry.category,
  sourcePath: entry.sourcePath,
  publicSchemaName: entry.name,
  isPublic: true,
})).sort((a, b) => a.label.localeCompare(b.label));

const IMPORT_EDGES_ALL_MODULES: readonly EdgeBase[] = dedupeEdges(
  CELL_SCHEMA_MODULE_GRAPH.importEdges
    .filter((edge) => MODULE_NODE_TABLE.has(edge.from) && MODULE_NODE_TABLE.has(edge.to))
    .map((edge) => ({ from: edge.from, to: edge.to, kind: 'import' })),
);

const IMPORT_EDGES_PUBLIC_ONLY: readonly EdgeBase[] = dedupeEdges(
  IMPORT_EDGES_ALL_MODULES.flatMap((edge): EdgeBase[] => {
    const fromPublic = PUBLIC_BY_SOURCE_PATH.get(edge.from)?.name;
    const toPublic = PUBLIC_BY_SOURCE_PATH.get(edge.to)?.name;
    if (!fromPublic || !toPublic) {
      return [];
    }
    return [{ from: fromPublic, to: toPublic, kind: 'import' }];
  }),
);

const DECLARED_EDGES_PUBLIC_ONLY: readonly EdgeBase[] = dedupeEdges(
  CELL_SCHEMA_CATALOG.flatMap((entry): EdgeBase[] =>
    entry.references.filter((to) => PUBLIC_BY_NAME.has(to)).map((to) => ({ from: entry.name, to, kind: 'declared' })),
  ),
);

const DECLARED_EDGES_ALL_MODULES: readonly EdgeBase[] = dedupeEdges(
  CELL_SCHEMA_CATALOG.flatMap((entry): EdgeBase[] => {
    const fromSource = entry.sourcePath;
    if (!MODULE_NODE_TABLE.has(fromSource)) {
      return [];
    }
    return entry.references.flatMap((targetName): EdgeBase[] => {
      const target = PUBLIC_BY_NAME.get(targetName);
      if (!target || !MODULE_NODE_TABLE.has(target.sourcePath)) {
        return [];
      }
      return [{ from: fromSource, to: target.sourcePath, kind: 'declared' }];
    });
  }),
);

const DECLARED_PUBLIC_EDGE_PAIRS = new Set(DECLARED_EDGES_PUBLIC_ONLY.map((edge) => edgePairKey(edge.from, edge.to)));

const IMPORT_PUBLIC_EDGE_PAIRS = new Set(IMPORT_EDGES_PUBLIC_ONLY.map((edge) => edgePairKey(edge.from, edge.to)));

const MODULE_ADJACENCY = buildAdjacency(IMPORT_EDGES_ALL_MODULES.map((edge) => ({ from: edge.from, to: edge.to })));

export function buildSchemaGraphViewModel(options: BuildSchemaGraphOptions): SchemaGraphViewModel {
  const normalizedOptions = {
    mode: options.mode,
    scope: options.scope,
    searchQuery: options.searchQuery?.trim().toLowerCase() ?? '',
    categoryFilter: options.categoryFilter ?? 'all',
    hotspotTopN: options.hotspotTopN ?? DEFAULT_HOTSPOT_TOP_N,
  };

  const allNodes = normalizedOptions.scope === 'all_modules' ? MODULE_NODES_BASE : PUBLIC_NODES_BASE;
  const modeEdges = selectEdges(normalizedOptions.mode, normalizedOptions.scope);
  const categories = ['all', ...new Set(allNodes.map((node) => node.category).sort())];

  const filteredNodes = allNodes.filter((node) => {
    if (normalizedOptions.categoryFilter !== 'all' && node.category !== normalizedOptions.categoryFilter) {
      return false;
    }

    if (!normalizedOptions.searchQuery) {
      return true;
    }

    return [node.id, node.label, node.category, node.sourcePath ?? '', node.publicSchemaName ?? ''].some((value) =>
      value.toLowerCase().includes(normalizedOptions.searchQuery),
    );
  });

  const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));
  const filteredEdges = dedupeEdges(
    modeEdges.filter((edge) => filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to)),
  );

  const pairEdges = dedupePairEdges(filteredEdges);
  const degreeStats = computeDegreeStats(filteredNodes, pairEdges);
  const cycleComponents = detectCycles(filteredNodes, pairEdges);

  const hotspotNodeIds = selectHotspots(
    filteredNodes.map((node) => ({
      id: node.id,
      totalDegree: degreeStats.totalDegreeById.get(node.id) ?? 0,
    })),
    normalizedOptions.hotspotTopN,
  );

  const layout = computeLayout(filteredNodes, pairEdges);

  const graphNodes: SchemaGraphNode[] = filteredNodes.map((node) => {
    const inDegree = degreeStats.inDegreeById.get(node.id) ?? 0;
    const outDegree = degreeStats.outDegreeById.get(node.id) ?? 0;
    const totalDegree = inDegree + outDegree;
    const incomingCategories = degreeStats.incomingCategoriesById.get(node.id) ?? new Set();

    return {
      ...node,
      inDegree,
      outDegree,
      totalDegree,
      isLeaf: outDegree === 0,
      isRoot: inDegree === 0,
      isHotspot: hotspotNodeIds.has(node.id),
      isCrossReferenced: inDegree >= 2 && incomingCategories.size >= 2,
      x: layout.positionById.get(node.id)?.x ?? 0,
      y: layout.positionById.get(node.id)?.y ?? 0,
    };
  });

  const graphEdges: SchemaGraphEdge[] = filteredEdges.map((edge, index) => ({
    id: `${edge.from}->${edge.to}::${edge.kind}::${index}`,
    ...edge,
  }));

  const diagnostics = buildDiagnostics({
    scope: normalizedOptions.scope,
    nodes: graphNodes,
    pairEdges,
    cycleComponents,
  });

  const metrics: SchemaGraphMetrics = {
    nodeCount: graphNodes.length,
    edgeCount: graphEdges.length,
    leafCount: graphNodes.filter((node) => node.isLeaf).length,
    rootCount: graphNodes.filter((node) => node.isRoot).length,
    hotspotCount: graphNodes.filter((node) => node.isHotspot).length,
    cycleCount: cycleComponents.length,
    crossReferencedCount: graphNodes.filter((node) => node.isCrossReferenced).length,
  };

  return {
    nodes: graphNodes.sort((a, b) => a.label.localeCompare(b.label)),
    edges: graphEdges,
    metrics,
    diagnostics,
    categories,
    graphWidth: layout.width,
    graphHeight: layout.height,
  };
}

export function toMermaid(viewModel: SchemaGraphViewModel): string {
  const idMap = new Map<string, string>();
  viewModel.nodes.forEach((node, index) => {
    idMap.set(node.id, `n${index + 1}`);
  });

  const lines: string[] = ['graph LR'];

  for (const node of viewModel.nodes) {
    const mermaidId = idMap.get(node.id);
    if (!mermaidId) {
      continue;
    }
    lines.push(`  ${mermaidId}["${escapeMermaid(node.label)}"]`);
  }

  for (const edge of viewModel.edges) {
    const from = idMap.get(edge.from);
    const to = idMap.get(edge.to);
    if (!from || !to) {
      continue;
    }
    if (edge.kind === 'declared') {
      lines.push(`  ${from} -- declared --> ${to}`);
    } else {
      lines.push(`  ${from} -. import .-> ${to}`);
    }
  }

  return lines.join('\n');
}

export function buildGraphExportPayload(
  viewModel: SchemaGraphViewModel,
  options: BuildSchemaGraphOptions,
): Record<string, unknown> {
  return {
    metadata: {
      mode: options.mode,
      scope: options.scope,
      searchQuery: options.searchQuery ?? '',
      categoryFilter: options.categoryFilter ?? 'all',
      generatedAt: new Date().toISOString(),
      version: 'schema-graph-v1',
    },
    metrics: viewModel.metrics,
    nodes: viewModel.nodes,
    edges: viewModel.edges,
    diagnostics: viewModel.diagnostics,
  };
}

function selectEdges(mode: GraphEdgeMode, scope: GraphNodeScope): readonly EdgeBase[] {
  const declared = scope === 'all_modules' ? DECLARED_EDGES_ALL_MODULES : DECLARED_EDGES_PUBLIC_ONLY;
  const imports = scope === 'all_modules' ? IMPORT_EDGES_ALL_MODULES : IMPORT_EDGES_PUBLIC_ONLY;

  if (mode === 'declared') {
    return declared;
  }
  if (mode === 'import') {
    return imports;
  }
  return dedupeEdges([...declared, ...imports]);
}

function computeDegreeStats(nodes: readonly NodeBase[], pairEdges: readonly PairEdge[]) {
  const inDegreeById = new Map(nodes.map((node) => [node.id, 0]));
  const outDegreeById = new Map(nodes.map((node) => [node.id, 0]));
  const totalDegreeById = new Map(nodes.map((node) => [node.id, 0]));
  const incomingCategoriesById = new Map(nodes.map((node) => [node.id, new Set<string>()]));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  for (const edge of pairEdges) {
    outDegreeById.set(edge.from, (outDegreeById.get(edge.from) ?? 0) + 1);
    inDegreeById.set(edge.to, (inDegreeById.get(edge.to) ?? 0) + 1);

    const sourceCategory = nodeById.get(edge.from)?.category;
    if (sourceCategory) {
      incomingCategoriesById.get(edge.to)?.add(sourceCategory);
    }
  }

  for (const node of nodes) {
    const total = (inDegreeById.get(node.id) ?? 0) + (outDegreeById.get(node.id) ?? 0);
    totalDegreeById.set(node.id, total);
  }

  return {
    inDegreeById,
    outDegreeById,
    totalDegreeById,
    incomingCategoriesById,
  };
}

function buildDiagnostics({
  scope,
  nodes,
  pairEdges,
  cycleComponents,
}: {
  scope: GraphNodeScope;
  nodes: readonly SchemaGraphNode[];
  pairEdges: readonly PairEdge[];
  cycleComponents: readonly string[][];
}): SchemaGraphDiagnostic[] {
  const diagnostics: SchemaGraphDiagnostic[] = [];

  const catalogNames = new Set(CELL_SCHEMA_CATALOG.map((entry) => entry.name));
  for (const entry of CELL_SCHEMA_CATALOG) {
    for (const reference of entry.references) {
      if (catalogNames.has(reference)) {
        continue;
      }

      diagnostics.push({
        id: `unresolved-declared-${entry.name}-${reference}`,
        code: 'unresolved_declared_reference',
        severity: 'error',
        message: `${entry.name} references unknown schema ${reference}.`,
        fromNodeId: scope === 'all_modules' ? entry.sourcePath : entry.name,
      });
    }
  }

  for (const unresolvedImport of CELL_SCHEMA_MODULE_GRAPH.unresolvedImports) {
    diagnostics.push({
      id: `unresolved-import-${unresolvedImport.from}-${unresolvedImport.specifier}`,
      code: 'unresolved_module_import',
      severity: 'warning',
      message: `${shortLabel(unresolvedImport.from)} imports ${unresolvedImport.specifier}, but no schema module was found.`,
      fromNodeId:
        scope === 'all_modules' ? unresolvedImport.from : PUBLIC_BY_SOURCE_PATH.get(unresolvedImport.from)?.name,
    });
  }

  for (const entry of CELL_SCHEMA_CATALOG) {
    const inferredCategory = inferCategoryFromSourcePath(entry.sourcePath);
    if (!inferredCategory || inferredCategory === entry.category) {
      continue;
    }

    diagnostics.push({
      id: `category-mismatch-${entry.name}`,
      code: 'category_mismatch',
      severity: 'warning',
      message: `${entry.name} is categorized as ${entry.category}, but its source path suggests ${inferredCategory}.`,
      fromNodeId: scope === 'all_modules' ? entry.sourcePath : entry.name,
    });
  }

  for (const entry of CELL_SCHEMA_CATALOG) {
    for (const reference of entry.references) {
      const referenceEntry = PUBLIC_BY_NAME.get(reference);
      if (!referenceEntry) {
        continue;
      }

      if (!hasPath(MODULE_ADJACENCY, entry.sourcePath, referenceEntry.sourcePath)) {
        diagnostics.push({
          id: `declared-drift-missing-import-path-${entry.name}-${reference}`,
          code: 'declared_vs_import_drift',
          severity: 'warning',
          message: `Declared edge ${entry.name} -> ${reference} has no module import path.`,
          fromNodeId: scope === 'all_modules' ? entry.sourcePath : entry.name,
          toNodeId: scope === 'all_modules' ? referenceEntry.sourcePath : referenceEntry.name,
        });
      }
    }
  }

  for (const importEdge of IMPORT_EDGES_PUBLIC_ONLY) {
    const pair = edgePairKey(importEdge.from, importEdge.to);
    if (DECLARED_PUBLIC_EDGE_PAIRS.has(pair)) {
      continue;
    }

    diagnostics.push({
      id: `declared-drift-missing-reference-${importEdge.from}-${importEdge.to}`,
      code: 'declared_vs_import_drift',
      severity: 'warning',
      message: `Module dependency ${importEdge.from} -> ${importEdge.to} is not declared in schema references.`,
      fromNodeId: scope === 'all_modules' ? PUBLIC_BY_NAME.get(importEdge.from)?.sourcePath : importEdge.from,
      toNodeId: scope === 'all_modules' ? PUBLIC_BY_NAME.get(importEdge.to)?.sourcePath : importEdge.to,
    });
  }

  for (const cycle of cycleComponents) {
    diagnostics.push({
      id: `cycle-${cycle.join('::')}`,
      code: 'cycle_detected',
      severity: 'error',
      message: `Cycle detected across ${cycle.length} nodes.`,
      nodeIds: cycle,
      fromNodeId: cycle[0],
    });
  }

  const degreeByNode = new Map(nodes.map((node) => [node.id, node.inDegree + node.outDegree]));
  for (const node of nodes) {
    if ((degreeByNode.get(node.id) ?? 0) > 0) {
      continue;
    }
    diagnostics.push({
      id: `isolated-${node.id}`,
      code: 'isolated_node',
      severity: 'info',
      message: `${node.label} is isolated in the current graph selection.`,
      fromNodeId: node.id,
    });
  }

  return diagnostics.sort((a, b) => {
    const severityOrder = severityWeight(a.severity) - severityWeight(b.severity);
    if (severityOrder !== 0) {
      return severityOrder;
    }
    return a.message.localeCompare(b.message);
  });
}

interface PairEdge {
  from: string;
  to: string;
}

function detectCycles(nodes: readonly NodeBase[], pairEdges: readonly PairEdge[]): string[][] {
  const adjacency = buildAdjacency(pairEdges);
  const nodeIds = nodes.map((node) => node.id).sort((a, b) => a.localeCompare(b));
  const indexById = new Map<string, number>();
  const lowById = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  let indexCounter = 0;
  const components: string[][] = [];

  function strongConnect(nodeId: string) {
    indexById.set(nodeId, indexCounter);
    lowById.set(nodeId, indexCounter);
    indexCounter += 1;
    stack.push(nodeId);
    onStack.add(nodeId);

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      if (!indexById.has(neighbor)) {
        strongConnect(neighbor);
        lowById.set(nodeId, Math.min(lowById.get(nodeId) ?? 0, lowById.get(neighbor) ?? 0));
      } else if (onStack.has(neighbor)) {
        lowById.set(nodeId, Math.min(lowById.get(nodeId) ?? 0, indexById.get(neighbor) ?? 0));
      }
    }

    if (lowById.get(nodeId) !== indexById.get(nodeId)) {
      return;
    }

    const component: string[] = [];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        break;
      }
      onStack.delete(current);
      component.push(current);
      if (current === nodeId) {
        break;
      }
    }

    component.sort((a, b) => a.localeCompare(b));

    if (component.length > 1) {
      components.push(component);
      return;
    }

    const single = component[0];
    if (!single) {
      return;
    }
    if ((adjacency.get(single) ?? []).includes(single)) {
      components.push(component);
    }
  }

  for (const nodeId of nodeIds) {
    if (!indexById.has(nodeId)) {
      strongConnect(nodeId);
    }
  }

  return components.sort((a, b) => a[0].localeCompare(b[0]));
}

function computeLayout(nodes: readonly NodeBase[], pairEdges: readonly PairEdge[]) {
  const nodeIds = nodes.map((node) => node.id);
  const adjacency = buildAdjacency(pairEdges);
  const indegree = new Map(nodeIds.map((id) => [id, 0]));

  for (const edge of pairEdges) {
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  const queue = nodeIds.filter((id) => (indegree.get(id) ?? 0) === 0).sort((a, b) => a.localeCompare(b));

  const depthById = new Map(nodeIds.map((id) => [id, 0]));
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    visited.add(current);

    const currentDepth = depthById.get(current) ?? 0;
    const neighbors = [...(adjacency.get(current) ?? [])].sort((a, b) => a.localeCompare(b));

    for (const neighbor of neighbors) {
      const nextDepth = Math.max(depthById.get(neighbor) ?? 0, currentDepth + 1);
      depthById.set(neighbor, nextDepth);
      indegree.set(neighbor, (indegree.get(neighbor) ?? 0) - 1);
      if ((indegree.get(neighbor) ?? 0) === 0) {
        queue.push(neighbor);
      }
    }

    queue.sort((a, b) => a.localeCompare(b));
  }

  const maxKnownDepth = Math.max(...depthById.values(), 0);
  const unvisited = nodeIds.filter((id) => !visited.has(id)).sort((a, b) => a.localeCompare(b));
  unvisited.forEach((id, index) => {
    depthById.set(id, maxKnownDepth + 1 + Math.floor(index / 8));
  });

  const groups = new Map<number, NodeBase[]>();
  for (const node of nodes) {
    const depth = depthById.get(node.id) ?? 0;
    const list = groups.get(depth);
    if (list) {
      list.push(node);
    } else {
      groups.set(depth, [node]);
    }
  }

  for (const group of groups.values()) {
    group.sort((a, b) => a.label.localeCompare(b.label));
  }

  const sortedDepths = [...groups.keys()].sort((a, b) => a - b);
  const positionById = new Map<string, { x: number; y: number }>();
  let maxRows = 1;

  for (const depth of sortedDepths) {
    const group = groups.get(depth) ?? [];
    maxRows = Math.max(maxRows, group.length);
    group.forEach((node, index) => {
      positionById.set(node.id, {
        x: GRAPH_PADDING_X + depth * COLUMN_WIDTH,
        y: GRAPH_PADDING_Y + index * ROW_HEIGHT,
      });
    });
  }

  const width = Math.max(560, GRAPH_PADDING_X * 2 + sortedDepths.length * COLUMN_WIDTH + NODE_WIDTH);
  const height = Math.max(320, GRAPH_PADDING_Y * 2 + maxRows * ROW_HEIGHT + 40);

  return { positionById, width, height };
}

function buildAdjacency(edges: readonly PairEdge[]): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const current = adjacency.get(edge.from);
    if (current) {
      if (!current.includes(edge.to)) {
        current.push(edge.to);
      }
    } else {
      adjacency.set(edge.from, [edge.to]);
    }
  }

  for (const neighbors of adjacency.values()) {
    neighbors.sort((a, b) => a.localeCompare(b));
  }

  return adjacency;
}

function hasPath(adjacency: Map<string, string[]>, from: string, to: string): boolean {
  if (from === to) {
    return true;
  }

  const visited = new Set<string>([from]);
  const queue = [from];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    for (const neighbor of adjacency.get(current) ?? []) {
      if (neighbor === to) {
        return true;
      }
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

function selectHotspots(nodes: Array<{ id: string; totalDegree: number }>, topN: number): Set<string> {
  const selected = nodes
    .filter((node) => node.totalDegree > 0)
    .sort((a, b) => b.totalDegree - a.totalDegree || a.id.localeCompare(b.id))
    .slice(0, topN)
    .map((node) => node.id);

  return new Set(selected);
}

function dedupeEdges(edges: readonly EdgeBase[]): EdgeBase[] {
  const seen = new Set<string>();
  const deduped: EdgeBase[] = [];
  for (const edge of edges) {
    const key = `${edge.from}::${edge.to}::${edge.kind}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(edge);
  }
  return deduped;
}

function dedupePairEdges(edges: readonly EdgeBase[]): PairEdge[] {
  const seen = new Set<string>();
  const deduped: PairEdge[] = [];
  for (const edge of edges) {
    const key = edgePairKey(edge.from, edge.to);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push({ from: edge.from, to: edge.to });
  }
  return deduped;
}

function edgePairKey(from: string, to: string): string {
  return `${from}::${to}`;
}

function shortLabel(sourcePath: string): string {
  const parts = sourcePath.split('/');
  return parts[parts.length - 1] ?? sourcePath;
}

function inferCategoryFromSourcePath(sourcePath: string): GraphNodeCategory | null {
  const segment = sourcePath.split('/')[1];
  if (!segment) {
    return null;
  }
  if (segment === 'validation-issues') {
    return 'validation_issue';
  }
  if (
    segment === 'entity' ||
    segment === 'manifest' ||
    segment === 'policy' ||
    segment === 'presentation' ||
    segment === 'validation'
  ) {
    return segment;
  }
  return 'internal';
}

function severityWeight(severity: 'error' | 'warning' | 'info'): number {
  if (severity === 'error') {
    return 0;
  }
  if (severity === 'warning') {
    return 1;
  }
  return 2;
}

function escapeMermaid(value: string): string {
  return value.split('"').join('\\"');
}

// Suppress unused-variable warnings for module-level constants that are used
// indirectly through the exported functions above.
void IMPORT_PUBLIC_EDGE_PAIRS;
