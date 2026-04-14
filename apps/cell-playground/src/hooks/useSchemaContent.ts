import { useQuery } from '@tanstack/react-query';
import type { SchemaCatalogEntry } from '@ikary/cell-contract';

const RAW_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '/repo'
    : 'https://raw.githubusercontent.com/ikary-platform/ikary-manifest/main';

async function fetchText(path: string): Promise<string> {
  const res = await fetch(`${RAW_BASE}/${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export function useSchemaContent(selected: SchemaCatalogEntry) {
  const { data: yamlContent, isLoading: yamlLoading, isError: yamlError } = useQuery({
    queryKey: ['yaml', selected.yamlPath],
    queryFn: () => fetchText(selected.yamlPath!),
    enabled: !!selected.yamlPath,
    staleTime: Infinity,
  });

  const { data: docContent, isLoading: docLoading, isError: docError } = useQuery({
    queryKey: ['doc', selected.docPath],
    queryFn: () => fetchText(selected.docPath!),
    enabled: !!selected.docPath,
    staleTime: Infinity,
  });

  return { yamlContent, yamlLoading, yamlError, docContent, docLoading, docError };
}
