import { CELL_SCHEMA_CATALOG } from '@ikary/cell-contract';
import type { SchemaCategory, SchemaCatalogEntry } from '@ikary/cell-contract';
import { CATEGORIES, CATEGORY_DESCRIPTIONS } from '../../lib/schemaCatalogConfig';

interface SchemaSidebarPanelProps {
  schemas: readonly SchemaCatalogEntry[];
  selectedSchema: SchemaCatalogEntry;
  onSelect: (e: SchemaCatalogEntry) => void;
  search: string;
  onSearchChange: (v: string) => void;
  category: SchemaCategory | 'all';
  onCategoryChange: (c: SchemaCategory | 'all') => void;
}

export function SchemaSidebarPanel({
  schemas,
  selectedSchema,
  onSelect,
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: SchemaSidebarPanelProps) {
  return (
    <aside className="w-72 shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search schemas…"
          className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onCategoryChange(c)}
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

      {schemas.length === 0 && (
        <p className="p-4 text-sm text-gray-400 dark:text-gray-500">No schemas match.</p>
      )}

      <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {schemas.map((e) => (
          <li key={e.name}>
            <button
              onClick={() => onSelect(e)}
              className={`w-full text-left px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                selectedSchema.name === e.name ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div
                className={`text-sm font-medium truncate ${
                  selectedSchema.name === e.name
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-800 dark:text-gray-200'
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
        {schemas.length} of {CELL_SCHEMA_CATALOG.length} schemas
      </div>
    </aside>
  );
}
