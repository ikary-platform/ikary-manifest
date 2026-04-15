import { DependencyList } from './DependencyList';
import { SchemaDependencyGraph } from './SchemaDependencyGraph';
import { SchemaDiagnosticsPanel } from './SchemaDiagnosticsPanel';
import { toCategoryLabel } from './schemaGraphUtils';
import { useDependencyGraph } from './useDependencyGraph';

export function SchemaDependencyGraphWorkspace() {
  const {
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
    viewModel,
    selectedNode,
    sortedNodes,
    inboundEdges,
    outboundEdges,
    nodeById,
  } = useDependencyGraph();

  const selectClass = 'h-8 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="grid gap-4">
      {/* Controls card */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
        <div className="px-4 pt-4 pb-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Dependencies Workspace</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inspect schema dependency structure with hybrid edges and diagnostics.</p>
        </div>
        <div className="px-4 pb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
            onChange={(event) => setMode(event.target.value as typeof mode)}
            className={selectClass}
          >
            <option value="hybrid">Hybrid edges</option>
            <option value="declared">Declared only</option>
            <option value="import">Import only</option>
          </select>
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as typeof scope)}
            className={selectClass}
          >
            <option value="all_modules">All modules</option>
            <option value="public_only">Public only</option>
          </select>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
            className={selectClass}
          >
            <option value="degree">Sort by degree</option>
            <option value="name">Sort by name</option>
            <option value="in_degree">Sort by in-degree</option>
            <option value="out_degree">Sort by out-degree</option>
            <option value="leaf_first">Leaf nodes first</option>
            <option value="hotspot_first">Hotspots first</option>
          </select>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* Node list */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 min-h-[28rem]">
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Nodes ({sortedNodes.length})</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select a node to inspect inbound/outbound dependencies.</p>
          </div>
          <div className="px-4 pb-4">
            <div className="rounded border border-gray-200 dark:border-gray-700 max-h-[34rem] overflow-auto">
              {sortedNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full text-left px-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                    node.id === selectedNodeId
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold truncate text-gray-800 dark:text-gray-200">{node.label}</p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{node.totalDegree}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
                      {node.category}
                    </span>
                    {node.isLeaf && (
                      <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
                        leaf
                      </span>
                    )}
                    {node.isRoot && (
                      <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
                        root
                      </span>
                    )}
                    {node.isHotspot && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                        hotspot
                      </span>
                    )}
                    {node.isCrossReferenced && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
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
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 min-h-[28rem]">
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Dependency Graph</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Edge direction: <span className="font-medium">A → B</span> means A depends on B.
            </p>
          </div>
          <div className="px-4 pb-4">
            <div className="rounded border border-gray-200 dark:border-gray-700 overflow-auto max-h-[34rem]">
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
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 min-h-[28rem]">
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Selected Node</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inbound and outbound dependency details.</p>
          </div>
          <div className="px-4 pb-4 space-y-4">
            {selectedNode ? (
              <>
                <div className="space-y-1">
                  <p className="font-mono text-xs font-semibold break-all text-gray-800 dark:text-gray-200">{selectedNode.label}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 break-all">{selectedNode.id}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
                      {selectedNode.category}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
                      in: {selectedNode.inDegree}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
                      out: {selectedNode.outDegree}
                    </span>
                    {selectedNode.isLeaf && (
                      <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
                        leaf
                      </span>
                    )}
                    {selectedNode.isRoot && (
                      <span className="px-1.5 py-0.5 text-[10px] border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
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
              <p className="text-xs text-gray-400 dark:text-gray-500">No node selected.</p>
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
