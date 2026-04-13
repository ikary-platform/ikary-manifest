import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ResolvedCreateField } from '@ikary/cell-engine';
import { buildCreateZodSchema, FieldControl } from '@ikary/cell-renderer';

interface PlaygroundEditFormProps {
  fields: ResolvedCreateField[];
}

function deriveFakeDefaults(fields: ResolvedCreateField[]): Record<string, unknown> {
  const today = new Date().toISOString().split('T')[0];
  return Object.fromEntries(
    fields.map((f) => {
      switch (f.type) {
        case 'boolean':
          return [f.key, false];
        case 'number':
          return [f.key, 42];
        case 'enum':
          return [f.key, f.enumValues?.[0] ?? ''];
        case 'date':
          return [f.key, today];
        case 'datetime':
          return [f.key, `${today}T12:00`];
        case 'text':
          return [f.key, 'Sample note for this field.'];
        default: {
          const hasEmailRule = f.effectiveFieldRules.some((r) => r.type === 'email');
          return [f.key, hasEmailRule ? 'user@example.com' : 'Sample text'];
        }
      }
    }),
  );
}

export function PlaygroundEditForm({ fields }: PlaygroundEditFormProps) {
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const zodSchema = useMemo(() => buildCreateZodSchema(fields), [fields]);

  const defaultValues = useMemo(() => deriveFakeDefaults(fields), [fields]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  // Reset the form with fresh fake defaults whenever the entity changes so that
  // switching entities in the sidebar always shows pre-populated data for the
  // newly selected entity rather than stale values from the previous one.
  useEffect(() => {
    setSubmittedData(null);
    reset(defaultValues);
  }, [defaultValues, reset]);

  function onSubmit(data: Record<string, unknown>) {
    setSubmittedData(data);
  }

  function handleEdit() {
    setSubmittedData(null);
    reset(defaultValues);
  }

  if (fields.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-400">No edit fields derived from this entity.</p>
      </div>
    );
  }

  if (submittedData) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-sm font-medium text-green-800">Changes saved (simulated)</p>
          <p className="text-xs text-green-700 mt-0.5">
            The form passed all validation rules. In a live app this payload would be sent to the
            API.
          </p>
        </div>
        <pre className="rounded-md bg-gray-900 text-gray-100 text-xs p-4 overflow-x-auto">
          {JSON.stringify(submittedData, null, 2)}
        </pre>
        <button
          type="button"
          onClick={handleEdit}
          className="text-xs text-blue-600 hover:underline"
        >
          Edit form
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4"
    >
      {fields.map((field) => (
        <FieldControl
          key={field.key}
          field={field}
          register={register}
          error={errors[field.key] as any}
        />
      ))}
      <div className="pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}
