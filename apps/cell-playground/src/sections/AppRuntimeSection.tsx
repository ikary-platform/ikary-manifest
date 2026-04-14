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
import { useViewMode } from '../hooks/useViewMode';
import { ResizeDivider } from '../components/ResizeDivider';

interface AppRuntimeSectionProps {
  activeScenario: number;
}


export function AppRuntimeSection({ activeScenario }: AppRuntimeSectionProps) {
  const [json, setJson] = useState(() => JSON.stringify(APP_MANIFEST_SCENARIOS[0].manifest, null, 2));
  const { viewMode, fullContent, setFull, setSplit, toggleFullContent } = useViewMode();
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
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Section toolbar ── */}
      <div className="ide-toolbar">
        <span className="ide-toolbar-label">App Runtime</span>
        <div className="flex items-center gap-1.5">
          {viewMode === 'full' && (
            <button
              className="ide-action-btn"
              onClick={toggleFullContent}
              title={fullContent === 'preview' ? 'Show JSON editor' : 'Show preview'}
            >
              {fullContent === 'preview' ? <Code2 size={11} /> : <Eye size={11} />}
              {fullContent === 'preview' ? 'View Code' : 'View Preview'}
            </button>
          )}
          <div className="ide-seg">
            <button
              className={`ide-seg-btn ${viewMode === 'split' ? 'ide-seg-btn--active' : 'ide-seg-btn--inactive'}`}
              onClick={setSplit}
              title="Split view"
            >
              <Columns2 size={11} />
              Split
            </button>
            <button
              className={`ide-seg-btn ${viewMode === 'full' ? 'ide-seg-btn--active' : 'ide-seg-btn--inactive'}`}
              onClick={setFull}
              title="Full view"
            >
              <Maximize2 size={11} />
              Full
            </button>
          </div>
        </div>
      </div>

      {/* ── Panels ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* CENTER: JSON editor
            - split mode: resizable panel
            - full-code: fills remaining space
            - full-preview: hidden */}
        {(viewMode === 'split' || fullContent === 'code') && (
          <div
            className="shrink-0 flex flex-col overflow-hidden"
            style={{
              width: viewMode === 'full' ? undefined : `${editorWidth}px`,
              flex: viewMode === 'full' ? 1 : undefined,
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
          <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
            <div className="ide-panel-tab">
              <span className="ide-dot" />
              <span className="ide-filename" style={{ fontFamily: 'inherit' }}>Rendered Preview</span>
              <span className="ide-badge">live</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <AppPreview json={json} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
