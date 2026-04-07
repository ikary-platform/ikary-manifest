import type { EntityDefinition } from '@ikary/contract';
import type { FieldError, UseFormReturn } from 'react-hook-form';
import { FieldControl } from '../form/field-control';
import { useCellManifest, useCellRuntime } from '../context/cell-runtime-context';
import type { DetailPageMode } from './use-detail-page-mode';
import { resolveManifestEntity } from '../manifest/selectors';
import { useOverviewTabForm } from './hooks/useOverviewTabForm';
import { useUIComponents } from '../UIComponentsProvider';

interface OverviewTabProps {
  entity: EntityDefinition;
  record: Record<string, unknown>;
  recordId: string;
  mode: DetailPageMode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

function formatFieldValue(value: unknown, type: string): string {
  if (value === undefined || value === null || value === '') return '\u2014';
  if (type === 'boolean') return value ? 'Yes' : 'No';
  if (type === 'datetime') {
    const d = new Date(String(value));
    return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  }
  if (type === 'date') {
    const d = new Date(String(value));
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
  return String(value);
}

export function OverviewTab({ entity, record, recordId, mode, form }: OverviewTabProps) {
  const { dataStore, dataMode } = useCellRuntime();
  const manifest = useCellManifest();
  const { toast } = useUIComponents();
  const resolvedEntity = resolveManifestEntity(manifest, entity.key);

  const editFields = resolvedEntity?.editFields ?? [];
  const { register, submitForm, errors, isDirty } = useOverviewTabForm({
    entity,
    record,
    recordId,
    mode,
    form,
    dataStore,
    dataMode,
    toast,
  });

  if (!resolvedEntity) {
    return <div className="px-6 py-5 text-sm text-destructive">No resolved entity available.</div>;
  }

  const displayFields = resolvedEntity.fields.filter((f) => !f.system);

  if (!mode.isEditing && mode.editState !== 'saving') {
    return (
      <div className="px-6 py-5">
        <div className="border rounded-lg divide-y border-border">
          {displayFields.map((field) => (
            <div key={field.key} className="flex items-start px-4 py-3 gap-4">
              <span className="w-40 shrink-0 text-sm font-medium text-muted-foreground">{field.name}</span>
              <span className="text-sm text-foreground break-all">
                {formatFieldValue(record[field.key], field.type)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-5 max-w-xl">
      <form onSubmit={submitForm} className="space-y-4">
        {editFields.map((field) => (
          <FieldControl
            key={field.key}
            field={field}
            register={register}
            error={errors[field.key] as FieldError | undefined}
          />
        ))}

        {mode.editState === 'error' && <p className="text-sm text-destructive">{mode.saveError}</p>}

        <div className="flex gap-2 pt-2 border-t border-border">
          <button
            type="submit"
            disabled={mode.isSaving || !isDirty}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {mode.isSaving ? 'Saving\u2026' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={mode.cancelEdit}
            disabled={mode.isSaving}
            className="px-4 py-2 text-sm border border-border rounded text-foreground hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
