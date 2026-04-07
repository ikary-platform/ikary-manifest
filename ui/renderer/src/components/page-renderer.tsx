import type { PageDefinition } from '@ikary/contract';
import { useCellManifest, useCellRuntime } from '../context/cell-runtime-context';
import { findManifestEntity } from '../manifest/selectors';

interface PageRendererProps {
  page: PageDefinition;
}

export function PageRenderer({ page }: PageRendererProps) {
  const { registry } = useCellRuntime();
  const manifest = useCellManifest();

  let Component;
  try {
    Component = registry.resolve(page.type);
  } catch {
    return <div className="p-4 text-destructive text-sm">No renderer for page type: {page.type}</div>;
  }

  const entity = page.entity ? findManifestEntity(manifest, page.entity) : undefined;

  return <Component key={page.key} page={page} entity={entity} />;
}
