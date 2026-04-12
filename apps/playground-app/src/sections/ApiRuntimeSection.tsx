import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { deriveCreateFields, deriveEditFields, deriveEntityScopeRegistry } from '@ikary/engine';
import type { EntityDefinition, FieldDefinition } from '@ikary/contract';
import { JsonEditor } from '../components/JsonEditor';
import { API_ENTITY_SCENARIOS, CATEGORY_LABELS } from '../data/api-sample-entities';
import type { ApiEntityScenario } from '../data/api-sample-entities';
import { EntityOverviewTab } from '../components/api-runtime/EntityOverviewTab';
import { ApiExplorerPanel } from '../components/api-explorer/ApiExplorerPanel';
import { CreateFieldsTab } from '../components/api-runtime/CreateFieldsTab';
import { EditFieldsTab } from '../components/api-runtime/EditFieldsTab';
import { ScopeRegistryTab } from '../components/api-runtime/ScopeRegistryTab';
import { RelationDiagramTab } from '../components/api-runtime/RelationDiagramTab';

type OutputTab = 'overview' | 'api-explorer' | 'create-fields' | 'edit-fields' | 'scope-registry' | 'relations';

const OUTPUT_TABS: Array<{ key: OutputTab; label: string; description: string }> = [
  {
    key: 'overview',
    label: 'Entity Overview',
    description: 'Visual representation of the entity: fields, relations, lifecycle, capabilities, policies, and validation.',
  },
  {
    key: 'api-explorer',
    label: 'API Explorer',
    description: 'Interactive mock API runner. Execute requests against an in-memory store derived from the entity definition.',
  },
  {
    key: 'create-fields',
    label: 'Create Fields',
    description: 'Fields included in the create form, with resolved order, placeholder, and validation rules.',
  },
  {
    key: 'edit-fields',
    label: 'Edit Fields',
    description: 'Fields included in the edit form. System fields and hidden fields are excluded.',
  },
  {
    key: 'scope-registry',
    label: 'Scope Registry',
    description:
      'Permission scopes derived from the entity: standard CRUD scopes, lifecycle transitions, and capability scopes.',
  },
  {
    key: 'relations',
    label: 'Relations',
    description:
      'Entity-relation diagram: belongs_to, has_many, many_to_many, self, and polymorphic connections rendered as an SVG graph with annotated join tables.',
  },
];

type Category = ApiEntityScenario['category'];

const CATEGORY_ORDER: Category[] = ['docs', 'crm', 'erp', 'projects', 'hr', 'finance'];

function groupScenarios() {
  return CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    scenarios: API_ENTITY_SCENARIOS.map((s, i) => ({ ...s, index: i })).filter((s) => s.category === cat),
  }));
}

const SCENARIO_GROUPS = groupScenarios();

export function ApiRuntimeSection() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<Category>>(new Set());
  const [json, setJson] = useState(() => JSON.stringify(API_ENTITY_SCENARIOS[0].entity, null, 2));
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as OutputTab | null;
  const outputTab: OutputTab = tabParam && OUTPUT_TABS.some((t) => t.key === tabParam) ? tabParam : 'overview';
  const setOutputTab = (t: OutputTab) => setSearchParams(t === 'overview' ? {} : { tab: t }, { replace: true });

  const { entity, parseError } = useMemo(() => {
    try {
      return { entity: JSON.parse(json) as EntityDefinition, parseError: null };
    } catch (e) {
      return { entity: null, parseError: String(e) };
    }
  }, [json]);

  const derived = useMemo(() => {
    if (!entity) return null;
    try {
      const fields = (entity.fields ?? []) as FieldDefinition[];
      return {
        createFields: deriveCreateFields(fields),
        editFields: deriveEditFields(fields),
        scopes: deriveEntityScopeRegistry(entity),
      };
    } catch (e) {
      return null;
    }
  }, [entity]);

  const currentTab = OUTPUT_TABS.find((t) => t.key === outputTab)!;

  function selectScenario(index: number) {
    setActiveScenario(index);
    setJson(JSON.stringify(API_ENTITY_SCENARIOS[index].entity, null, 2));
  }

  function toggleCategory(cat: Category) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Left sidebar: entity list ── */}
      <div
        style={{
          width: '220px',
          flexShrink: 0,
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: '12px 12px 8px',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#64748b',
            }}
          >
            Entities
          </span>
        </div>

        {/* Entity list grouped by category */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0 16px' }}>
          {SCENARIO_GROUPS.map((group) => {
            const collapsed = collapsedCategories.has(group.category);
            return (
              <div key={group.category}>
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(group.category)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    width: '100%',
                    padding: '8px 12px 4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#64748b',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '8px', marginTop: '1px' }}>{collapsed ? '▶' : '▼'}</span>
                  {group.label}
                </button>

                {/* Items */}
                {!collapsed && group.scenarios.map((scenario) => {
                  const isSelected = activeScenario === scenario.index;
                  return (
                    <button
                      key={scenario.label}
                      onClick={() => selectScenario(scenario.index)}
                      title={scenario.description}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '5px 12px 5px 20px',
                        background: isSelected ? '#eff6ff' : 'none',
                        border: 'none',
                        borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: isSelected ? '#1e40af' : '#374151',
                        textAlign: 'left',
                        fontWeight: isSelected ? 500 : 400,
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
      </div>

      {/* ── Center: JSON editor ── */}
      <div
        style={{
          width: '380px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#64748b',
            }}
          >
            Entity Definition
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>JSON</span>
        </div>
        <JsonEditor value={json} onChange={setJson} error={parseError} />
      </div>

      {/* ── Right: output tabs ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Tab bar */}
        <div className="shrink-0 flex border-b border-gray-200 px-2 pt-1 gap-0.5 overflow-x-auto">
          {OUTPUT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setOutputTab(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors whitespace-nowrap ${
                outputTab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="shrink-0 px-3 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-xs text-blue-700">{currentTab.description}</p>
        </div>

        {/* Output */}
        {parseError ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-sm text-red-500">Fix the JSON error to see derived output.</p>
          </div>
        ) : entity && derived ? (
          <div className="flex-1 overflow-y-auto p-4">
            {outputTab === 'overview' && <EntityOverviewTab entity={entity} />}
            {outputTab === 'api-explorer' && <ApiExplorerPanel entity={entity} />}
            {outputTab === 'create-fields' && <CreateFieldsTab fields={derived.createFields} />}
            {outputTab === 'edit-fields' && <EditFieldsTab fields={derived.editFields} />}
            {outputTab === 'scope-registry' && <ScopeRegistryTab scopes={derived.scopes} />}
            {outputTab === 'relations' && <RelationDiagramTab entity={entity} />}
          </div>
        ) : null}
      </div>
    </div>
  );
}
