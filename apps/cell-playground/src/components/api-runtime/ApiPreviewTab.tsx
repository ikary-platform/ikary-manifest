import { useMemo, useState } from 'react';
import { deriveOpenAPISpec } from '@ikary/cell-engine';
import type { OpenAPISpec } from '@ikary/cell-engine';
import type { EntityDefinition } from '@ikary/cell-contract';
import { EndpointCard } from './EndpointCard';

interface ApiPreviewTabProps {
  entity: EntityDefinition;
}

interface EndpointEntry {
  path: string;
  method: string;
  operation: OpenAPISpec['paths'][string][string];
}

export function ApiPreviewTab({ entity }: ApiPreviewTabProps) {
  const [rawOpen, setRawOpen] = useState(false);

  const spec = useMemo(() => deriveOpenAPISpec(entity), [entity]);

  const { crud, capabilities } = useMemo(() => {
    const crudEntries: EndpointEntry[] = [];
    const capEntries: EndpointEntry[] = [];

    const basePath = Object.keys(spec.paths).find(
      (p) => !p.includes('/transitions/') &&
             !p.includes('/mutations/') &&
             !p.includes('/workflows/') &&
             !p.includes('/exports/') &&
             !p.includes('/integrations/') &&
             !p.includes('{id}'),
    );

    const itemPath = Object.keys(spec.paths).find(
      (p) => p.endsWith('{id}') &&
             !p.includes('/transitions/') &&
             !p.includes('/mutations/') &&
             !p.includes('/workflows/') &&
             !p.includes('/exports/') &&
             !p.includes('/integrations/'),
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
      {/* CRUD Operations */}
      {crud.length > 0 && (
        <div>
          <h3 className="mt-2 mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            CRUD Operations
          </h3>
          <div className="space-y-2">
            {crud.map((ep) => (
              <EndpointCard
                key={`${ep.method}-${ep.path}`}
                method={ep.method.toUpperCase()}
                path={ep.path}
                operation={ep.operation}
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
              <EndpointCard
                key={`${ep.method}-${ep.path}`}
                method={ep.method.toUpperCase()}
                path={ep.path}
                operation={ep.operation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Raw OpenAPI JSON */}
      <div>
        <button
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
