import { useMemo, useState } from 'react';
import type { EntityDefinition } from '@ikary/contract';
import type { OpenAPIOperation } from '@ikary/engine';
import { useApiExplorer } from './useApiExplorer';
import { EndpointRunner } from './EndpointRunner';

// ── Props ───────────────────────────────────────────────────────────────────

interface ApiExplorerPanelProps {
  entity: EntityDefinition;
}

// ── Endpoint entry helper ───────────────────────────────────────────────────

interface EndpointEntry {
  path: string;
  method: string;
  operation: OpenAPIOperation;
}

// ── Capability path segments ────────────────────────────────────────────────

const CAPABILITY_SEGMENTS = [
  '/transitions/',
  '/mutations/',
  '/workflows/',
  '/exports/',
  '/integrations/',
];

function isCapabilityPath(path: string): boolean {
  return CAPABILITY_SEGMENTS.some((seg) => path.includes(seg));
}

// ── Main component ──────────────────────────────────────────────────────────

export function ApiExplorerPanel({ entity }: ApiExplorerPanelProps) {
  const { spec, recordCount, execute, seed, resetStore } =
    useApiExplorer(entity);

  const [rawOpen, setRawOpen] = useState(false);

  const { crud, capabilities } = useMemo(() => {
    const crudEntries: EndpointEntry[] = [];
    const capEntries: EndpointEntry[] = [];

    const basePath = Object.keys(spec.paths).find(
      (p) => !isCapabilityPath(p) && !p.includes('{id}'),
    );

    const itemPath = Object.keys(spec.paths).find(
      (p) => p.endsWith('{id}') && !isCapabilityPath(p),
    );

    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        const entry: EndpointEntry = { path, method, operation };

        if (path === basePath || path === itemPath) {
          crudEntries.push(entry);
        } else {
          capEntries.push(entry);
        }
      }
    }

    return { crud: crudEntries, capabilities: capEntries };
  }, [spec]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
        <button
          type="button"
          onClick={() => seed(10)}
          className="px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Seed 10
        </button>
        <button
          type="button"
          onClick={() => seed(50)}
          className="px-3 py-1.5 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Seed 50
        </button>
        <button
          type="button"
          onClick={resetStore}
          className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Reset Store
        </button>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {recordCount} record{recordCount !== 1 ? 's' : ''} in store
        </span>
      </div>

      {/* CRUD Operations */}
      {crud.length > 0 && (
        <div>
          <h3 className="mt-2 mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            CRUD Operations
          </h3>
          <div className="space-y-2">
            {crud.map((ep) => (
              <EndpointRunner
                key={`${ep.method}-${ep.path}`}
                method={ep.method.toUpperCase()}
                path={ep.path}
                operation={ep.operation}
                spec={spec}
                entityKey={entity.key}
                onExecute={execute}
              />
            ))}
          </div>
        </div>
      )}

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Capabilities
          </h3>
          <div className="space-y-2">
            {capabilities.map((ep) => (
              <EndpointRunner
                key={`${ep.method}-${ep.path}`}
                method={ep.method.toUpperCase()}
                path={ep.path}
                operation={ep.operation}
                spec={spec}
                entityKey={entity.key}
                onExecute={execute}
              />
            ))}
          </div>
        </div>
      )}

      {/* Raw OpenAPI JSON */}
      <div>
        <button
          type="button"
          onClick={() => setRawOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg
            className={`w-3 h-3 transition-transform ${rawOpen ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Raw OpenAPI JSON
        </button>

        {rawOpen && (
          <pre className="mt-2 p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-96 leading-relaxed">
            {JSON.stringify(spec, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
