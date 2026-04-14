import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Columns2, Maximize2, Code2, Eye } from 'lucide-react';
import { deriveCreateFields, deriveEditFields, deriveEntityScopeRegistry } from '@ikary/cell-engine';
import type { EntityDefinition, FieldDefinition } from '@ikary/cell-contract';
import { MonacoJsonEditor } from '../components/MonacoJsonEditor';
import { MCP_API_URL } from '../lib/config';
import { API_ENTITY_SCENARIOS } from '../data/api-sample-entities';
import { EntityOverviewTab } from '../components/api-runtime/EntityOverviewTab';
import { ApiExplorerPanel } from '../components/api-explorer/ApiExplorerPanel';
import { CreateFieldsTab } from '../components/api-runtime/CreateFieldsTab';
import { EditFieldsTab } from '../components/api-runtime/EditFieldsTab';
import { ScopeRegistryTab } from '../components/api-runtime/ScopeRegistryTab';
import { RelationDiagramTab } from '../components/api-runtime/RelationDiagramTab';
import { useResizablePanel } from '../hooks/useResizablePanel';
import { ResizeDivider } from '../components/ResizeDivider';

interface ApiRuntimeSectionProps {
  activeScenario: number;
}

type OutputTab = 'overview' | 'api-explorer' | 'create-fields' | 'edit-fields' | 'scope-registry' | 'relations';
type ViewMode = 'split' | 'full';
type FullContent = 'preview' | 'code';

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

const BTN_STYLE: React.CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: '4px',
  border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--background))',
  cursor: 'pointer',
  color: 'hsl(var(--muted-foreground))',
  fontSize: '12px',
  lineHeight: 1,
};

export function ApiRuntimeSection({ activeScenario }: ApiRuntimeSectionProps) {
  const [json, setJson] = useState(() => JSON.stringify(API_ENTITY_SCENARIOS[0].entity, null, 2));
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [fullContent, setFullContent] = useState<FullContent>('preview');
  const [searchParams, setSearchParams] = useSearchParams();
  const { width: editorWidth, startDrag } = useResizablePanel(380);

  useEffect(() => {
    setJson(JSON.stringify(API_ENTITY_SCENARIOS[activeScenario].entity, null, 2));
  }, [activeScenario]);

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

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Section header bar — spans full width ── */}
      <div
        style={{
          height: '36px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: '1px solid hsl(var(--border))',
          background: 'hsl(var(--muted))',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'hsl(var(--muted-foreground))',
            flex: 1,
          }}
        >
          API Runtime
        </span>

        {/* Right-side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          {/* Full mode: View Code / View Preview */}
          {viewMode === 'full' && (
            <button
              onClick={() => setFullContent((f) => f === 'preview' ? 'code' : 'preview')}
              title={fullContent === 'preview' ? 'Show JSON editor' : 'Show outputs'}
              style={{
                ...BTN_STYLE,
                width: 'auto',
                padding: '0 8px',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {fullContent === 'preview' ? <Code2 size={11} /> : <Eye size={11} />}
              {fullContent === 'preview' ? 'View Code' : 'View Preview'}
            </button>
          )}

          {/* Split / Full segmented toggle */}
          <div
            style={{
              display: 'flex',
              flexShrink: 0,
              border: '1px solid hsl(var(--border))',
              borderRadius: '5px',
              overflow: 'hidden',
            }}
          >
            {(['split', 'full'] as const).map((mode, i) => (
              <button
                key={mode}
                onClick={() => { setViewMode(mode); if (mode === 'full') setFullContent('preview'); }}
                title={mode === 'split' ? 'Split view' : 'Full view'}
                style={{
                  padding: '2px 10px',
                  border: 'none',
                  borderRight: i === 0 ? '1px solid hsl(var(--border))' : 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: viewMode === mode ? 600 : 400,
                  background: viewMode === mode ? '#3b82f6' : 'hsl(var(--background))',
                  color: viewMode === mode ? '#fff' : 'hsl(var(--muted-foreground))',
                  transition: 'background 0.1s, color 0.1s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {mode === 'split' ? <Columns2 size={11} /> : <Maximize2 size={11} />}
                  {mode === 'split' ? 'Split' : 'Full'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panels ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* CENTER: JSON editor
            - split mode: resizable panel
            - full-code: fills remaining space
            - full-preview: not rendered */}
        {(viewMode === 'split' || fullContent === 'code') && (
          <div
            style={{
              width: viewMode === 'full' ? undefined : `${editorWidth}px`,
              flex: viewMode === 'full' ? 1 : undefined,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '36px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                borderBottom: '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted))',
                minWidth: `${editorWidth}px`,
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' }}>
                Entity Definition
              </span>
              <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>JSON</span>
            </div>
            <MonacoJsonEditor
              value={json}
              onChange={setJson}
              error={parseError}
              schemaUrl={`${MCP_API_URL}/api/json-schema/entity`}
              modelUri="entity://active.json"
              minWidth={`${editorWidth}px`}
            />
          </div>
        )}

        {/* Drag divider — only in split mode */}
        {viewMode === 'split' && <ResizeDivider onMouseDown={startDrag} />}

        {/* RIGHT: outputs panel
            - split mode: flex-1
            - full-preview: fills remaining space
            - full-code: not rendered */}
        {(viewMode === 'split' || fullContent === 'preview') && (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Panel header */}
            <div
              style={{
                height: '36px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                borderBottom: '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted))',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' }}>
                Outputs
              </span>
            </div>

            {/* Tab bar */}
            <div className="shrink-0 flex border-b border-gray-200 dark:border-gray-700 px-2 pt-1 gap-0.5 overflow-x-auto">
              {OUTPUT_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setOutputTab(t.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors whitespace-nowrap ${
                    outputTab === t.key
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="shrink-0 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900">
              <p className="text-xs text-blue-700 dark:text-blue-400">{currentTab.description}</p>
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
        )}
      </div>
    </div>
  );
}
