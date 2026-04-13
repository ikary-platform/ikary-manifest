import { useState } from 'react';
import type { PageDefinition } from '@ikary/cell-contract';
import type { ResolvedCreateField } from '@ikary/cell-engine';
import { buildEntityListPath } from '@ikary/cell-engine';
import { useAppRuntime, useAppStore, useAppEntity } from '../AppRuntimeContext';

export function EntityCreatePage({ page }: { page: PageDefinition }) {
  const { manifest, navigate } = useAppRuntime();
  const entityKey = page.entity!;
  const store = useAppStore(entityKey);
  const entity = useAppEntity(entityKey);

  const isEdit = page.type === 'entity-edit';
  const fields = isEdit ? (entity?.editFields ?? []) : (entity?.createFields ?? []);

  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.type === 'boolean') initial[f.key] = false;
      else if (f.type === 'number') initial[f.key] = '';
      else initial[f.key] = (f as any).default ?? '';
    }
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const listPath = buildEntityListPath(manifest, entityKey);

  const handleBack = () => {
    if (listPath) navigate(listPath);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if ((field as any).required) {
        const v = values[field.key];
        if (v === '' || v === null || v === undefined) {
          newErrors[field.key] = `${field.name} is required`;
        }
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data: Record<string, unknown> = {};
    for (const field of fields) {
      const v = values[field.key];
      if (field.type === 'number' && v !== '' && v !== undefined) {
        data[field.key] = Number(v);
      } else if (field.type === 'boolean') {
        data[field.key] = Boolean(v);
      } else if (v !== '' && v !== undefined) {
        data[field.key] = v;
      }
    }

    store.create(data);
    handleBack();
  };

  if (!entity || !store) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Entity not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {isEdit ? `Edit ${entity.name}` : `New ${entity.name}`}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <FieldInput
            key={field.key}
            field={field}
            value={values[field.key]}
            error={errors[field.key]}
            onChange={(v) => {
              setValues((prev) => ({ ...prev, [field.key]: v }));
              setErrors((prev) => { const n = { ...prev }; delete n[field.key]; return n; });
            }}
          />
        ))}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="text-xs font-medium px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {isEdit ? 'Save' : 'Create'}
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="text-xs font-medium px-4 py-2 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: ResolvedCreateField;
  value: unknown;
  error?: string;
  onChange: (v: unknown) => void;
}) {
  const required = (field as any).required === true;
  const label = field.name;
  const id = `field-${field.key}`;

  const inputClasses = [
    'w-full text-xs px-2.5 py-2 rounded border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors',
    error
      ? 'border-red-300 dark:border-red-700'
      : 'border-gray-200 dark:border-gray-600',
  ].join(' ');

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {field.type === 'boolean' ? (
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          {label}
        </label>
      ) : field.type === 'enum' ? (
        <select
          id={id}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        >
          <option value="">Select...</option>
          {((field as any).enumValues ?? []).map((v: string | { key: string; label?: string }) => {
            const key = typeof v === 'object' ? v.key : v;
            const optLabel = typeof v === 'object' ? (v.label ?? v.key) : v;
            return <option key={key} value={key}>{optLabel}</option>;
          })}
        </select>
      ) : field.type === 'text' ? (
        <textarea
          id={id}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputClasses + ' resize-none'}
        />
      ) : field.type === 'number' ? (
        <input
          id={id}
          type="number"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      ) : field.type === 'date' ? (
        <input
          id={id}
          type="date"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      ) : field.type === 'datetime' ? (
        <input
          id={id}
          type="datetime-local"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={(field as any).placeholder ?? ''}
          className={inputClasses}
        />
      )}

      {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
