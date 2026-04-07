import type { CellManifestV1 } from '@ikary/contract';
import type { PageDefinition, PageType } from '@ikary/contract';

function fillPathId(pathTemplate: string, recordId: string): string {
  return pathTemplate.replace(/:id\b/, encodeURIComponent(recordId));
}

function findEntityPage(manifest: CellManifestV1, entityKey: string, pageType: PageType): PageDefinition | undefined {
  return (manifest.spec.pages ?? []).find((page) => page.entity === entityKey && page.type === pageType);
}

export function buildEntityDetailPath(manifest: CellManifestV1, entityKey: string, recordId: string): string | null {
  const detailPage = findEntityPage(manifest, entityKey, 'entity-detail');
  if (!detailPage) return null;
  return fillPathId(detailPage.path, recordId);
}

export function buildEntityCreatePath(manifest: CellManifestV1, entityKey: string): string | null {
  return findEntityPage(manifest, entityKey, 'entity-create')?.path ?? null;
}

export function buildEntityEditPath(manifest: CellManifestV1, entityKey: string, recordId: string): string | null {
  const editPage = findEntityPage(manifest, entityKey, 'entity-edit');
  if (!editPage) return null;
  return fillPathId(editPage.path, recordId);
}

export function buildEntityListPath(manifest: CellManifestV1, entityKey: string): string | null {
  return findEntityPage(manifest, entityKey, 'entity-list')?.path ?? null;
}
