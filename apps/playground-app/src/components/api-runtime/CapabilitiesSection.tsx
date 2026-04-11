import type { CapabilityDefinition } from '@ikary/contract';

const TYPE_COLORS: Record<string, string> = {
  transition: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  mutation: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  workflow: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  export: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  integration: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function CapabilitiesSection({ capabilities }: { capabilities: CapabilityDefinition[] }) {
  if (!capabilities || capabilities.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Capabilities</h3>
      <div className="flex flex-wrap gap-3">
        {capabilities.map((cap) => (
          <div
            key={cap.key}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 min-w-[220px] max-w-[340px]"
          >
            {/* Header badges */}
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_COLORS[cap.type] ?? ''}`}
              >
                {cap.type}
              </span>
              {cap.scope && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {cap.scope}
                </span>
              )}
            </div>

            {/* Key */}
            <p className="text-xs font-mono text-gray-900 dark:text-gray-100">{cap.key}</p>

            {/* Description */}
            {cap.description && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                {cap.description}
              </p>
            )}

            {/* Inputs table */}
            {cap.inputs && cap.inputs.length > 0 && (
              <div className="mt-2 overflow-hidden rounded border border-gray-200 dark:border-gray-700">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                      <th className="text-left px-2 py-1 font-medium">Key</th>
                      <th className="text-left px-2 py-1 font-medium">Type</th>
                      <th className="text-center px-2 py-1 font-medium">Req</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cap.inputs.map((input) => (
                      <tr
                        key={input.key}
                        className="border-t border-gray-100 dark:border-gray-700"
                      >
                        <td className="px-2 py-1 font-mono text-gray-800 dark:text-gray-200">
                          {input.key}
                        </td>
                        <td className="px-2 py-1 text-gray-600 dark:text-gray-400">
                          {input.type}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {input.required ? (
                            <span className="text-red-500 dark:text-red-400 font-bold">*</span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
