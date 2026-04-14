import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CELL_SCHEMA_CATALOG } from '@ikary/cell-contract';
import type { SchemaCatalogEntry } from '@ikary/cell-contract';
import { CATEGORY_COLORS, CATEGORY_DESCRIPTIONS } from '../../lib/schemaCatalogConfig';

const GITHUB_BLOB = 'https://github.com/ikary-platform/ikary-manifest/blob/main';

export type DetailTab = 'documentation' | 'metadata';

interface SchemaDetailPanelProps {
  selected: SchemaCatalogEntry;
  detailTab: DetailTab;
  onDetailTabChange: (t: DetailTab) => void;
  docContent: string | undefined;
  yamlContent: string | undefined;
  isLoading: boolean;
  isDocError: boolean;
  isYamlError: boolean;
  onSelectByName: (name: string) => void;
}

export function SchemaDetailPanel({
  selected,
  detailTab,
  onDetailTabChange,
  docContent,
  yamlContent,
  isLoading,
  isDocError,
  isYamlError,
  onSelectByName,
}: SchemaDetailPanelProps) {
  return (
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
              onClick={() => onDetailTabChange(t)}
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
                  {isLoading && (
                    <p className="p-3 text-xs text-gray-400 dark:text-gray-500">Loading...</p>
                  )}
                  {isDocError && (
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
                            if (found) onSelectByName(r);
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
                    {isLoading && (
                      <p className="p-3 text-xs text-gray-400 dark:text-gray-500">Loading…</p>
                    )}
                    {isYamlError && (
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
  );
}
