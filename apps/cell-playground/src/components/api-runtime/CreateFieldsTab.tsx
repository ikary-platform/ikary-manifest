import { useState } from 'react';
import type { ResolvedCreateField } from '@ikary/cell-engine';
import { FieldsTable } from './FieldsTable';
import { PlaygroundCreateForm } from './PlaygroundCreateForm';

type SubTab = 'fields' | 'try-it';

interface CreateFieldsTabProps {
  fields: ResolvedCreateField[];
}

export function CreateFieldsTab({ fields }: CreateFieldsTabProps) {
  const [subTab, setSubTab] = useState<SubTab>('fields');

  return (
    <div className="space-y-3">
      {/* Sub-tab bar */}
      <div className="flex gap-1 border-b border-gray-200 -mx-4 px-4">
        {(['fields', 'try-it'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              subTab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'fields' ? 'Fields' : 'Try it'}
          </button>
        ))}
      </div>

      {subTab === 'fields' ? (
        fields.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No create fields derived from this entity.
            </p>
          </div>
        ) : (
          <FieldsTable fields={fields} mode="create" />
        )
      ) : (
        <PlaygroundCreateForm fields={fields} />
      )}
    </div>
  );
}
