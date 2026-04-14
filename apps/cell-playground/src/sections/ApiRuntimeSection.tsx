import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Columns2, Maximize2, Code2, Eye } from 'lucide-react';
import { deriveCreateFields, deriveEditFields, deriveEntityScopeRegistry } from '@ikary/cell-engine';
import { EntityDefinitionSchema } from '@ikary/cell-contract';
import type { EntityDefinition, FieldDefinition } from '@ikary/cell-contract';
import { MonacoJsonEditor } from '../components/MonacoJsonEditor';
import { ContractSchemaPanel } from '../components/ContractSchemaPanel';
import { extractContractFields } from '../lib/schema-introspection';
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

  const entityFields = useMemo(() => extractContractFields(EntityDefinitionSchema), []);

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Section toolbar ── */}
      <div className="ide-toolbar">
        <span className="ide-toolbar-label">API Runtime</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {viewMode === 'full' && (
            <button
              className="ide-action-btn"
              onClick={() => setFullContent((f) => f === 'preview' ? 'code' : 'preview')}
              title={fullContent === 'preview' ? 'Show JSON editor' : 'Show outputs'}
            >
              {fullContent === 'preview' ? <Code2 size={11} /> : <Eye size={11} />}
              {fullContent === 'preview' ? 'View Code' : 'View Preview'}
            </button>
          )}
          <div className="ide-seg">
            {(['split', 'full'] as const).map((mode) => (
              <button
                key={mode}
                className={`ide-seg-btn ${viewMode === mode ? 'ide-seg-btn--active' : 'ide-seg-btn--inactive'}`}
                onClick={() => { setViewMode(mode); if (mode === 'full') setFullContent('preview'); }}
                title={mode === 'split' ? 'Split view' : 'Full view'}
              >
                {mode === 'split' ? <Columns2 size={11} /> : <Maximize2 size={11} />}
                {mode === 'split' ? 'Split' : 'Full'}
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
            <div className="ide-panel-tab" style={{ minWidth: `${editorWidth}px` }}>
              <span className="ide-dot" />
              <span className="ide-filename">entity.json</span>
              <span className="ide-badge">EntityDefinition</span>
            </div>
            <MonacoJsonEditor
              value={json}
              onChange={setJson}
              error={parseError}
              schemaUrl={`${MCP_API_URL}/api/json-schema/entity`}
              modelUri="entity://active.json"
              minWidth={`${editorWidth}px`}
            />
            <ContractSchemaPanel fields={entityFields} />
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
            {/* Outputs panel — tab bar IS the panel header */}
            <div className="ide-output-tabs">
              {OUTPUT_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setOutputTab(t.key)}
                  title={t.description}
                  className={`ide-output-tab ${outputTab === t.key ? 'ide-output-tab--active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Description strip */}
            <div className="ide-tab-desc">
              {currentTab.description}
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
