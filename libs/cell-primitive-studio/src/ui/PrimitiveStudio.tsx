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
   * Optional custom renderer for the Runtime Context editor.
   * Receives the current value and an onChange handler.
   * When provided, replaces the default textarea with a custom editor (e.g. Monaco).
   */
  renderRuntimeEditor?: (p: { value: string; onChange: (v: string) => void }) => ReactNode;
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

function IconColumns() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="4" height="10" rx="0.5" />
      <rect x="7" y="1" width="4" height="10" rx="0.5" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 4.5V1h3.5M7.5 1H11v3.5M11 7.5V11H7.5M4.5 11H1V7.5" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3L1 6l3 3M8 3l3 3-3 3" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6C1 6 3 2 6 2s5 4 5 4-2 4-5 4-5-4-5-4z" />
      <circle cx="6" cy="6" r="1.5" />
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────────────

export function PrimitiveStudio({ catalog, scenariosByKey = {}, contractFieldsByKey = {}, initialKey = null, onSelectPrimitive, renderContractEditor, renderRuntimeEditor, hideSidebar = false }: PrimitiveStudioProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(initialKey);

  useEffect(() => {
    if (initialKey !== undefined) {
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
  const [fullContent, setFullContent] = useState<'code' | 'preview'>('preview');
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

  const panelsHidden = propsCollapsed;

  const toolbarProps = {
    primitiveKey: selectedKey,
    version: selectedVersion,
    catalog,
    onVersionChange: setSelectedVersion,
    propsCollapsed,
    onToggleProps: () => setPropsCollapsed((c) => !c),
    fullscreen,
    fullContent,
    onToggleFullContent: () => setFullContent((c) => (c === 'preview' ? 'code' : 'preview')),
    onToggleFullscreen: () => {
      setFullscreen((f) => !f);
      setFullContent('preview');
      if (!fullscreen) setPropsCollapsed(false);
    },
  };

  // ── Fullscreen layout: toolbar spans full width, content below ──────────
  if (fullscreen) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: '13px',
          backgroundColor: 'hsl(var(--background))',
          overflow: 'hidden',
        }}
      >
        {/* Toolbar always visible — toggle is accessible regardless of fullContent */}
        <PrimitivePreviewToolbar {...toolbarProps} />
        {/* Content: code editor or live preview */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {fullContent === 'code' ? (
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
              renderRuntimeEditor={renderRuntimeEditor}
            />
          ) : (
            <PrimitivePreview
              primitiveKey={selectedKey}
              version={selectedVersion}
              props={propsState.live}
              runtime={runtimeState.live}
            />
          )}
        </div>
      </div>
    );
  }

  // ── Split layout: sidebar | props editor | divider | preview ────────────
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: '13px',
        backgroundColor: 'hsl(var(--background))',
        overflow: 'hidden',
      }}
    >
      {/* Left: primitive list */}
      {!hideSidebar && (
        <div style={{ width: '220px', flexShrink: 0, overflow: 'hidden' }}>
          <PrimitiveSidebar
            entries={catalog}
            selectedKey={selectedKey}
            onSelect={handleSelectPrimitive}
          />
        </div>
      )}

      {/* Center: props editor (collapsible + resizable) */}
      {!panelsHidden && (
        <div
          style={{
            width: `${propsWidth}px`,
            flexShrink: 0,
            overflow: 'hidden',
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
            renderRuntimeEditor={renderRuntimeEditor}
          />
        </div>
      )}

      {/* Drag divider */}
      {!panelsHidden && <ResizeDivider onMouseDown={startDrag} />}

      {/* Right: live preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <PrimitivePreviewToolbar {...toolbarProps} />
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
  fullContent: 'code' | 'preview';
  onToggleFullContent: () => void;
  onToggleFullscreen: () => void;
}

function PrimitivePreviewToolbar({
  primitiveKey,
  version,
  catalog,
  onVersionChange,
  propsCollapsed,
  onToggleProps,
  fullscreen,
  fullContent,
  onToggleFullContent,
  onToggleFullscreen,
}: PrimitivePreviewToolbarProps) {
  const entry = primitiveKey ? catalog.find((e) => e.key === primitiveKey) : null;
  const isFull = fullscreen || propsCollapsed;

  function handleSplit() {
    if (fullscreen) onToggleFullscreen();
    else if (propsCollapsed) onToggleProps();
  }
  function handleFull() {
    if (!isFull) onToggleFullscreen();
  }

  return (
    <div className="ide-panel-tab">
      {/* Left: indicator + label + badge */}
      <span className="ide-dot" />
      <span className="ide-filename" style={{ fontFamily: 'inherit' }}>
        {entry ? entry.label : 'Rendered Preview'}
      </span>
      {entry && (
        <span
          className="ide-badge"
          style={entry.source === 'custom'
            ? { background: 'rgba(217,119,6,0.1)', color: '#d97706', borderColor: 'rgba(217,119,6,0.25)' }
            : undefined}
        >
          {entry.source === 'custom' ? 'custom' : 'live'}
        </span>
      )}

      {/* Right-side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
        {/* View Code / View Preview toggle — only in fullscreen mode */}
        {fullscreen && (
          <button
            className="ide-action-btn"
            onClick={onToggleFullContent}
            title={fullContent === 'preview' ? 'Show JSON editor' : 'Show preview'}
          >
            {fullContent === 'preview' ? <IconCode /> : <IconEye />}
            {fullContent === 'preview' ? 'View Code' : 'View Preview'}
          </button>
        )}
        {/* Version selector */}
        {entry && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#62708c' }}>v</span>
            <select
              className="ide-version-select"
              value={version ?? 'latest'}
              onChange={(e) => onVersionChange(e.target.value === 'latest' ? undefined : e.target.value)}
            >
              <option value="latest">latest</option>
              {entry.version && entry.version !== 'latest' && (
                <option value={entry.version}>{entry.version}</option>
              )}
            </select>
          </div>
        )}
        {/* Split / Full segmented toggle */}
        <div className="ide-seg">
          <button
            className={`ide-seg-btn ${!isFull ? 'ide-seg-btn--active' : 'ide-seg-btn--inactive'}`}
            onClick={handleSplit}
            title="Split view — show props editor"
          >
            <IconColumns /> Split
          </button>
          <button
            className={`ide-seg-btn ${isFull ? 'ide-seg-btn--active' : 'ide-seg-btn--inactive'}`}
            onClick={handleFull}
            title="Full view — preview only"
          >
            <IconExpand /> Full
          </button>
        </div>
      </div>
    </div>
  );
}
