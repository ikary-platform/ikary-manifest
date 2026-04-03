import type { CellManifestV1, ValidationError } from '../shared/types';

export function validateRoleRules(manifest: CellManifestV1): ValidationError[] {
  const roles = manifest.spec.roles ?? [];
  if (roles.length === 0) {
    return [];
  }

  const errors: ValidationError[] = [];
  const roleKeys = new Set<string>();

  for (const role of roles) {
    if (roleKeys.has(role.key)) {
      errors.push({ field: 'spec.roles', message: `Duplicate role key: "${role.key}"` });
    }
    roleKeys.add(role.key);

    if (role.scopes.length === 0) {
      errors.push({
        field: `spec.roles[${role.key}]`,
        message: `Role "${role.key}" must declare at least one scope`,
      });
    }
  }

  return errors;
}
