import type { PresentationLayer } from '../contract/manifest/PresentationLayerSchema';
import type { ValidationError } from '../shared/types';
import { validateNavigationRules } from './navigation-rules';

const ENTITY_BOUND_TYPES = new Set(['entity-list', 'entity-detail', 'entity-create', 'entity-edit']);

export interface PresentationSemanticContext {
  entityKeys?: string[];
}

export function validatePresentationLayerSemantics(
  layer: PresentationLayer,
  context?: PresentationSemanticContext,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const pages = layer.pages ?? [];
  const pageKeySet = new Set(pages.map((p) => p.key));
  const entityKeySet = new Set(context?.entityKeys ?? []);

  // mount.landingPage must reference an existing page (if pages defined and mount present)
  if (layer.mount && pages.length > 0 && !pageKeySet.has(layer.mount.landingPage)) {
    errors.push({
      field: 'mount.landingPage',
      message: `landingPage "${layer.mount.landingPage}" does not reference a valid page key`,
    });
  }

  for (const page of pages) {
    if (!ENTITY_BOUND_TYPES.has(page.type)) continue;
    if (!page.entity) {
      errors.push({
        field: `pages[${page.key}].entity`,
        message: `Page type "${page.type}" requires an entity key`,
      });
      continue;
    }
    if (entityKeySet.size > 0 && !entityKeySet.has(page.entity)) {
      errors.push({
        field: `pages[${page.key}].entity`,
        message: `Page references unknown entity key: "${page.entity}". Available: ${[...entityKeySet].join(', ')}`,
      });
    }
  }

  // Reuse existing nav validator
  if (layer.navigation) {
    errors.push(...validateNavigationRules(layer.navigation.items ?? [], pageKeySet));
  }

  return errors;
}
