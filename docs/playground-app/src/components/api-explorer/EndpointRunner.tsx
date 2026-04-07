import { useState, useMemo } from 'react';
import type {
  OpenAPIOperation,
  OpenAPISchema,
  OpenAPISpec,
} from '@ikary/engine';
import type { MockRequest, ExecutionResult } from './types';

// ── Props ───────────────────────────────────────────────────────────────────

interface EndpointRunnerProps {
  method: string;
  path: string;
  operation: OpenAPIOperation;
  spec: OpenAPISpec;
  entityKey: string;
  onExecute: (request: MockRequest) => Promise<ExecutionResult>;
}

// ── Method badge colors (mirrors EndpointCard) ─────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

// ── Status badge colors ─────────────────────────────────────────────────────

function statusColor(status: number): string {
  if (status === 200) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
  if (status === 201) return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
  return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
}

// ── Highlighted path (with {param} in amber) ────────────────────────────────

function HighlightedPath({ path }: { path: string }) {
  const parts = path.split(/(\{[^}]+\})/g);
  return (
    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
      {parts.map((part, i) =>
        part.startsWith('{') ? (
          <span key={i} className="text-amber-600 dark:text-amber-400">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

// ── Resolve a $ref schema ───────────────────────────────────────────────────

function resolveSchema(
  schema: OpenAPISchema,
  spec: OpenAPISpec,
): OpenAPISchema {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop()!;
    return spec.components.schemas[refName] ?? schema;
  }
  return schema;
}

// ── Generate an example request body from schema ────────────────────────────

function generateExampleBody(
  operation: OpenAPIOperation,
  spec: OpenAPISpec,
): string {
  const rawSchema =
    operation.requestBody?.content?.['application/json']?.schema;
  if (!rawSchema) return '{}';

  const schema = resolveSchema(rawSchema, spec);
  const properties = schema.properties;
  if (!properties || Object.keys(properties).length === 0) return '{}';

  const example: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(properties)) {
    const resolved = resolveSchema(prop, spec);

    if (resolved.enum && resolved.enum.length > 0) {
      example[key] = resolved.enum[0];
    } else if (resolved.format === 'date' || resolved.format === 'date-time') {
      example[key] = '2025-01-01';
    } else if (resolved.type === 'string') {
      example[key] = '';
    } else if (resolved.type === 'number' || resolved.type === 'integer') {
      example[key] = 0;
    } else if (resolved.type === 'boolean') {
      example[key] = false;
    } else {
      example[key] = '';
    }
  }

  return JSON.stringify(example, null, 2);
}

// ── Default path parameter values ───────────────────────────────────────────

function buildDefaultPathParams(
  operation: OpenAPIOperation,
  entityKey: string,
): Record<string, string> {
  const defaults: Record<string, string> = {};
  const params = operation.parameters ?? [];

  for (const param of params) {
    if (param.in !== 'path') continue;

    switch (param.name) {
      case 'tenantId':
        defaults[param.name] = '00000000-0000-0000-0000-000000000001';
        break;
      case 'workspaceId':
        defaults[param.name] = '00000000-0000-0000-0000-000000000002';
        break;
      case 'cellKey':
        defaults[param.name] = 'playground';
        break;
      case 'entityKey':
        defaults[param.name] = entityKey;
        break;
      case 'id':
        defaults[param.name] = '';
        break;
      default:
        defaults[param.name] = '';
    }
  }

  return defaults;
}

// ── Main component ──────────────────────────────────────────────────────────

export function EndpointRunner({
  method,
  path,
  operation,
  spec,
  entityKey,
  onExecute,
}: EndpointRunnerProps) {
  const upperMethod = method.toUpperCase();
  const badgeColor =
    METHOD_COLORS[upperMethod] ??
    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

  const pathParams0 = useMemo(
    () => buildDefaultPathParams(operation, entityKey),
    [operation, entityKey],
  );

  const hasPathId = path.includes('{id}');
  const isGetList = upperMethod === 'GET' && !hasPathId;
  const hasBody = upperMethod === 'POST' || upperMethod === 'PUT';

  // ── State ───────────────────────────────────────────────────────────────

  const [expanded, setExpanded] = useState(false);
  const [pathParams, setPathParams] = useState<Record<string, string>>(pathParams0);
  const [queryParams, setQueryParams] = useState<Record<string, string>>({
    page: '1',
    pageSize: '20',
    sortField: '',
    sortDir: 'asc',
    search: '',
    filter: '',
  });
  const [bodyText, setBodyText] = useState(() =>
    generateExampleBody(operation, spec),
  );
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────

  function updatePathParam(key: string, value: string) {
    setPathParams((prev) => ({ ...prev, [key]: value }));
  }

  function updateQueryParam(key: string, value: string) {
    setQueryParams((prev) => ({ ...prev, [key]: value }));
  }

  async function handleExecute() {
    setExecuting(true);
    setResult(null);
    try {
      let resolvedPath = path;
      for (const [key, val] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.replace(
          `{${key}}`,
          encodeURIComponent(val),
        );
      }

      // Build query: strip empty values for GET list requests
      const query: Record<string, string> = {};
      if (isGetList) {
        for (const [k, v] of Object.entries(queryParams)) {
          if (v) query[k] = v;
        }
      }

      const request: MockRequest = {
        method: upperMethod as MockRequest['method'],
        path: resolvedPath,
        query,
        body: hasBody ? JSON.parse(bodyText) : null,
      };

      const res = await onExecute(request);
      setResult(res);
    } catch (err) {
      setResult({
        request: {
          method: upperMethod as MockRequest['method'],
          path,
          query: {},
          body: null,
        },
        response: {
          status: 400,
          body: { error: String(err) },
          headers: {},
        },
        durationMs: 0,
        timestamp: new Date(),
      });
    } finally {
      setExecuting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  const pathParamEntries = (operation.parameters ?? []).filter(
    (p) => p.in === 'path',
  );

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span
          className={`inline-block shrink-0 rounded px-2 py-0.5 text-[11px] font-bold leading-none uppercase ${badgeColor}`}
        >
          {upperMethod}
        </span>
        <HighlightedPath path={path} />
        {operation.summary && (
          <span
            className="ml-auto mr-2 text-xs text-gray-400 dark:text-gray-500 truncate max-w-[280px]"
            title={operation.summary}
          >
            {operation.summary}
          </span>
        )}
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 py-3 space-y-4">
          {/* Path Parameters */}
          {pathParamEntries.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                Path Parameters
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {pathParamEntries.map((param) => (
                  <label key={param.name} className="block">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      {param.name}
                    </span>
                    <input
                      type="text"
                      value={pathParams[param.name] ?? ''}
                      onChange={(e) =>
                        updatePathParam(param.name, e.target.value)
                      }
                      placeholder={param.name}
                      className="mt-0.5 block w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Query Parameters (GET list only) */}
          {isGetList && (
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
                    onChange={(e) => updateQueryParam('page', e.target.value)}
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
                    onChange={(e) =>
                      updateQueryParam('pageSize', e.target.value)
                    }
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
                    onChange={(e) =>
                      updateQueryParam('sortField', e.target.value)
                    }
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
                    onChange={(e) =>
                      updateQueryParam('sortDir', e.target.value)
                    }
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
                    onChange={(e) =>
                      updateQueryParam('search', e.target.value)
                    }
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
                    onChange={(e) =>
                      updateQueryParam('filter', e.target.value)
                    }
                    rows={2}
                    placeholder='{"logic":"and","rules":[{"field":"name","operator":"contains","value":"test"}]}'
                    className="mt-0.5 block w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-y"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Request Body (POST / PUT) */}
          {hasBody && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                Request Body
              </h4>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={Math.min(bodyText.split('\n').length + 1, 16)}
                className="block w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-y"
              />
            </div>
          )}

          {/* Execute button */}
          <div>
            <button
              type="button"
              onClick={handleExecute}
              disabled={executing}
              className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {executing && (
                <svg
                  className="animate-spin h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {executing ? 'Executing...' : 'Execute'}
            </button>
          </div>

          {/* Response panel */}
          {result && (
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
          )}
        </div>
      )}
    </div>
  );
}
