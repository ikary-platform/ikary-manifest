import type { OpenAPIOperation } from '@ikary/cell-engine';

// ── Props ─────────────────────────────────────────────────────────────────────

interface EndpointPathEditorProps {
  pathParams: Record<string, string>;
  onSetPathParam: (key: string, value: string) => void;
  pathTemplate: string;
  operation: OpenAPIOperation;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EndpointPathEditor({
  pathParams,
  onSetPathParam,
  operation,
}: EndpointPathEditorProps) {
  const pathParamEntries = (operation.parameters ?? []).filter(
    (p) => p.in === 'path',
  );

  if (pathParamEntries.length === 0) return null;

  return (
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
              onChange={(e) => onSetPathParam(param.name, e.target.value)}
              placeholder={param.name}
              className="mt-0.5 block w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
