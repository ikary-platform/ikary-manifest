import { FieldControl } from '../../form/field-control';
import type { ManifestRuntimeEntity } from '../../manifest/selectors';
import { useEntityCreateSheetForm } from './hooks/useEntityCreateSheetForm';

interface EntityCreateFormContentProps {
  entity: ManifestRuntimeEntity;
  onOpenChange: (open: boolean) => void;
}

/**
 * Private inner form — only mounted when the sheet is open.
 * Mount/unmount acts as the reset mechanism; no useEffect needed.
 */
export function EntityCreateFormContent({ entity, onOpenChange }: EntityCreateFormContentProps) {
  const { createFields, register, submitForm, errors, isSubmitting } = useEntityCreateSheetForm({
    entity,
    onOpenChange,
  });

  return (
    <form onSubmit={submitForm} className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {createFields.map((field) => (
          <FieldControl key={field.key} field={field} register={register} error={errors[field.key]} />
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 text-sm border border-border rounded text-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating…' : `Create ${entity.name}`}
        </button>
      </div>
    </form>
  );
}
