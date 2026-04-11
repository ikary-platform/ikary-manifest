import type { EntityPoliciesDefinition, FieldPoliciesDefinition } from '@ikary/contract';

const SCOPE_COLORS: Record<string, string> = {
  public: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  tenant: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  workspace: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  owner: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  role: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  custom: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

function ScopeBadge({ scope }: { scope: string }) {
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${SCOPE_COLORS[scope] ?? SCOPE_COLORS.custom}`}
    >
      {scope}
    </span>
  );
}

const ACTIONS = ['view', 'create', 'update', 'delete'] as const;

export function PoliciesSection({
  policies,
  fieldPolicies,
}: {
  policies?: EntityPoliciesDefinition;
  fieldPolicies?: FieldPoliciesDefinition;
}) {
  if (!policies && !fieldPolicies) return null;

  const hasEntityPolicies = policies && ACTIONS.some((a) => policies[a]);
  const fieldKeys = fieldPolicies ? Object.keys(fieldPolicies) : [];
  const hasFieldPolicies = fieldKeys.length > 0;

  if (!hasEntityPolicies && !hasFieldPolicies) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Policies</h3>

      {/* Entity Policies */}
      {hasEntityPolicies && policies && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Entity Policies
          </p>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  <th className="text-left px-3 py-1.5 font-medium">Action</th>
                  <th className="text-left px-3 py-1.5 font-medium">Scope</th>
                  <th className="text-left px-3 py-1.5 font-medium">Condition</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {ACTIONS.map((action) => {
                  const policy = policies[action];
                  if (!policy) return null;
                  return (
                    <tr
                      key={action}
                      className="border-t border-gray-100 dark:border-gray-700"
                    >
                      <td className="px-3 py-1.5 font-medium text-gray-800 dark:text-gray-200 capitalize">
                        {action}
                      </td>
                      <td className="px-3 py-1.5">
                        <ScopeBadge scope={policy.scope} />
                      </td>
                      <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                        {policy.condition ? (
                          <code className="text-[10px] bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                            {policy.condition}
                          </code>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Field Policies */}
      {hasFieldPolicies && fieldPolicies && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Field Policies
          </p>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  <th className="text-left px-3 py-1.5 font-medium">Field</th>
                  <th className="text-left px-3 py-1.5 font-medium">View Scope</th>
                  <th className="text-left px-3 py-1.5 font-medium">View Condition</th>
                  <th className="text-left px-3 py-1.5 font-medium">Update Scope</th>
                  <th className="text-left px-3 py-1.5 font-medium">Update Condition</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {fieldKeys.map((fieldKey) => {
                  const fp = fieldPolicies[fieldKey];
                  if (!fp) return null;
                  return (
                    <tr
                      key={fieldKey}
                      className="border-t border-gray-100 dark:border-gray-700"
                    >
                      <td className="px-3 py-1.5 font-mono text-gray-800 dark:text-gray-200">
                        {fieldKey}
                      </td>
                      <td className="px-3 py-1.5">
                        {fp.view ? (
                          <ScopeBadge scope={fp.view.scope} />
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                        {fp.view?.condition ? (
                          <code className="text-[10px] bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                            {fp.view.condition}
                          </code>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        {fp.update ? (
                          <ScopeBadge scope={fp.update.scope} />
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                        {fp.update?.condition ? (
                          <code className="text-[10px] bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                            {fp.update.condition}
                          </code>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
