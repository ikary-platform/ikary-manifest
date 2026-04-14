import { useState, useEffect } from 'react';
import { Columns2, Maximize2, Code2, Eye } from 'lucide-react';
import { MonacoJsonEditor } from '../components/MonacoJsonEditor';
import { AppPreview } from '../components/app-runtime/AppPreview';
import { MCP_API_URL } from '../lib/config';
import { APP_MANIFEST_SCENARIOS } from '../data/app-manifest-loader';
import { useResizablePanel } from '../hooks/useResizablePanel';
import { ResizeDivider } from '../components/ResizeDivider';

interface AppRuntimeSectionProps {
  activeScenario: number;
}

type ViewMode = 'split' | 'full';
type FullContent = 'preview' | 'code';

const BTN_STYLE: React.CSSProperties = {
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

export function AppRuntimeSection({ activeScenario }: AppRuntimeSectionProps) {
  const [json, setJson] = useState(() => JSON.stringify(APP_MANIFEST_SCENARIOS[0].manifest, null, 2));
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [fullContent, setFullContent] = useState<FullContent>('preview');
  const { width: editorWidth, startDrag } = useResizablePanel(380);

  useEffect(() => {
    setJson(JSON.stringify(APP_MANIFEST_SCENARIOS[activeScenario].manifest, null, 2));
  }, [activeScenario]);

  const parseError = (() => {
    try {
      JSON.parse(json);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  })();

  const activeLabel = APP_MANIFEST_SCENARIOS[activeScenario]?.label ?? '';

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Section header bar — spans full width ── */}
      <div
        style={{
          height: '36px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: '1px solid hsl(var(--border))',
          background: 'hsl(var(--muted))',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'hsl(var(--muted-foreground))',
            flex: 1,
          }}
        >
          App Runtime
        </span>

        {/* Right-side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          {/* Full mode: View Code / View Preview */}
          {viewMode === 'full' && (
            <button
              onClick={() => setFullContent((f) => f === 'preview' ? 'code' : 'preview')}
              title={fullContent === 'preview' ? 'Show JSON editor' : 'Show preview'}
              style={{
                ...BTN_STYLE,
                width: 'auto',
                padding: '0 8px',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {fullContent === 'preview' ? <Code2 size={11} /> : <Eye size={11} />}
              {fullContent === 'preview' ? 'View Code' : 'View Preview'}
            </button>
          )}

          {/* Split / Full segmented toggle */}
          <div
            style={{
              display: 'flex',
              flexShrink: 0,
              border: '1px solid hsl(var(--border))',
              borderRadius: '5px',
              overflow: 'hidden',
            }}
          >
            {(['split', 'full'] as const).map((mode, i) => (
              <button
                key={mode}
                onClick={() => { setViewMode(mode); if (mode === 'full') setFullContent('preview'); }}
                title={mode === 'split' ? 'Split view' : 'Full view'}
                style={{
                  padding: '2px 10px',
                  border: 'none',
                  borderRight: i === 0 ? '1px solid hsl(var(--border))' : 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: viewMode === mode ? 600 : 400,
                  background: viewMode === mode ? '#3b82f6' : 'hsl(var(--background))',
                  color: viewMode === mode ? '#fff' : 'hsl(var(--muted-foreground))',
                  transition: 'background 0.1s, color 0.1s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {mode === 'split' ? <Columns2 size={11} /> : <Maximize2 size={11} />}
                  {mode === 'split' ? 'Split' : 'Full'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panels ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* CENTER: JSON editor
            - split mode: resizable panel
            - full-code: fills remaining space
            - full-preview: hidden */}
        {(viewMode === 'split' || fullContent === 'code') && (
          <div
            style={{
              width: viewMode === 'full' ? undefined : `${editorWidth}px`,
              flex: viewMode === 'full' ? 1 : undefined,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '36px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                borderBottom: '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted))',
                minWidth: `${editorWidth}px`,
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, marginRight: '6px' }}>
                {activeLabel}
              </span>
              <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap' }}>CellManifestV1</span>
            </div>
            <MonacoJsonEditor
              value={json}
              onChange={setJson}
              error={parseError}
              schemaUrl={`${MCP_API_URL}/api/json-schema/manifest`}
              modelUri="manifest://active.json"
              minWidth={`${editorWidth}px`}
            />
          </div>
        )}

        {/* Drag divider — only in split mode */}
        {viewMode === 'split' && <ResizeDivider onMouseDown={startDrag} />}

        {/* RIGHT: preview
            - split mode: flex-1
            - full-preview: fills remaining space
            - full-code: hidden */}
        {(viewMode === 'split' || fullContent === 'preview') && (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div
              style={{
                height: '36px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                borderBottom: '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted))',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' }}>
                Preview
              </span>
              <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
                Select a manifest or edit JSON directly.
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <AppPreview json={json} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
