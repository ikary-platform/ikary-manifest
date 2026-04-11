const CRUD_ACTIONS = new Set(['view', 'create', 'update', 'delete']);

interface ScopeGroup {
  label: string;
  scopes: string[];
  color: string;
}

function classifyScope(scope: string): 'crud' | 'lifecycle' | 'capability' | 'other' {
  const parts = scope.split('.');
  if (parts.length >= 2) {
    if (CRUD_ACTIONS.has(parts[1])) return 'crud';
    if (parts[1] === 'transition' || parts[1] === 'lifecycle') return 'lifecycle';
    if (parts[1] === 'capability') return 'capability';
  }
  return 'other';
}

const GROUP_COLORS: Record<string, string> = {
  crud: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  lifecycle: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  capability: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const GROUP_LABELS: Record<string, string> = {
  crud: 'Entity CRUD',
  lifecycle: 'Lifecycle / Transitions',
  capability: 'Capabilities',
  other: 'Other',
};

const GROUP_ORDER: string[] = ['crud', 'lifecycle', 'capability', 'other'];

export function ScopeRegistrySection({ scopes }: { scopes: string[] }) {
  if (!scopes || scopes.length === 0) return null;

  const grouped = scopes.reduce<Record<string, string[]>>((acc, scope) => {
    const category = classifyScope(scope);
    if (!acc[category]) acc[category] = [];
    acc[category].push(scope);
    return acc;
  }, {});

  const groups: ScopeGroup[] = GROUP_ORDER.filter((key) => grouped[key] && grouped[key].length > 0).map(
    (key) => ({
      label: GROUP_LABELS[key],
      scopes: grouped[key],
      color: GROUP_COLORS[key],
    }),
  );

  if (groups.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Scope Registry</h3>

      {groups.map((group) => (
        <div key={group.label} className="space-y-1.5">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.scopes.map((scope) => (
              <span
                key={scope}
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${group.color}`}
              >
                {scope}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
