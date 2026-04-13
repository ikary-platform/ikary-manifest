import { useState } from 'react';
import { JsonEditor } from '../components/JsonEditor';
import { AppPreview } from '../components/app-runtime/AppPreview';
import { APP_MANIFEST_SCENARIOS, MANIFEST_CATEGORY_LABELS, MANIFEST_CATEGORY_ORDER } from '../data/app-manifest-loader';
import type { AppManifestScenario } from '../data/app-manifest-loader';

type Category = AppManifestScenario['category'];

function groupScenarios() {
  return MANIFEST_CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: MANIFEST_CATEGORY_LABELS[cat],
    scenarios: APP_MANIFEST_SCENARIOS.map((s, i) => ({ ...s, index: i })).filter((s) => s.category === cat),
  }));
}

const SCENARIO_GROUPS = groupScenarios();

export function AppRuntimeSection() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<Category>>(new Set());
  const [json, setJson] = useState(() => JSON.stringify(APP_MANIFEST_SCENARIOS[0].manifest, null, 2));

  const parseError = (() => {
    try {
      JSON.parse(json);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  })();

  function selectScenario(index: number) {
    setActiveScenario(index);
    setJson(JSON.stringify(APP_MANIFEST_SCENARIOS[index].manifest, null, 2));
  }

  function toggleCategory(cat: Category) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const [jsonCollapsed, setJsonCollapsed] = useState(false);

  const activeLabel = APP_MANIFEST_SCENARIOS[activeScenario]?.label ?? '';

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Left sidebar: manifest list ── */}
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
            Manifests
          </span>
        </div>

        {/* Manifest list grouped by category */}
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

      {/* ── Center: JSON editor (collapsible) ── */}
      <div
        style={{
          width: jsonCollapsed ? '0' : '380px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: jsonCollapsed ? 'none' : '1px solid #e2e8f0',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
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
            minWidth: '380px',
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, marginRight: '6px' }}>
            {activeLabel}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>CellManifestV1</span>
        </div>
        <div style={{ flex: 1, minWidth: '380px', overflow: 'hidden' }}>
          <JsonEditor value={json} onChange={setJson} error={parseError} />
        </div>
      </div>

      {/* ── Right: app preview ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            gap: '8px',
          }}
        >
          {/* JSON panel toggle — lives here so it's always reachable */}
          <button
            onClick={() => setJsonCollapsed((c) => !c)}
            title={jsonCollapsed ? 'Show JSON editor' : 'Hide JSON editor'}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '12px',
              lineHeight: 1,
            }}
          >
            {jsonCollapsed ? '›' : '‹'}
          </button>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#64748b',
            }}
          >
            Preview
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Select a manifest or edit JSON directly.
          </span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <AppPreview json={json} />
        </div>
      </div>
    </div>
  );
}
