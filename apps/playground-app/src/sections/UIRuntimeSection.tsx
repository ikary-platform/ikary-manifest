import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listPrimitives } from '@ikary/primitives';
import '@ikary/primitives/registry';
import { PrimitiveStudio } from '@ikary/primitive-studio/ui';
import type { ScenarioDefinition, ContractField } from '@ikary/primitive-studio/ui';
import type { PrimitiveCatalogEntry } from '@ikary/primitive-studio';
import { PRIMITIVE_DEMOS } from '../data/primitive-demos';
import { SCHEMA_BY_CONTRACT_TYPE } from '../data/schema-by-contract-type';
import { PRIMITIVE_CATEGORIES } from '../data/primitive-categories';
import { extractContractFields } from '../lib/schema-introspection';

export function UIRuntimeSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const primitiveKey = searchParams.get('primitive');

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PrimitiveStudio
        catalog={catalog}
        scenariosByKey={scenariosByKey}
        contractFieldsByKey={contractFieldsByKey}
        initialKey={primitiveKey}
        onSelectPrimitive={(key) => setSearchParams({ primitive: key }, { replace: true })}
      />
    </div>
  );
}

function toLabel(key: string): string {
  return key
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}
