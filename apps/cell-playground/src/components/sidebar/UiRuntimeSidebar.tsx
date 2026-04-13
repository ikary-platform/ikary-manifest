import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listPrimitives } from '@ikary/cell-primitives';
import '@ikary/cell-primitives/registry';
import { PrimitiveSidebar } from '@ikary/cell-primitive-studio/ui';
import type { PrimitiveCatalogEntry } from '@ikary/cell-primitive-studio';
import { PRIMITIVE_CATEGORIES } from '../../data/primitive-categories';

export function UiRuntimeSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedKey = searchParams.get('primitive');

  const allPrimitives = useMemo(() => listPrimitives(), []);
  const catalog: PrimitiveCatalogEntry[] = useMemo(
    () =>
      allPrimitives.map((def) => ({
        key: def.name,
        label: def.name.split(/[-_]/).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' '),
        category: PRIMITIVE_CATEGORIES[def.name] ?? 'custom',
        version: def.version,
        source: (def.source ?? 'core') as 'core' | 'custom',
        isController: def.isController,
      })),
    [allPrimitives],
  );

  return (
    <PrimitiveSidebar
      entries={catalog}
      selectedKey={selectedKey}
      onSelect={(key) => setSearchParams({ primitive: key }, { replace: true })}
    />
  );
}
