import type { CellManifestV1, ValidationError } from '../shared/types';

const ENTITY_BOUND_PAGE_TYPES = new Set(['entity-list', 'entity-detail', 'entity-create', 'entity-edit']);
const CANONICAL_ENTITY_PAGE_TYPES = ['entity-list', 'entity-detail', 'entity-create', 'entity-edit'] as const;

export function validatePageRules(manifest: CellManifestV1): ValidationError[] {
  const errors: ValidationError[] = [];
  const pages = manifest.spec.pages ?? [];
  const entities = manifest.spec.entities ?? [];

  const pageKeySet = new Set<string>();
  const entityKeySet = new Set<string>();

  for (const page of pages) {
    pageKeySet.add(page.key);
  }

  for (const entity of entities) {
    entityKeySet.add(entity.key);
  }

  const pageKeys = pages.map((page) => page.key);
  const duplicatePageKeys = pageKeys.filter((key, index) => pageKeys.indexOf(key) !== index);
  for (const key of new Set(duplicatePageKeys)) {
    errors.push({ field: 'spec.pages', message: `Duplicate page key: "${key}"` });
  }

  const entityKeys = entities.map((entity) => entity.key);
  const duplicateEntityKeys = entityKeys.filter((key, index) => entityKeys.indexOf(key) !== index);
  for (const key of new Set(duplicateEntityKeys)) {
    errors.push({ field: 'spec.entities', message: `Duplicate entity key: "${key}"` });
  }

  const pagePaths = pages.map((page) => page.path);
  const duplicatePaths = pagePaths.filter((path, index) => pagePaths.indexOf(path) !== index);
  for (const path of new Set(duplicatePaths)) {
    errors.push({ field: 'spec.pages', message: `Duplicate page path: "${path}"` });
  }

  for (const page of pages) {
    if (!page.path.startsWith('/')) {
      errors.push({
        field: `spec.pages[${page.key}].path`,
        message: `Page path must start with "/": "${page.path}"`,
      });
    }
  }

  const landingPage = manifest.spec.mount.landingPage;
  if (!pageKeySet.has(landingPage)) {
    errors.push({
      field: 'spec.mount.landingPage',
      message: `landingPage "${landingPage}" does not reference a valid page key`,
    });
  }

  for (const page of pages) {
    if (!ENTITY_BOUND_PAGE_TYPES.has(page.type)) {
      continue;
    }

    if (!page.entity) {
      errors.push({
        field: `spec.pages[${page.key}].entity`,
        message: `Page type "${page.type}" requires an entity key`,
      });
      continue;
    }

    if (!entityKeySet.has(page.entity)) {
      errors.push({
        field: `spec.pages[${page.key}].entity`,
        message: `Page references unknown entity key: "${page.entity}"`,
      });
    }
  }

  for (const pageType of CANONICAL_ENTITY_PAGE_TYPES) {
    const byEntity = new Map<string, string[]>();

    for (const page of pages) {
      if (page.type !== pageType || !page.entity) {
        continue;
      }

      const keys = byEntity.get(page.entity) ?? [];
      keys.push(page.key);
      byEntity.set(page.entity, keys);
    }

    for (const [entityKey, keys] of byEntity) {
      if (keys.length <= 1) {
        continue;
      }

      errors.push({
        field: 'spec.pages',
        message: `Entity "${entityKey}" has ${keys.length} "${pageType}" pages (${keys.join(', ')}). Only one is allowed per entity.`,
      });
    }
  }

  return errors;
}
