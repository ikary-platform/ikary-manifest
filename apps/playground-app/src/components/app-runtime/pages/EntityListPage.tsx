import { useState, useMemo, useCallback } from 'react';
import type { PageDefinition, FieldDefinition } from '@ikary/contract';
import { buildEntityDetailPath, buildEntityCreatePath } from '@ikary/engine';
import { useAppRuntime, useAppStore, useAppEntity } from '../AppRuntimeContext';

const PAGE_SIZE = 10;

export function EntityListPage({ page }: { page: PageDefinition }) {
  const { manifest, navigate } = useAppRuntime();
  const entityKey = page.entity!;
  const store = useAppStore(entityKey);
  const entity = useAppEntity(entityKey);

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [, setTick] = useState(0);

  const listFields = useMemo(() => {
    if (!entity) return [];
    return entity.listFields.slice(0, 8);
  }, [entity]);

  const result = useMemo(() => {
    if (!store) return { data: [], total: 0, hasMore: false };
    const res = store.list({
      search: search || undefined,
      sortField: sortField ?? undefined,
      sortDir: sortDir,
      page: currentPage,
      pageSize: PAGE_SIZE,
    });
    return res.body as { data: Record<string, unknown>[]; total: number; hasMore: boolean };
  }, [store, search, sortField, sortDir, currentPage]);

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const handleRowClick = (record: Record<string, unknown>) => {
    const path = buildEntityDetailPath(manifest, entityKey, record.id as string);
    if (path) navigate(path);
  };

  const handleCreate = () => {
    const path = buildEntityCreatePath(manifest, entityKey);
    if (path) navigate(path);
  };

  if (!entity || !store) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Entity <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{entityKey}</code> not found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {page.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {result.total} record{result.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
          />
          <button
            onClick={handleCreate}
            className="text-xs font-medium px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            + New
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {listFields.map((field) => (
                <th
                  key={field.key}
                  onClick={() => handleSort(field.key)}
                  className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none whitespace-nowrap"
                >
                  {field.name}
                  {sortField === field.key && (
                    <span className="ml-1 text-blue-500">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={listFields.length} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                  {search ? 'No matching records.' : 'No records yet.'}
                </td>
              </tr>
            ) : (
              result.data.map((record) => (
                <tr
                  key={record.id as string}
                  onClick={() => handleRowClick(record)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  {listFields.map((field, i) => (
                    <td key={field.key} className="px-4 py-2.5 whitespace-nowrap">
                      <CellValue field={field} value={record[field.key]} isFirst={i === 0} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between px-6 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Prev
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CellValue({ field, value, isFirst }: { field: FieldDefinition; value: unknown; isFirst: boolean }) {
  if (value == null) {
    return <span className="text-gray-300 dark:text-gray-600">&mdash;</span>;
  }

  const text = String(value);

  if (field.type === 'boolean') {
    return (
      <span className={value ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
        {value ? 'Yes' : 'No'}
      </span>
    );
  }

  if (field.type === 'enum') {
    return (
      <span className="inline-block px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-medium">
        {text}
      </span>
    );
  }

  if (field.type === 'date') {
    try {
      return <span>{new Date(text).toLocaleDateString()}</span>;
    } catch { return <span>{text}</span>; }
  }

  if (field.type === 'datetime') {
    try {
      return <span>{new Date(text).toLocaleString()}</span>;
    } catch { return <span>{text}</span>; }
  }

  if (field.type === 'number') {
    const num = Number(value);
    if (/revenue|amount|price|cost/i.test(field.key)) {
      return <span>{num.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span>;
    }
    return <span>{num.toLocaleString()}</span>;
  }

  if (isFirst) {
    return <span className="font-medium text-blue-600 dark:text-blue-400">{text}</span>;
  }

  return <span className="text-gray-700 dark:text-gray-300 truncate max-w-xs block">{text}</span>;
}
