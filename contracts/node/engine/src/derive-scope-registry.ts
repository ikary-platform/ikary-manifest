import type { CellManifestV1, EntityDefinition } from '@ikary-manifest/contract';

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
    scopes.push(capability.scope ?? `${key}.${capability.key}`);
  }

  return [...new Set(scopes)];
}

export function deriveManifestScopeRegistry(manifest: CellManifestV1): string[] {
  const entities = manifest.spec.entities ?? [];
  const scopes = entities.flatMap((entity) => deriveEntityScopeRegistry(entity));
  return [...new Set(scopes)];
}
