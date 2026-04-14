import { useState, useEffect, useMemo } from 'react';
import { Columns2, Maximize2, Code2, Eye } from 'lucide-react';
import { CellManifestV1Schema } from '@ikary/cell-contract';
import { MonacoJsonEditor } from '../components/MonacoJsonEditor';
import { ContractSchemaPanel } from '../components/ContractSchemaPanel';
import { AppPreview } from '../components/app-runtime/AppPreview';
import { MCP_API_URL } from '../lib/config';
import { APP_MANIFEST_SCENARIOS } from '../data/app-manifest-loader';
import { extractContractFields } from '../lib/schema-introspection';
import { SCHEMA_REGISTRY } from '../lib/schema-registry';
import { useResizablePanel } from '../hooks/useResizablePanel';
import { ResizeDivider } from '../components/ResizeDivider';

interface AppRuntimeSectionProps {
  activeScenario: number;
}

type ViewMode = 'split' | 'full';
type FullContent = 'preview' | 'code';


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

  const manifestFields = useMemo(() => extractContractFields(CellManifestV1Schema, SCHEMA_REGISTRY), []);

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Section toolbar ── */}
      <div className="ide-toolbar">
        <span className="ide-toolbar-label">App Runtime</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {viewMode === 'full' && (
            <button
              className="ide-action-btn"
              onClick={() => setFullContent((f) => f === 'preview' ? 'code' : 'preview')}
              title={fullContent === 'preview' ? 'Show JSON editor' : 'Show preview'}
            >
              {fullContent === 'preview' ? <Code2 size={11} /> : <Eye size={11} />}
              {fullContent === 'preview' ? 'View Code' : 'View Preview'}
            </button>
          )}
          <div className="ide-seg">
            {(['split', 'full'] as const).map((mode) => (
              <button
                key={mode}
                className={`ide-seg-btn ${viewMode === mode ? 'ide-seg-btn--active' : 'ide-seg-btn--inactive'}`}
                onClick={() => { setViewMode(mode); if (mode === 'full') setFullContent('preview'); }}
                title={mode === 'split' ? 'Split view' : 'Full view'}
              >
                {mode === 'split' ? <Columns2 size={11} /> : <Maximize2 size={11} />}
                {mode === 'split' ? 'Split' : 'Full'}
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
            <div className="ide-panel-tab" style={{ minWidth: `${editorWidth}px` }}>
              <span className="ide-dot" />
              <span className="ide-filename">{activeLabel || 'active.manifest.json'}</span>
              <span className="ide-badge">CellManifestV1</span>
            </div>
            <MonacoJsonEditor
              value={json}
              onChange={setJson}
              error={parseError}
              schemaUrl={`${MCP_API_URL}/api/json-schema/manifest`}
              modelUri="manifest://active.json"
              minWidth={`${editorWidth}px`}
            />
            <ContractSchemaPanel fields={manifestFields} schemaName="CellManifestV1Schema" />
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
            <div className="ide-panel-tab">
              <span className="ide-dot" />
              <span className="ide-filename" style={{ fontFamily: 'inherit' }}>Rendered Preview</span>
              <span className="ide-badge">live</span>
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
