import { useState, useMemo } from 'react';
import { deriveCreateFields, deriveEditFields, deriveEntityScopeRegistry } from '@ikary-manifest/engine';
import type { EntityDefinition, FieldDefinition } from '@ikary-manifest/contract';
import { JsonEditor } from '../components/JsonEditor';
import { SAMPLE_ENTITY_JSON } from '../data/api-sample-entity';
import { EntityOverviewTab } from '../components/api-runtime/EntityOverviewTab';
import { ApiExplorerPanel } from '../components/api-explorer/ApiExplorerPanel';
import { CreateFieldsTab } from '../components/api-runtime/CreateFieldsTab';
import { EditFieldsTab } from '../components/api-runtime/EditFieldsTab';
import { ScopeRegistryTab } from '../components/api-runtime/ScopeRegistryTab';

type OutputTab = 'overview' | 'api-explorer' | 'create-fields' | 'edit-fields' | 'scope-registry';

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
];

export function ApiRuntimeSection() {
  const [json, setJson] = useState(SAMPLE_ENTITY_JSON);
  const [outputTab, setOutputTab] = useState<OutputTab>('overview');

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
    <div className="flex h-full">
      {/* Left: JSON editor */}
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Entity Definition
          </span>
          <span className="text-xs text-gray-400">EntityDefinition JSON</span>
        </div>
        <JsonEditor value={json} onChange={setJson} error={parseError} />
      </div>

      {/* Right: visual output */}
      <div className="w-1/2 flex flex-col">
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
