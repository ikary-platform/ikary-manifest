import { useMemo } from 'react';
import { deriveCreateFields, deriveEditFields, deriveEntityScopeRegistry } from '@ikary/cell-engine';
import type { EntityDefinition, FieldDefinition } from '@ikary/cell-contract';

export function useEntityDerivedData(json: string) {
  const { entity, parseError } = useMemo(() => {
    try {
      return { entity: JSON.parse(json) as EntityDefinition, parseError: null };
    } catch (e) {
      return { entity: null, parseError: String(e) };
    }
  }, [json]);

  const derived = useMemo(() => {
    if (!entity) return null;
    try {
      const fields = (entity.fields ?? []) as FieldDefinition[];
      return {
        createFields: deriveCreateFields(fields),
        editFields: deriveEditFields(fields),
        scopes: deriveEntityScopeRegistry(entity),
      };
    } catch {
      return null;
    }
  }, [entity]);

  return {
    entity,
    parseError,
    derived,
    createFields: derived?.createFields ?? null,
    editFields: derived?.editFields ?? null,
    scopes: derived?.scopes ?? null,
  };
}
