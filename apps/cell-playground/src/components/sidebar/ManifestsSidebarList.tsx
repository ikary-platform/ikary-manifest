import { APP_MANIFEST_SCENARIOS, MANIFEST_CATEGORY_LABELS, MANIFEST_CATEGORY_ORDER } from '../../data/app-manifest-loader';
import type { AppManifestScenario } from '../../data/app-manifest-loader';

interface ManifestsSidebarListProps {
  activeScenario: number;
  onSelect: (index: number) => void;
  collapsedCategories: Set<AppManifestScenario['category']>;
  onToggleCategory: (cat: AppManifestScenario['category']) => void;
}

function groupScenarios() {
  return MANIFEST_CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: MANIFEST_CATEGORY_LABELS[cat],
    scenarios: APP_MANIFEST_SCENARIOS.map((s, i) => ({ ...s, index: i })).filter((s) => s.category === cat),
  }));
}

const SCENARIO_GROUPS = groupScenarios();

export function ManifestsSidebarList({
  activeScenario,
  onSelect,
  collapsedCategories,
  onToggleCategory,
}: ManifestsSidebarListProps) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0 16px' }}>
      {SCENARIO_GROUPS.map((group) => {
        const collapsed = collapsedCategories.has(group.category);
        return (
          <div key={group.category}>
            <button
              onClick={() => onToggleCategory(group.category)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', width: '100%',
                padding: '8px 12px 4px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'hsl(var(--muted-foreground))', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '8px', marginTop: '1px' }}>{collapsed ? '▶' : '▼'}</span>
              {group.label}
            </button>
            {!collapsed && group.scenarios.map((scenario) => {
              const isSelected = activeScenario === scenario.index;
              return (
                <button
                  key={scenario.label}
                  onClick={() => onSelect(scenario.index)}
                  title={scenario.description}
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    padding: '5px 12px 5px 20px',
                    background: isSelected ? 'hsl(var(--accent))' : 'transparent',
                    border: 'none',
                    borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                    cursor: 'pointer', fontSize: '12px',
                    color: isSelected ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))',
                    textAlign: 'left', fontWeight: isSelected ? 500 : 400,
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {scenario.label}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
