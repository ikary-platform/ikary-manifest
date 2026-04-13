import type { PageDefinition, FieldDefinition } from '@ikary/cell-contract';
import { buildEntityListPath } from '@ikary/cell-engine';
import { useAppRuntime, useAppStore, useAppEntity } from '../AppRuntimeContext';

interface Props {
  page: PageDefinition;
  params: Record<string, string>;
}

export function EntityDetailPage({ page, params }: Props) {
  const { manifest, navigate } = useAppRuntime();
  const entityKey = page.entity!;
  const store = useAppStore(entityKey);
  const entity = useAppEntity(entityKey);
  const id = params.id ?? '';

  const record = store?.getById(id);
  const data = record?.status === 200 ? (record.body as { data: Record<string, unknown> }).data : null;

  const listPath = buildEntityListPath(manifest, entityKey);

  const handleBack = () => {
    if (listPath) navigate(listPath);
  };

  const handleDelete = () => {
    if (!store || !data) return;
    store.delete(data.id as string);
    handleBack();
  };

  if (!entity) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Entity not found.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">Record not found.</p>
        <button onClick={handleBack} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Back to list
        </button>
      </div>
    );
  }

  const fields = entity.fields ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {entity.name}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {String(data[fields[0]?.key] ?? data.id)}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-xs font-medium px-3 py-1.5 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Fields */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
        {fields.map((field) => (
          <div key={field.key} className="flex px-4 py-3 gap-4">
            <dt className="w-40 shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
              {field.name}
            </dt>
            <dd className="text-xs text-gray-900 dark:text-gray-100 min-w-0">
              <DetailValue field={field} value={data[field.key]} />
            </dd>
          </div>
        ))}

        {Boolean(data.createdAt) && (
          <div className="flex px-4 py-3 gap-4">
            <dt className="w-40 shrink-0 text-xs font-medium text-gray-400">Created</dt>
            <dd className="text-xs text-gray-500">{new Date(data.createdAt as string).toLocaleString()}</dd>
          </div>
        )}
        {Boolean(data.updatedAt) && (
          <div className="flex px-4 py-3 gap-4">
            <dt className="w-40 shrink-0 text-xs font-medium text-gray-400">Updated</dt>
            <dd className="text-xs text-gray-500">{new Date(data.updatedAt as string).toLocaleString()}</dd>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailValue({ field, value }: { field: FieldDefinition; value: unknown }) {
  if (value == null) {
    return <span className="text-gray-300 dark:text-gray-600">&mdash;</span>;
  }

  if (field.type === 'boolean') {
    return <span>{value ? 'Yes' : 'No'}</span>;
  }

  if (field.type === 'enum') {
    return (
      <span className="inline-block px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-medium">
        {String(value)}
      </span>
    );
  }

  if (field.type === 'date') {
    try { return <span>{new Date(String(value)).toLocaleDateString()}</span>; }
    catch { return <span>{String(value)}</span>; }
  }

  if (field.type === 'datetime') {
    try { return <span>{new Date(String(value)).toLocaleString()}</span>; }
    catch { return <span>{String(value)}</span>; }
  }

  if (field.type === 'number') {
    const num = Number(value);
    if (/revenue|amount|price|cost/i.test(field.key)) {
      return <span>{num.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span>;
    }
    return <span>{num.toLocaleString()}</span>;
  }

  if (field.type === 'object') {
    return (
      <pre className="text-[10px] bg-gray-50 dark:bg-gray-800 rounded p-2 overflow-auto max-h-32">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="break-words">{String(value)}</span>;
}
