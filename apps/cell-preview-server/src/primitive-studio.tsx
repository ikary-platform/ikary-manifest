import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { listPrimitives } from '@ikary/cell-primitives';
import { PrimitiveStudio } from '@ikary/cell-primitive-studio/ui';
import type { PrimitiveCatalogEntry } from '@ikary/cell-primitive-studio';

function toLabel(key: string): string {
  return key
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function PreviewPrimitiveStudio() {
  const navigate = useNavigate();

  const catalog: PrimitiveCatalogEntry[] = useMemo(
    () =>
      listPrimitives()
        .filter((def) => def.source === 'custom')
        .map((def) => ({
          key: def.name,
          label: def.label ?? toLabel(def.name),
          category: (def.category as PrimitiveCatalogEntry['category']) ?? 'custom',
          version: def.version,
          source: 'custom' as const,
          isController: def.isController ?? false,
        })),
    [],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          <ArrowLeft size={14} />
          Back to Preview
        </button>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Primitive Studio</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PrimitiveStudio catalog={catalog} scenariosByKey={{}} initialKey={null} />
      </div>
    </div>
  );
}
