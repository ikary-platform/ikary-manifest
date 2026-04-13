import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
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
  /**
   * Optional custom renderer for the Contract Props editor.
   * Receives the current value, an onChange handler, and the selected primitive key.
   * When provided, replaces the default textarea with a custom editor (e.g. Monaco).
   */
  renderContractEditor?: (p: { value: string; onChange: (v: string) => void; primitiveKey: string | null }) => ReactNode;
  /**
   * When true, the built-in primitives sidebar is not rendered.
   * Use this when the sidebar is provided externally (e.g. in a global layout sidebar).
   */
  hideSidebar?: boolean;
}

// ── Resize hook (inline — avoids a lib dep on a shared hook file) ──────────

function useResizablePanel(initialWidth: number, min = 180, max = 600) {
  const [width, setWidth] = useState(initialWidth);
  const widthRef = useRef(initialWidth);
  widthRef.current = width;

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      const startX = e.clientX;
      const startWidth = widthRef.current;
      const onMove = (ev: MouseEvent) => {
        setWidth(Math.max(min, Math.min(max, startWidth + (ev.clientX - startX))));
      };
      const onUp = () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [min, max],
  );

  return { width, startDrag };
}

// ── Drag divider (inline) ────────────────────────────────────────────────

function ResizeDivider({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        width: '4px',
        flexShrink: 0,
        cursor: 'col-resize',
        background: 'transparent',
        borderLeft: '1px solid hsl(var(--border))',
        transition: 'background 0.1s',
        position: 'relative',
        zIndex: 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'hsl(var(--accent))'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    />
  );
}

// ── Inline SVG icons (avoids lucide-react dep in the lib) ───────────────

function IconMaximize() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 4.5V1h3.5M7.5 1H11v3.5M11 7.5V11H7.5M4.5 11H1V7.5" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3.5L1.5 6 4 8.5M8 3.5L10.5 6 8 8.5M6.5 2l-1 8" />
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────────────

export function PrimitiveStudio({ catalog, scenariosByKey = {}, contractFieldsByKey = {}, initialKey = null, onSelectPrimitive, renderContractEditor, hideSidebar = false }: PrimitiveStudioProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(initialKey);

  useEffect(() => {
    if (initialKey !== undefined && initialKey !== null) {
      setSelectedKey(initialKey);
    }
  }, [initialKey]);

  function handleSelectPrimitive(key: string) {
    setSelectedKey(key);
    onSelectPrimitive?.(key);
  }
  const [activeScenario, setActiveScenario] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);

  const scenarios = selectedKey ? (scenariosByKey[selectedKey] ?? []) : [];

  const initialProps = scenarios[0]?.props ?? {};
  const initialRuntime = scenarios[0]?.runtime ?? {};

  const [propsCollapsed, setPropsCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const { width: propsWidth, startDrag } = useResizablePanel(320);

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

  const panelsHidden = fullscreen || propsCollapsed;

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
      {/* Left: primitive list (hidden in fullscreen or when hideSidebar is true) */}
      {!hideSidebar && (
        <div
          style={{
            width: fullscreen ? '0' : '220px',
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.2s ease',
          }}
        >
          <PrimitiveSidebar
            entries={catalog}
            selectedKey={selectedKey}
            onSelect={handleSelectPrimitive}
          />
        </div>
      )}

      {/* Center: props editor (collapsible + resizable) */}
      <div
        style={{
          width: panelsHidden ? '0' : `${propsWidth}px`,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PropsEditor
          propsState={propsState}
          runtimeState={runtimeState}
          onPropsChange={onPropsChange}
          onRuntimeChange={onRuntimeChange}
          scenarios={scenarios}
          activeScenario={activeScenario}
          onScenarioSelect={handleScenarioSelect}
          contractFields={selectedKey ? contractFieldsByKey[selectedKey] : undefined}
          renderContractEditor={
            renderContractEditor
              ? (p) => renderContractEditor({ ...p, primitiveKey: selectedKey })
              : undefined
          }
        />
      </div>

      {/* Drag divider — only shown when props panel is visible */}
      {!panelsHidden && <ResizeDivider onMouseDown={startDrag} />}

      {/* Right: live preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <PrimitivePreviewToolbar
          primitiveKey={selectedKey}
          version={selectedVersion}
          catalog={catalog}
          onVersionChange={setSelectedVersion}
          propsCollapsed={propsCollapsed}
          onToggleProps={() => setPropsCollapsed((c) => !c)}
          fullscreen={fullscreen}
          onToggleFullscreen={() => {
            setFullscreen((f) => !f);
            if (!fullscreen) setPropsCollapsed(false);
          }}
        />
        <PrimitivePreview
          primitiveKey={selectedKey}
          version={selectedVersion}
          props={propsState.live}
          runtime={runtimeState.live}
        />
      </div>
    </div>
  );
}

interface PrimitivePreviewToolbarProps {
  primitiveKey: string | null;
  version?: string;
  catalog: PrimitiveCatalogEntry[];
  onVersionChange: (v: string | undefined) => void;
  propsCollapsed: boolean;
  onToggleProps: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}

const TOOLBAR_BTN: React.CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: '4px',
  border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--background))',
  cursor: 'pointer',
  color: 'hsl(var(--muted-foreground))',
  fontSize: '12px',
  lineHeight: 1,
};

function PrimitivePreviewToolbar({
  primitiveKey,
  version,
  catalog,
  onVersionChange,
  propsCollapsed,
  onToggleProps,
  fullscreen,
  onToggleFullscreen,
}: PrimitivePreviewToolbarProps) {
  const entry = primitiveKey ? catalog.find((e) => e.key === primitiveKey) : null;

  return (
    <div
      style={{
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--muted))',
        flexShrink: 0,
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Props panel toggle — hidden when in fullscreen */}
        {!fullscreen && (
          <button
            onClick={onToggleProps}
            title={propsCollapsed ? 'Show props editor' : 'Hide props editor'}
            style={TOOLBAR_BTN}
          >
            {propsCollapsed ? '›' : '‹'}
          </button>
        )}

        {/* Fullscreen / code toggle */}
        <button
          onClick={onToggleFullscreen}
          title={fullscreen ? 'Back to split view' : 'Preview only'}
          style={TOOLBAR_BTN}
        >
          {fullscreen ? <IconCode /> : <IconMaximize />}
        </button>

        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          Preview
        </span>
        {entry && (
          <>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
              {entry.label}
            </span>
            {entry.source === 'custom' && (
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
          </>
        )}
        {!entry && (
          <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
            Select a primitive to preview.
          </span>
        )}
      </div>

      {entry && (
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
            {entry.version && entry.version !== 'latest' && (
              <option value={entry.version}>{entry.version}</option>
            )}
          </select>
        </div>
      )}
    </div>
  );
}
