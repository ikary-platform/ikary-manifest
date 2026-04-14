import type { OpenAPISchema } from '@ikary/cell-engine';

// ── Props ─────────────────────────────────────────────────────────────────────

interface EndpointQueryEditorProps {
  queryParams: Record<string, string>;
  onSetQueryParam: (key: string, value: string) => void;
  querySchema?: OpenAPISchema;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EndpointQueryEditor({
  queryParams,
  onSetQueryParam,
}: EndpointQueryEditorProps) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
        Query Parameters
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
            page
          </span>
          <input
            type="text"
            value={queryParams.page}
            onChange={(e) => onSetQueryParam('page', e.target.value)}
            className="mt-0.5 block w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
            pageSize
          </span>
          <input
            type="text"
            value={queryParams.pageSize}
            onChange={(e) => onSetQueryParam('pageSize', e.target.value)}
            className="mt-0.5 block w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
            sortField
          </span>
          <input
            type="text"
            value={queryParams.sortField}
            onChange={(e) => onSetQueryParam('sortField', e.target.value)}
            placeholder="field key"
            className="mt-0.5 block w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
            sortDir
          </span>
          <select
            value={queryParams.sortDir}
            onChange={(e) => onSetQueryParam('sortDir', e.target.value)}
            className="mt-0.5 block w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </select>
        </label>
        <label className="col-span-2 block">
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
            search
          </span>
          <input
            type="text"
            value={queryParams.search}
            onChange={(e) => onSetQueryParam('search', e.target.value)}
            placeholder="full-text search"
            className="mt-0.5 block w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        <label className="col-span-2 block">
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
            filter
          </span>
          <textarea
            value={queryParams.filter}
            onChange={(e) => onSetQueryParam('filter', e.target.value)}
            rows={2}
            placeholder='{"logic":"and","rules":[{"field":"name","operator":"contains","value":"test"}]}'
            className="mt-0.5 block w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-y"
          />
        </label>
      </div>
    </div>
  );
}
