import { useParams, useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import type { FieldError } from 'react-hook-form';
import type { NavigateFunction } from 'react-router-dom';
import type { CellManifestV1, PageDefinition } from '@ikary/contract';
import type { ResolvedCreateField } from '@ikary/engine';
import { buildEntityDetailPath, buildEntityListPath } from '@ikary/engine';
import { buildCreateZodSchema } from '../form/build-create-zod-schema';
import { FieldControl } from '../form/field-control';
import { useCellManifest, useCellRuntime } from '../context/cell-runtime-context';
import type { CellPageRendererProps } from '../registry/cell-component-registry';
import type { CellDataStore } from '../store/cell-data-store';
import { resolveManifestEntity } from '../manifest/selectors';
import { useEntityEditForm } from './hooks/useEntityEditForm';

export function EntityEditPage({ page, entity }: CellPageRendererProps) {
  const { dataStore } = useCellRuntime();
  const manifest = useCellManifest();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!entity) {
    return <div className="p-4 text-destructive">No entity configured for this page.</div>;
  }

  const resolvedEntity = resolveManifestEntity(manifest, entity.key);
  if (!resolvedEntity) {
    return <div className="p-4 text-destructive">No resolved entity configured for this page.</div>;
  }

  const record = id ? dataStore.getOne(resolvedEntity.key, id) : undefined;

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground mb-3">
          {resolvedEntity.name} not found{id ? ` (id: ${id})` : ''}.
        </p>
        <button
          onClick={() => {
            const listPath = buildEntityListPath(manifest, resolvedEntity.key);
            if (listPath) navigate(listPath);
          }}
          className="text-sm text-primary hover:underline"
        >
          &larr; Back to {resolvedEntity.pluralName}
        </button>
      </div>
    );
  }

  const editFields = resolvedEntity.editFields;
  const zodSchema = buildCreateZodSchema(editFields);

  const defaultValues = Object.fromEntries(
    editFields.map((f) => [f.key, record[f.key] ?? (f.type === 'boolean' ? false : '')]),
  );

  return (
    <EditForm
      manifest={manifest}
      page={page}
      entityKey={resolvedEntity.key}
      entityName={resolvedEntity.name}
      entityPluralName={resolvedEntity.pluralName}
      recordId={String(id)}
      defaultValues={defaultValues}
      zodSchema={zodSchema}
      editFields={editFields}
      dataStore={dataStore}
      navigate={navigate}
    />
  );
}

interface EditFormProps {
  manifest: CellManifestV1;
  page: PageDefinition;
  entityKey: string;
  entityName: string;
  entityPluralName: string;
  recordId: string;
  defaultValues: Record<string, any>;
  zodSchema: z.ZodObject<any>;
  editFields: ResolvedCreateField[];
  dataStore: CellDataStore;
  navigate: NavigateFunction;
}

function EditForm({
  manifest,
  page,
  entityKey,
  entityName,
  entityPluralName,
  recordId,
  defaultValues,
  zodSchema,
  editFields,
  dataStore,
  navigate,
}: EditFormProps) {
  const { register, submitForm, errors, isSubmitting, isDirty, listPath, detailPath } = useEntityEditForm({
    manifest,
    entityKey,
    recordId,
    defaultValues,
    zodSchema,
    dataStore,
    navigate,
  });

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        {(detailPath || listPath) && (
          <button
            type="button"
            onClick={() => navigate(detailPath ?? listPath ?? '')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; {detailPath ? entityName : entityPluralName}
          </button>
        )}
        <h1 className="text-xl font-semibold">{page.title}</h1>
      </div>

      <form onSubmit={submitForm} className="space-y-4">
        {editFields.map((field) => (
          <FieldControl
            key={field.key}
            field={field}
            register={register}
            error={errors[field.key] as FieldError | undefined}
          />
        ))}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(detailPath ?? listPath ?? (-1 as unknown as string))}
            className="px-4 py-2 text-sm border border-border rounded hover:bg-muted text-foreground"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
