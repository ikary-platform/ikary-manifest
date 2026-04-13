import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CELL_SCHEMA_CATALOG } from '@ikary/cell-contract';
import type { SchemaCategory, SchemaCatalogEntry } from '@ikary/cell-contract';
import { SchemaDependencyGraphWorkspace } from '../components/contracts/SchemaDependencyGraph';

const GITHUB_BLOB = 'https://github.com/ikary-platform/ikary-manifest/blob/main';
const RAW_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '/repo'
    : 'https://raw.githubusercontent.com/ikary-platform/ikary-manifest/main';

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
  all: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  entity: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  manifest: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  policy: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  presentation: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  validation: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  validation_issue: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
};

const CATEGORY_DESCRIPTIONS: Record<SchemaCategory | 'all', string> = {
  all: 'Show all schema categories',
  entity: 'Core business object schemas: fields, relations, computed values, lifecycle, and events',
  manifest: 'Top-level manifest schemas: cell envelope, spec, app shell, mount, capabilities, navigation, and pages',
  policy: 'Access control schemas: scopes, action policies, entity policies, field policies, and roles',
  presentation: 'Display and rendering schemas for field presentation configuration',
  validation: 'Validation rule schemas declared in manifests: field rules, entity invariants, and server validators',
  validation_issue: 'Validation output schemas produced at runtime: issue shape, scope, severity, and API error envelopes',
};

type DetailTab = 'documentation' | 'metadata';
type SectionView = 'schemas' | 'dependencies';

export function ContractsSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const viewParam = searchParams.get('view') as SectionView | null;
  const sectionView: SectionView = viewParam === 'dependencies' ? 'dependencies' : 'schemas';

  const categoryParam = searchParams.get('category') as SchemaCategory | 'all' | null;
  const category: SchemaCategory | 'all' = categoryParam && CATEGORIES.includes(categoryParam) ? categoryParam : 'all';

  const schemaParam = searchParams.get('schema');
  const selected: SchemaCatalogEntry = (schemaParam && CELL_SCHEMA_CATALOG.find((e) => e.name === schemaParam)) || CELL_SCHEMA_CATALOG[0];

  const tabParam = searchParams.get('tab') as DetailTab | null;
  const detailTab: DetailTab = tabParam === 'metadata' ? 'metadata' : 'documentation';

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === undefined) next.delete(k);
        else next.set(k, v);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setSectionView = (v: SectionView) => updateParams({ view: v === 'schemas' ? null : v });
  const setCategory = (c: SchemaCategory | 'all') => updateParams({ category: c === 'all' ? null : c });
  const setSelected = (e: SchemaCatalogEntry) => updateParams({ schema: e.name });
  const setDetailTab = (t: DetailTab) => updateParams({ tab: t === 'documentation' ? null : t });

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

  const { data: docContent, isLoading: docLoading, isError: docError } = useQuery({
    queryKey: ['doc', selected.docPath],
    queryFn: async () => {
      const res = await fetch(`${RAW_BASE}/${selected.docPath}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    },
    enabled: !!selected.docPath,
    staleTime: Infinity,
  });

  const filtered = CELL_SCHEMA_CATALOG.filter(
    (e) =>
      (category === 'all' || e.category === category) &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.summary.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="flex flex-col h-full">
      {/* View toggle strip */}
      <div className="shrink-0 flex gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        {(['schemas', 'dependencies'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setSectionView(v)}
            className={`px-3 py-1 text-xs font-medium rounded capitalize ${
              sectionView === v
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {sectionView === 'dependencies' && (
        <div className="flex-1 overflow-auto p-4">
          <SchemaDependencyGraphWorkspace />
        </div>
      )}

      {sectionView === 'schemas' && (
      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemas…"
            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              title={CATEGORY_DESCRIPTIONS[c]}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                category === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="p-4 text-sm text-gray-400 dark:text-gray-500">No schemas match.</p>
        )}

        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((e) => (
            <li key={e.name}>
              <button
                onClick={() => setSelected(e)}
                className={`w-full text-left px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selected.name === e.name ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div
                  className={`text-sm font-medium truncate ${
                    selected.name === e.name ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {e.name}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{e.category}</div>
              </button>
            </li>
          ))}
        </ul>

        <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
          {filtered.length} of {CELL_SCHEMA_CATALOG.length} schemas
        </div>
      </aside>

      {/* Detail panel */}
      <article className="flex-1 flex flex-col overflow-hidden">
        {/* Header — always visible */}
        <div className="shrink-0 px-6 pt-6 pb-4">
          <div className="max-w-2xl">
            <div className="flex items-start gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex-1">{selected.name}</h2>
              <span
                title={CATEGORY_DESCRIPTIONS[selected.category]}
                className={`shrink-0 mt-0.5 inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide cursor-help ${
                  CATEGORY_COLORS[selected.category]
                }`}
              >
                {selected.category}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selected.summary}</p>
          </div>

          {/* Tab bar */}
          <div className="mt-4 flex gap-4 border-b border-gray-200 dark:border-gray-700">
            {(['documentation', 'metadata'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDetailTab(t)}
                className={`pb-2 text-sm font-medium capitalize transition-colors ${
                  detailTab === t
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="max-w-2xl">
            {detailTab === 'documentation' && (
              <>
                {selected.docPath ? (
                  <div className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                    {docLoading && (
                      <p className="p-3 text-xs text-gray-400 dark:text-gray-500">Loading...</p>
                    )}
                    {docError && (
                      <p className="p-3 text-xs text-red-500">Failed to load documentation.</p>
                    )}
                    {docContent && (
                      <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
                        <Markdown remarkPlugins={[remarkGfm]}>{docContent}</Markdown>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
                    No documentation available for this schema.
                  </p>
                )}
              </>
            )}

            {detailTab === 'metadata' && (
              <>
                <h3 className="mt-4 mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Purpose
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selected.purpose}</p>

                {selected.references.length > 0 && (
                  <>
                    <h3 className="mt-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
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
                            className="text-sm text-blue-600 dark:text-blue-400 font-mono hover:underline text-left"
                          >
                            {r}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <h3 className="mt-6 mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  TypeScript Source
                </h3>
                <a
                  href={`${GITHUB_BLOB}/libs/cell-contract/${selected.sourcePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 font-mono hover:underline break-all"
                >
                  {selected.sourcePath}
                </a>

                {selected.yamlPath && (
                  <>
                    <h3 className="mt-6 mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      YAML Schema
                    </h3>
                    <a
                      href={`${GITHUB_BLOB}/${selected.yamlPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 font-mono hover:underline break-all"
                    >
                      {selected.yamlPath}
                    </a>
                    <div className="mt-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-96">
                      {yamlLoading && (
                        <p className="p-3 text-xs text-gray-400 dark:text-gray-500">Loading…</p>
                      )}
                      {yamlError && (
                        <p className="p-3 text-xs text-red-500">Failed to load YAML.</p>
                      )}
                      {yamlContent && (
                        <pre className="p-3 text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre">{yamlContent}</pre>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </article>
      </div>
      )}
    </div>
  );
}
