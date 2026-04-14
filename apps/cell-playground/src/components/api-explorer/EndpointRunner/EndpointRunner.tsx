import { useState } from 'react';
import type {
  OpenAPIOperation,
  OpenAPISpec,
} from '@ikary/cell-engine';
import type { MockRequest, ExecutionResult } from '../types';
import { useEndpointRequest } from './useEndpointRequest';
import { EndpointPathEditor } from './EndpointPathEditor';
import { EndpointQueryEditor } from './EndpointQueryEditor';
import { EndpointBodyEditor } from './EndpointBodyEditor';
import { EndpointResponse } from './EndpointResponse';

// ── Props ─────────────────────────────────────────────────────────────────────

interface EndpointRunnerProps {
  method: string;
  path: string;
  operation: OpenAPIOperation;
  spec: OpenAPISpec;
  entityKey: string;
  onExecute: (request: MockRequest) => Promise<ExecutionResult>;
}

// ── Method badge colors (mirrors EndpointCard) ────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

// ── Highlighted path (with {param} in amber) ──────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

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

  const hasPathId = path.includes('{id}');
  const isGetList = upperMethod === 'GET' && !hasPathId;
  const hasBody = upperMethod === 'POST' || upperMethod === 'PUT';

  const [expanded, setExpanded] = useState(false);

  const {
    pathParams,
    setPathParam,
    queryParams,
    setQueryParam,
    body,
    setBody,
    executing,
    result,
    execute,
  } = useEndpointRequest({ method, path, operation, spec, entityKey, onExecute });

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
          <EndpointPathEditor
            pathParams={pathParams}
            onSetPathParam={setPathParam}
            pathTemplate={path}
            operation={operation}
          />

          {isGetList && (
            <EndpointQueryEditor
              queryParams={queryParams}
              onSetQueryParam={setQueryParam}
            />
          )}

          {hasBody && (
            <EndpointBodyEditor
              body={body}
              onChange={setBody}
            />
          )}

          {/* Execute button */}
          <div>
            <button
              type="button"
              onClick={execute}
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

          <EndpointResponse result={result} />
        </div>
      )}
    </div>
  );
}
