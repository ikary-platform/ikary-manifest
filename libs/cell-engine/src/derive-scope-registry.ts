import type { CellManifestV1, EntityDefinition } from '@ikary/cell-contract';

function deriveCapabilityScope(
  entityKey: string,
  capability: NonNullable<EntityDefinition['capabilities']>[number],
): string {
  switch (capability.scope) {
    case 'global':
      return `global.${capability.key}`;
    case 'entity':
    case 'selection':
    case undefined:
      return `${entityKey}.${capability.key}`;
  }
}

export function deriveEntityScopeRegistry(entity: EntityDefinition): string[] {
  const key = entity.key;
  const scopes: string[] = [
    `${key}.view`,
    `${key}.list`,
    `${key}.read`,
    `${key}.create`,
    `${key}.update`,
    `${key}.delete`,
  ];

  for (const transition of entity.lifecycle?.transitions ?? []) {
    scopes.push(`${key}.${transition.key}`);
  }

  for (const capability of entity.capabilities ?? []) {
    scopes.push(deriveCapabilityScope(key, capability));
  }

  return [...new Set(scopes)];
}

export function deriveManifestScopeRegistry(manifest: CellManifestV1): string[] {
  const entities = manifest.spec.entities ?? [];
  const scopes = entities.flatMap((entity) => deriveEntityScopeRegistry(entity));
  return [...new Set(scopes)];
}
