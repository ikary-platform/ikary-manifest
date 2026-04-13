import { useState } from 'react';
import type { OpenAPIOperation, OpenAPISchema } from '@ikary/cell-engine';

// ── Method badge colors ─────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PATCH: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

// ── Props ───────────────────────────────────────────────────────────────────

interface EndpointCardProps {
  method: string;
  path: string;
  operation: OpenAPIOperation;
}

// ── Shared table header style ───────────────────────────────────────────────

const TH =
  'py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left';

const TD = 'py-1.5 px-2 text-xs text-gray-600 dark:text-gray-400';

// ── Path with highlighted params ────────────────────────────────────────────

function HighlightedPath({ path }: { path: string }) {
  const parts = path.split(/(\{[^}]+\})/g);
  return (
    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
      {parts.map((part, i) =>
        part.startsWith('{') ? (
          <span key={i} className="text-amber-600 dark:text-amber-400">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

// ── Collapsible section ─────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-100 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <svg
          className={`h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {title}
      </button>
      {open && <div className="px-3 pb-2">{children}</div>}
    </div>
  );
}

// ── Schema properties table ─────────────────────────────────────────────────

function SchemaPropertiesTable({
  schema,
}: {
  schema: OpenAPISchema;
}) {
  const properties = schema.properties;
  if (!properties || Object.keys(properties).length === 0) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500 italic py-1">
        No properties defined.
      </p>
    );
  }

  const requiredKeys = new Set(schema.required ?? []);

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className={TH}>Name</th>
          <th className={TH}>Type</th>
          <th className={TH}>Required</th>
          <th className={TH}>Description</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(properties).map(([name, prop]) => (
          <tr key={name} className="border-b border-gray-100 dark:border-gray-800">
            <td className={`${TD} font-mono text-gray-700 dark:text-gray-300`}>{name}</td>
            <td className={TD}>{formatSchemaType(prop)}</td>
            <td className={TD}>
              {requiredKeys.has(name) ? (
                <span className="text-green-600 dark:text-green-400">Yes</span>
              ) : (
                <span className="text-gray-300 dark:text-gray-600">-</span>
              )}
            </td>
            <td className={`${TD} truncate max-w-[200px]`} title={prop.description}>
              {prop.description ?? <span className="text-gray-300 dark:text-gray-600">-</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Format schema type for display ──────────────────────────────────────────

function formatSchemaType(schema: OpenAPISchema): string {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop() ?? schema.$ref;
    return refName;
  }
  if (schema.type === 'array' && schema.items) {
    return `${formatSchemaType(schema.items)}[]`;
  }
  let typeName = schema.type ?? 'any';
  if (schema.format) {
    typeName += ` (${schema.format})`;
  }
  if (schema.enum) {
    typeName += ` [${schema.enum.join(', ')}]`;
  }
  return typeName;
}

// ── Resolve response schema ─────────────────────────────────────────────────

function getResponseSchema(operation: OpenAPIOperation): OpenAPISchema | null {
  const successCode = operation.responses['200'] ?? operation.responses['201'];
  if (!successCode?.content?.['application/json']?.schema) return null;
  return successCode.content['application/json'].schema;
}

// ── Resolve request body schema ─────────────────────────────────────────────

function getRequestBodySchema(operation: OpenAPIOperation): OpenAPISchema | null {
  if (!operation.requestBody?.content?.['application/json']?.schema) return null;
  return operation.requestBody.content['application/json'].schema;
}

// ── Main component ──────────────────────────────────────────────────────────

export function EndpointCard({ method, path, operation }: EndpointCardProps) {
  const upperMethod = method.toUpperCase();
  const badgeColor = METHOD_COLORS[upperMethod] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

  const hasParams = operation.parameters && operation.parameters.length > 0;
  const requestBodySchema = getRequestBodySchema(operation);
  const responseSchema = getResponseSchema(operation);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
        <span className={`inline-block shrink-0 rounded px-2 py-0.5 text-[11px] font-bold leading-none uppercase ${badgeColor}`}>
          {upperMethod}
        </span>
        <HighlightedPath path={path} />
        {operation.summary && (
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 truncate max-w-[280px]" title={operation.summary}>
            {operation.summary}
          </span>
        )}
      </div>

      {/* Parameters section */}
      {hasParams && (
        <CollapsibleSection title={`Parameters (${operation.parameters!.length})`}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className={TH}>Name</th>
                <th className={TH}>In</th>
                <th className={TH}>Type</th>
                <th className={TH}>Required</th>
                <th className={TH}>Description</th>
              </tr>
            </thead>
            <tbody>
              {operation.parameters!.map((param) => (
                <tr key={`${param.in}-${param.name}`} className="border-b border-gray-100 dark:border-gray-800">
                  <td className={`${TD} font-mono text-gray-700 dark:text-gray-300`}>{param.name}</td>
                  <td className={TD}>{param.in}</td>
                  <td className={TD}>{formatSchemaType(param.schema)}</td>
                  <td className={TD}>
                    {param.required ? (
                      <span className="text-green-600 dark:text-green-400">Yes</span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">-</span>
                    )}
                  </td>
                  <td className={`${TD} truncate max-w-[200px]`} title={param.description}>
                    {param.description ?? <span className="text-gray-300 dark:text-gray-600">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      )}

      {/* Request Body section */}
      {requestBodySchema && (
        <CollapsibleSection title="Request Body">
          {requestBodySchema.$ref ? (
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 py-1">
              {requestBodySchema.$ref.split('/').pop()}
            </p>
          ) : (
            <SchemaPropertiesTable schema={requestBodySchema} />
          )}
        </CollapsibleSection>
      )}

      {/* Response section */}
      {responseSchema && (
        <CollapsibleSection title="Response">
          {responseSchema.$ref ? (
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 py-1">
              {responseSchema.$ref.split('/').pop()}
            </p>
          ) : (
            <SchemaPropertiesTable schema={responseSchema} />
          )}
        </CollapsibleSection>
      )}
    </div>
  );
}
