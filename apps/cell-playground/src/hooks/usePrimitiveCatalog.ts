import { useMemo } from 'react';
import { listPrimitives } from '@ikary/cell-primitives';
import type { ScenarioDefinition, ContractField } from '@ikary/cell-primitive-studio/ui';
import type { PrimitiveCatalogEntry } from '@ikary/cell-primitive-studio';
import { PRIMITIVE_DEMOS } from '../data/primitive-demos';
import { SCHEMA_BY_CONTRACT_TYPE } from '../data/schema-by-contract-type';
import { PRIMITIVE_CATEGORIES } from '../data/primitive-categories';
import { extractContractFields } from '../lib/schema-introspection';
import { toLabel } from '../lib/primitiveUtils';

export function usePrimitiveCatalog() {
  const allPrimitives = useMemo(() => listPrimitives(), []);

  const catalog: PrimitiveCatalogEntry[] = useMemo(
    () =>
      allPrimitives.map((def) => ({
        key: def.name,
        label: toLabel(def.name),
        category: PRIMITIVE_CATEGORIES[def.name] ?? 'custom',
        version: def.version,
        source: def.source ?? 'core',
        isController: def.isController,
      })),
    [allPrimitives],
  );

  const scenariosByKey: Record<string, ScenarioDefinition[]> = useMemo(
    () => Object.fromEntries(Object.entries(PRIMITIVE_DEMOS).map(([key, entry]) => [key, entry.scenarios])),
    [],
  );

  const contractFieldsByKey: Record<string, ContractField[]> = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(PRIMITIVE_DEMOS)
          .map(([key, entry]) => {
            const schema = SCHEMA_BY_CONTRACT_TYPE[entry.contractType];
            if (!schema) return null;
            const fields = extractContractFields(schema);
            return fields.length > 0 ? [key, fields] : null;
          })
          .filter((e): e is [string, ContractField[]] => e !== null),
      ),
    [],
  );

  return { catalog, scenariosByKey, contractFieldsByKey };
}
