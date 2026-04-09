import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { listPrimitives } from '@ikary/cell-runtime-ui';
import '@ikary/cell-runtime-ui/registry';
import { PrimitiveStudio } from '@ikary/primitive-studio/ui';
import type { ScenarioDefinition } from '@ikary/primitive-studio/ui';
import type { PrimitiveCatalogEntry } from '@ikary/primitive-studio';
import { PRIMITIVE_DEMOS } from './primitive-demos';

// Category mapping for core primitives
const PRIMITIVE_CATEGORIES: Record<string, PrimitiveCatalogEntry['category']> = {
  'list-page': 'data',
  'data-grid': 'data',
  'card-list': 'data',
  'metric-card': 'data',
  'activity-feed': 'data',
  pagination: 'data',
  'page-header': 'layout',
  'detail-page': 'data',
  'dashboard-page': 'layout',
  'detail-section': 'data',
  'detail-item': 'data',
  'empty-state': 'feedback',
  'loading-state': 'feedback',
  'error-state': 'feedback',
  'field-value': 'feedback',
  'filter-bar': 'navigation',
  'bulk-command-bar': 'navigation',
  tabs: 'navigation',
  input: 'form',
  textarea: 'form',
  select: 'form',
  checkbox: 'form',
  'radio-group': 'form',
  toggle: 'form',
  'date-input': 'form',
  'form-field': 'form',
  'form-section': 'form',
  form: 'form',
  'form-relation-field': 'form',
};

interface PrimitiveStudioPageProps {
  primitiveKey?: string | null;
  backPath?: string;
}

export function PrimitiveStudioPage({ primitiveKey, backPath }: PrimitiveStudioPageProps) {
  const navigate = useNavigate();

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

  // Convert PRIMITIVE_DEMOS to ScenarioDefinition[] keyed by primitive name
  const scenariosByKey: Record<string, ScenarioDefinition[]> = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(PRIMITIVE_DEMOS).map(([key, demo]) => [
          key,
          [
            {
              label: demo.label,
              description: demo.description,
              props: demo.props,
              runtime: demo.runtime,
            },
          ],
        ]),
      ),
    [],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {backPath && (
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
            onClick={() => navigate(backPath)}
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
            Back
          </button>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Primitive Studio</span>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PrimitiveStudio
          catalog={catalog}
          scenariosByKey={scenariosByKey}
          initialKey={primitiveKey ?? null}
        />
      </div>
    </div>
  );
}

function toLabel(key: string): string {
  return key
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
