import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CELL_SCHEMA_CATALOG } from '@ikary/cell-contract';
import type { SchemaCategory, SchemaCatalogEntry } from '@ikary/cell-contract';
import { CATEGORIES } from '../lib/schemaCatalogConfig';

type SectionView = 'schemas' | 'dependencies';

export function useSchemaBrowser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const viewParam = searchParams.get('view') as SectionView | null;
  const sectionView: SectionView = viewParam === 'dependencies' ? 'dependencies' : 'schemas';

  const categoryParam = searchParams.get('category') as SchemaCategory | 'all' | null;
  const category: SchemaCategory | 'all' = categoryParam && CATEGORIES.includes(categoryParam) ? categoryParam : 'all';

  const schemaParam = searchParams.get('schema');
  const selected: SchemaCatalogEntry =
    (schemaParam && CELL_SCHEMA_CATALOG.find((e) => e.name === schemaParam)) || CELL_SCHEMA_CATALOG[0];

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(updates)) {
            if (v === null || v === undefined) next.delete(k);
            else next.set(k, v);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handleSelect = useCallback(
    (e: SchemaCatalogEntry) => updateParams({ schema: e.name }),
    [updateParams],
  );

  return {
    searchParams,
    setSearchParams,
    search,
    setSearch,
    sectionView,
    category,
    selected,
    handleSelect,
    updateParams,
  };
}
