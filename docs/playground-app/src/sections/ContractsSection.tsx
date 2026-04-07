import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CELL_SCHEMA_CATALOG } from '@ikary-manifest/contract';
import type { SchemaCategory, SchemaCatalogEntry } from '@ikary-manifest/contract';

const GITHUB_BLOB = 'https://github.com/ikary-platform/ikary-manifest/blob/main';
const RAW_BASE = 'https://raw.githubusercontent.com/ikary-platform/ikary-manifest/main';

const CATEGORIES: Array<SchemaCategory | 'all'> = [
  'all',
  'entity',
  'manifest',
  'policy',
  'presentation',
  'validation',
  'validation_issue',
];

const CATEGORY_COLORS: Record<SchemaCategory | 'all', string> = {
  all: 'bg-gray-100 text-gray-600',
  entity: 'bg-blue-100 text-blue-700',
  manifest: 'bg-purple-100 text-purple-700',
  policy: 'bg-amber-100 text-amber-700',
  presentation: 'bg-green-100 text-green-700',
  validation: 'bg-red-100 text-red-700',
  validation_issue: 'bg-orange-100 text-orange-700',
};

export function ContractsSection() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<SchemaCategory | 'all'>('all');
  const [selected, setSelected] = useState<SchemaCatalogEntry>(CELL_SCHEMA_CATALOG[0]);

  const { data: yamlContent, isLoading: yamlLoading, isError: yamlError } = useQuery({
    queryKey: ['yaml', selected.yamlPath],
    queryFn: async () => {
      const res = await fetch(`${RAW_BASE}/${selected.yamlPath}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    },
    enabled: !!selected.yamlPath,
    staleTime: Infinity,
  });

  const filtered = CELL_SCHEMA_CATALOG.filter(
    (e) =>
      (category === 'all' || e.category === category) &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.summary.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 flex flex-col border-r border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contracts…"
            className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                category === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="p-4 text-sm text-gray-400">No contracts match.</p>
        )}

        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filtered.map((e) => (
            <li key={e.name}>
              <button
                onClick={() => setSelected(e)}
                className={`w-full text-left px-3 py-2.5 transition-colors hover:bg-gray-50 ${
                  selected.name === e.name ? 'bg-blue-50' : ''
                }`}
              >
                <div
                  className={`text-sm font-medium truncate ${
                    selected.name === e.name ? 'text-blue-700' : 'text-gray-800'
                  }`}
                >
                  {e.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{e.category}</div>
              </button>
            </li>
          ))}
        </ul>

        <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-400">
          {filtered.length} of {CELL_SCHEMA_CATALOG.length} contracts
        </div>
      </aside>

      {/* Detail panel */}
      <article className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl">
          <div className="flex items-start gap-3">
            <h2 className="text-xl font-semibold text-gray-900 flex-1">{selected.name}</h2>
            <span
              className={`shrink-0 mt-0.5 inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${
                CATEGORY_COLORS[selected.category]
              }`}
            >
              {selected.category}
            </span>
          </div>

          <p className="mt-4 text-sm text-gray-700 leading-relaxed">{selected.summary}</p>

          <h3 className="mt-6 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Purpose
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{selected.purpose}</p>

          {selected.references.length > 0 && (
            <>
              <h3 className="mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                References
              </h3>
              <ul className="space-y-1">
                {selected.references.map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => {
                        const found = CELL_SCHEMA_CATALOG.find((e) => e.name === r);
                        if (found) setSelected(found);
                      }}
                      className="text-sm text-blue-600 font-mono hover:underline text-left"
                    >
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h3 className="mt-6 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            TypeScript Source
          </h3>
          <a
            href={`${GITHUB_BLOB}/contracts/node/contract/${selected.sourcePath}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 font-mono hover:underline break-all"
          >
            {selected.sourcePath}
          </a>

          {selected.yamlPath && (
            <>
              <h3 className="mt-6 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                YAML Schema
              </h3>
              <a
                href={`${GITHUB_BLOB}/${selected.yamlPath}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 font-mono hover:underline break-all"
              >
                {selected.yamlPath}
              </a>
              <div className="mt-2 rounded border border-gray-200 bg-gray-50 overflow-auto max-h-96">
                {yamlLoading && (
                  <p className="p-3 text-xs text-gray-400">Loading…</p>
                )}
                {yamlError && (
                  <p className="p-3 text-xs text-red-500">Failed to load YAML.</p>
                )}
                {yamlContent && (
                  <pre className="p-3 text-xs font-mono text-gray-700 whitespace-pre">{yamlContent}</pre>
                )}
              </div>
            </>
          )}
        </div>
      </article>
    </div>
  );
}
