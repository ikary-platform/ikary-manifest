import type { FieldDefinition } from '@ikary/cell-contract';
import { useCellManifest } from '../context/cell-runtime-context';
import type { CellPageRendererProps } from '../registry/cell-component-registry';
import { resolveManifestEntity } from '../manifest/selectors';

function renderField(field: FieldDefinition): React.ReactNode {
  if (field.type === 'object') {
    return (
      <fieldset key={field.key} className="border border-border rounded p-3 space-y-3">
        <legend className="text-xs font-semibold px-1">{field.name}</legend>
        {(field.fields ?? []).map((child) => renderField(child))}
      </fieldset>
    );
  }

  return (
    <div key={field.key}>
      <label className="block text-sm font-medium text-foreground mb-1">
        {field.name}
        {field.validation?.fieldRules?.some((r) => r.type === 'required') && (
          <span className="text-destructive ml-1">*</span>
        )}
      </label>
      {field.type === 'text' ? (
        <textarea
          className="w-full border border-border rounded px-3 py-2 text-sm bg-background"
          rows={3}
          placeholder={field.form?.placeholder}
        />
      ) : field.type === 'enum' ? (
        <select className="w-full border border-border rounded px-3 py-2 text-sm bg-background">
          <option value="">Select...</option>
          {(field.enumValues ?? []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      ) : field.type === 'boolean' ? (
        <input type="checkbox" className="rounded" />
      ) : (
        <input
          type={
            field.type === 'number'
              ? 'number'
              : field.type === 'date'
                ? 'date'
                : field.type === 'datetime'
                  ? 'datetime-local'
                  : 'text'
          }
          className="w-full border border-border rounded px-3 py-2 text-sm bg-background"
          placeholder={field.form?.placeholder}
        />
      )}
    </div>
  );
}

export function EntityCreatePage({ page, entity }: CellPageRendererProps) {
  const manifest = useCellManifest();

  if (!entity) {
    return <div className="p-4 text-destructive">No entity configured for this page.</div>;
  }

  const resolvedEntity = resolveManifestEntity(manifest, entity.key);
  if (!resolvedEntity) {
    return <div className="p-4 text-destructive">No resolved entity configured for this page.</div>;
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-semibold mb-6">{page.title}</h1>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {resolvedEntity.formFields.map((field) => renderField(field))}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Create {resolvedEntity.name}
          </button>
          <button type="button" className="px-4 py-2 text-sm border border-border rounded hover:bg-muted">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
