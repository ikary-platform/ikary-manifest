import { useState, useMemo } from 'react';
import { deriveCreateFields, deriveEditFields, deriveEntityScopeRegistry } from '@ikary-manifest/engine';
import type { EntityDefinition, FieldDefinition } from '@ikary-manifest/contract';
import { JsonEditor } from '../components/JsonEditor';
import { SAMPLE_ENTITY_JSON } from '../data/api-sample-entity';

type OutputTab = 'create-fields' | 'edit-fields' | 'scope-registry';

const OUTPUT_TABS: Array<{ key: OutputTab; label: string; description: string }> = [
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
  const [outputTab, setOutputTab] = useState<OutputTab>('create-fields');

  const { entity, parseError } = useMemo(() => {
    try {
      return { entity: JSON.parse(json) as EntityDefinition, parseError: null };
    } catch (e) {
      return { entity: null, parseError: String(e) };
    }
  }, [json]);

  const output = useMemo(() => {
    if (!entity) return null;
    try {
      switch (outputTab) {
        case 'create-fields':
          return deriveCreateFields((entity.fields ?? []) as FieldDefinition[]);
        case 'edit-fields':
          return deriveEditFields((entity.fields ?? []) as FieldDefinition[]);
        case 'scope-registry':
          return deriveEntityScopeRegistry(entity);
      }
    } catch (e) {
      return { error: String(e) };
    }
  }, [entity, outputTab]);

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

      {/* Right: derived output */}
      <div className="w-1/2 flex flex-col">
        {/* Tab bar */}
        <div className="shrink-0 flex border-b border-gray-200 px-2 pt-1 gap-0.5">
          {OUTPUT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setOutputTab(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors ${
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
        ) : (
          <pre className="flex-1 overflow-auto p-4 text-xs font-mono text-gray-800 bg-white leading-relaxed">
            {JSON.stringify(output, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
