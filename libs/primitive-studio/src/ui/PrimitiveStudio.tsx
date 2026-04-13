import { useState, useEffect } from 'react';
import { PrimitiveSidebar } from './components/PrimitiveSidebar';
import { PropsEditor } from './components/PropsEditor';
import type { ContractField } from './components/PropsEditor';
import { PrimitivePreview } from './components/PrimitivePreview';
import { usePropsEditorState } from './hooks/usePropsEditorState';
import type { PrimitiveCatalogEntry } from '../shared/catalog';
import type { ScenarioDefinition } from './components/ScenarioTabs';

export interface PrimitiveStudioProps {
  catalog: PrimitiveCatalogEntry[];
  /**
   * Map from primitive key → scenario list. If omitted, the editor starts empty.
   * Pass primitive-specific examples here (e.g. from each primitive's .example.ts).
   */
  scenariosByKey?: Record<string, ScenarioDefinition[]>;
  /**
   * Map from primitive key → contract field list.
   * When provided, a CONTRACT SCHEMA panel is rendered below the editors.
   */
  contractFieldsByKey?: Record<string, ContractField[]>;
  /** Initially selected primitive key */
  initialKey?: string | null;
  /**
   * Called whenever the user selects a different primitive.
   * Use this to sync the URL so browser navigation and reload work correctly.
   */
  onSelectPrimitive?: (key: string) => void;
}

export function PrimitiveStudio({ catalog, scenariosByKey = {}, contractFieldsByKey = {}, initialKey = null, onSelectPrimitive }: PrimitiveStudioProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(initialKey);

  function handleSelectPrimitive(key: string) {
    setSelectedKey(key);
    onSelectPrimitive?.(key);
  }
  const [activeScenario, setActiveScenario] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);

  const scenarios = selectedKey ? (scenariosByKey[selectedKey] ?? []) : [];

  const initialProps = scenarios[0]?.props ?? {};
  const initialRuntime = scenarios[0]?.runtime ?? {};

  const [propsState, onPropsChange, setProps] = usePropsEditorState<unknown>(initialProps);
  const [runtimeState, onRuntimeChange, setRuntime] = usePropsEditorState<unknown>(initialRuntime);

  // When selected primitive changes: reset to first scenario
  useEffect(() => {
    setActiveScenario(0);
    setSelectedVersion(undefined);
    const firstScenario = (selectedKey && scenariosByKey[selectedKey]?.[0]) ?? null;
    if (firstScenario) {
      setProps(firstScenario.props);
      setRuntime(firstScenario.runtime ?? {});
    } else {
      setProps({});
      setRuntime({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  // When scenario changes: load its props/runtime
  function handleScenarioSelect(index: number) {
    setActiveScenario(index);
    const scenario = scenarios[index];
    if (scenario) {
      setProps(scenario.props);
      setRuntime(scenario.runtime ?? {});
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '13px',
        backgroundColor: 'hsl(var(--muted))',
        overflow: 'hidden',
      }}
    >
      {/* Left: primitive list */}
      <PrimitiveSidebar
        entries={catalog}
        selectedKey={selectedKey}
        onSelect={handleSelectPrimitive}
      />

      {/* Center: props editor */}
      <PropsEditor
        propsState={propsState}
        runtimeState={runtimeState}
        onPropsChange={onPropsChange}
        onRuntimeChange={onRuntimeChange}
        scenarios={scenarios}
        activeScenario={activeScenario}
        onScenarioSelect={handleScenarioSelect}
        contractFields={selectedKey ? contractFieldsByKey[selectedKey] : undefined}
      />

      {/* Right: live preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedKey && (
          <PrimitivePreviewToolbar
            primitiveKey={selectedKey}
            version={selectedVersion}
            catalog={catalog}
            onVersionChange={setSelectedVersion}
          />
        )}
        <PrimitivePreview
          primitiveKey={selectedKey}
          version={selectedVersion}
          props={propsState.error ? propsState.live : propsState.live}
          runtime={runtimeState.error ? runtimeState.live : runtimeState.live}
        />
      </div>
    </div>
  );
}

interface PrimitivePreviewToolbarProps {
  primitiveKey: string;
  version?: string;
  catalog: PrimitiveCatalogEntry[];
  onVersionChange: (v: string | undefined) => void;
}

function PrimitivePreviewToolbar({
  primitiveKey,
  version,
  catalog,
  onVersionChange,
}: PrimitivePreviewToolbarProps) {
  const entry = catalog.find((e) => e.key === primitiveKey);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--muted))',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
          {entry?.label ?? primitiveKey}
        </span>
        {entry?.source === 'custom' && (
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '10px',
              backgroundColor: 'rgba(251,191,36,0.15)',
              color: '#fcd34d',
              border: '1px solid rgba(251,191,36,0.4)',
            }}
          >
            Custom
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Version:</label>
        <select
          value={version ?? 'latest'}
          onChange={(e) =>
            onVersionChange(e.target.value === 'latest' ? undefined : e.target.value)
          }
          style={{
            fontSize: '11px',
            padding: '2px 6px',
            border: '1px solid hsl(var(--border))',
            borderRadius: '4px',
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
          }}
        >
          <option value="latest">latest</option>
          {entry?.version && entry.version !== 'latest' && (
            <option value={entry.version}>{entry.version}</option>
          )}
        </select>
      </div>
    </div>
  );
}
