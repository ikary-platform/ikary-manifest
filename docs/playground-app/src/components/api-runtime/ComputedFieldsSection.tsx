import type { ComputedFieldDefinition } from '@ikary-manifest/contract';

const FORMULA_COLORS: Record<string, string> = {
  expression: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  conditional: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  aggregation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const TYPE_COLORS: Record<string, string> = {
  number: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200',
  string: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
  boolean: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  date: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
  datetime: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200',
};

export function ComputedFieldsSection({ fields }: { fields: ComputedFieldDefinition[] }) {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Computed Fields</h3>
      <div className="flex flex-wrap gap-3">
        {fields.map((field) => (
          <div
            key={field.key}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 min-w-[220px] max-w-[340px]"
          >
            {/* Header badges */}
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${FORMULA_COLORS[field.formulaType] ?? ''}`}
              >
                {field.formulaType}
              </span>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[field.type] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {field.type}
              </span>
            </div>

            {/* Key and name */}
            <p className="text-xs font-mono text-gray-900 dark:text-gray-100">{field.key}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">{field.name}</p>

            {/* Expression details */}
            {field.formulaType === 'expression' && (
              <div className="space-y-1.5">
                <code className="block text-[10px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-800 dark:text-gray-200 break-all">
                  {field.expression}
                </code>
                {field.dependencies && field.dependencies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {field.dependencies.map((dep) => (
                      <span
                        key={dep}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conditional details */}
            {field.formulaType === 'conditional' && (
              <div className="space-y-1 text-[11px]">
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-600 dark:text-gray-300">if</span>{' '}
                  <code className="bg-gray-50 dark:bg-gray-900 px-1 rounded text-[10px]">
                    {field.condition}
                  </code>
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-600 dark:text-gray-300">then</span>{' '}
                  <code className="bg-gray-50 dark:bg-gray-900 px-1 rounded text-[10px]">
                    {field.then}
                  </code>
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-600 dark:text-gray-300">else</span>{' '}
                  <code className="bg-gray-50 dark:bg-gray-900 px-1 rounded text-[10px]">
                    {field.else}
                  </code>
                </p>
              </div>
            )}

            {/* Aggregation details */}
            {field.formulaType === 'aggregation' && (
              <div className="space-y-1 text-[11px]">
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Relation:</span>{' '}
                  {field.relation}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Operation:</span>{' '}
                  <span className="font-semibold">{field.operation}</span>
                </p>
                {field.field && (
                  <p className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Field:</span>{' '}
                    <code className="bg-gray-50 dark:bg-gray-900 px-1 rounded text-[10px]">
                      {field.field}
                    </code>
                  </p>
                )}
              </div>
            )}

            {/* Help text */}
            {field.helpText && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 italic">
                {field.helpText}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
