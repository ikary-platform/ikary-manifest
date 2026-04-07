import type { EntityValidationBlock } from '@ikary-manifest/contract';

type EntityValidation = EntityValidationBlock;

const SEVERITY_COLORS: Record<string, string> = {
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
};

const RULE_TYPE_COLORS: Record<string, string> = {
  entity_invariant: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cross_entity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  lifecycle: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  persistence_preview: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
};

export function ValidationSection({ validation }: { validation?: EntityValidation }) {
  if (!validation) return null;

  const hasEntityRules = validation.entityRules && validation.entityRules.length > 0;
  const hasServerValidators = validation.serverValidators && validation.serverValidators.length > 0;

  if (!hasEntityRules && !hasServerValidators) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Validation</h3>

      {/* Entity Rules */}
      {hasEntityRules && validation.entityRules && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Entity Rules
          </p>
          <div className="flex flex-wrap gap-2">
            {validation.entityRules.map((rule) => (
              <div
                key={rule.ruleId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-800 min-w-[200px] max-w-[300px]"
              >
                {/* Badges row */}
                <div className="flex items-center gap-1 flex-wrap mb-1.5">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${RULE_TYPE_COLORS[rule.type] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    {rule.type}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${SEVERITY_COLORS[rule.severity] ?? ''}`}
                  >
                    {rule.severity}
                  </span>
                  {rule.blocking && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-700">
                      blocking
                    </span>
                  )}
                </div>

                {/* Rule ID */}
                <p className="text-xs font-mono text-gray-900 dark:text-gray-100">
                  {rule.ruleId}
                </p>

                {/* Paths */}
                {rule.paths.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {rule.paths.map((path) => (
                      <span
                        key={path}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 font-mono"
                      >
                        {path}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message key */}
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 truncate">
                  {rule.messageKey}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Server Validators */}
      {hasServerValidators && validation.serverValidators && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Server Validators
          </p>
          <div className="flex flex-wrap gap-2">
            {validation.serverValidators.map((v) => (
              <div
                key={v.ruleId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-800 min-w-[200px] max-w-[300px]"
              >
                {/* Badges row */}
                <div className="flex items-center gap-1 flex-wrap mb-1.5">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${RULE_TYPE_COLORS[v.type] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    {v.type}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${SEVERITY_COLORS[v.severity] ?? ''}`}
                  >
                    {v.severity}
                  </span>
                  {v.blocking && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-700">
                      blocking
                    </span>
                  )}
                </div>

                {/* Rule ID */}
                <p className="text-xs font-mono text-gray-900 dark:text-gray-100">{v.ruleId}</p>

                {/* Validator ref */}
                <code className="block text-[10px] mt-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 break-all">
                  {v.validatorRef}
                </code>

                {/* Message key */}
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 truncate">
                  {v.messageKey}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
