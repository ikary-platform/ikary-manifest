import type { CellManifestV1, ValidationError } from '../shared/types';
import { validateEntityRules } from './entity-rules';
import { validateNavigationRules } from './navigation-rules';
import { validatePageRules } from './page-rules';
import { validateRoleRules } from './role-rules';

export function validateManifestSemantics(manifest: CellManifestV1): ValidationError[] {
  const pageKeySet = new Set((manifest.spec.pages ?? []).map((page) => page.key));

  return [
    ...validatePageRules(manifest),
    ...validateNavigationRules(manifest.spec.navigation?.items ?? [], pageKeySet),
    ...validateEntityRules(manifest),
    ...validateRoleRules(manifest),
  ];
}

export function validateBusinessRules(manifest: CellManifestV1): ValidationError[] {
  return validateManifestSemantics(manifest);
}
