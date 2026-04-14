import { useCallback } from 'react';
import type { SchemaCategory, SchemaCatalogEntry } from '@ikary/cell-contract';
import { CELL_SCHEMA_CATALOG } from '@ikary/cell-contract';
import { SchemaDependencyGraphWorkspace } from '../components/contracts/SchemaDependencyGraph';
import { SchemaSidebarPanel } from '../components/contracts/SchemaSidebarPanel';
import { SchemaDetailPanel } from '../components/contracts/SchemaDetailPanel';
import type { DetailTab } from '../components/contracts/SchemaDetailPanel';
import { useSchemaBrowser } from '../hooks/useSchemaBrowser';
import { useSchemaContent } from '../hooks/useSchemaContent';

export function ContractsSection() {
  const { searchParams, search, setSearch, sectionView, category, selected, handleSelect, updateParams } =
    useSchemaBrowser();

  const { yamlContent, yamlLoading, yamlError, docContent, docLoading, docError } = useSchemaContent(selected);

  const tabParam = searchParams.get('tab') as DetailTab | null;
  const detailTab: DetailTab = tabParam === 'metadata' ? 'metadata' : 'documentation';

  const setCategory = (c: SchemaCategory | 'all') => updateParams({ category: c === 'all' ? null : c });
  const setDetailTab = (t: DetailTab) => updateParams({ tab: t === 'documentation' ? null : t });

  const handleSelectByName = useCallback(
    (name: string) => {
      const found = CELL_SCHEMA_CATALOG.find((e) => e.name === name);
      if (found) handleSelect(found);
    },
    [handleSelect],
  );

  const filtered = CELL_SCHEMA_CATALOG.filter(
    (e) =>
      (category === 'all' || e.category === category) &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.summary.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="flex flex-col h-full">
      {sectionView === 'dependencies' && (
        <div className="flex-1 overflow-auto p-4">
          <SchemaDependencyGraphWorkspace />
        </div>
      )}
      {sectionView === 'schemas' && (
        <div className="flex flex-1 overflow-hidden">
          <SchemaSidebarPanel
            schemas={filtered}
            selectedSchema={selected}
            onSelect={(e: SchemaCatalogEntry) => handleSelect(e)}
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
          />
          <SchemaDetailPanel
            selected={selected}
            detailTab={detailTab}
            onDetailTabChange={setDetailTab}
            docContent={docContent}
            yamlContent={yamlContent}
            isLoading={docLoading || yamlLoading}
            isDocError={docError}
            isYamlError={yamlError}
            onSelectByName={handleSelectByName}
          />
        </div>
      )}
    </div>
  );
}
