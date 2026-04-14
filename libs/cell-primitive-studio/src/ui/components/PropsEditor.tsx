import { useState } from 'react';
import type { ReactNode } from 'react';
import { type ScenarioDefinition, ScenarioTabs } from './ScenarioTabs';
import type { ParseState } from '../hooks/usePropsEditorState';

export interface ContractField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  /** Zod schema reference for the field's type — used for drill-down navigation in the playground. */
  subSchema?: unknown;
  /** Catalog name of the sub-schema (e.g. 'CellMetadataSchema') — used for the link icon. */
  subSchemaName?: string;
}

interface PropsEditorProps {
  propsState: ParseState<unknown>;
  runtimeState: ParseState<unknown>;
  onPropsChange: (text: string) => void;
  onRuntimeChange: (text: string) => void;
  scenarios: ScenarioDefinition[];
  activeScenario: number;
  onScenarioSelect: (index: number) => void;
  contractFields?: ContractField[];
  /** Optional custom renderer for the Contract Props textarea — receives value + onChange */
  renderContractEditor?: (p: { value: string; onChange: (v: string) => void }) => ReactNode;
  /** Optional custom renderer for the Runtime Context textarea — receives value + onChange */
  renderRuntimeEditor?: (p: { value: string; onChange: (v: string) => void }) => ReactNode;
}

export function PropsEditor({
  propsState,
  runtimeState,
  onPropsChange,
  onRuntimeChange,
  scenarios,
  activeScenario,
  onScenarioSelect,
  contractFields,
  renderContractEditor,
  renderRuntimeEditor,
}: PropsEditorProps) {

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div className="ide-panel-tab">
        <span className="ide-dot" />
        <span className="ide-filename" style={{ fontFamily: 'inherit' }}>props.json</span>
        <span className="ide-badge">JSON</span>
      </div>
      <ScenarioTabs
        scenarios={scenarios}
        activeIndex={activeScenario}
        onSelect={onScenarioSelect}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <EditorSection
          label="Contract Props"
          value={propsState.text}
          onChange={onPropsChange}
          error={propsState.error}
          flex={3}
          renderContent={renderContractEditor}
        />
        <EditorSection
          label="Runtime Context"
          value={runtimeState.text}
          onChange={onRuntimeChange}
          error={runtimeState.error}
          flex={2}
          collapsible
          renderContent={renderRuntimeEditor}
        />
        {contractFields && contractFields.length > 0 && (
          <ContractReference fields={contractFields} />
        )}
      </div>
    </div>
  );
}

interface EditorSectionProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  error: string | null;
  flex?: number;
  collapsible?: boolean;
  /** When provided, replaces the textarea with a custom editor component */
  renderContent?: (p: { value: string; onChange: (v: string) => void }) => ReactNode;
}

function Chevron({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        transition: 'transform 0.15s ease',
        transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
      }}
    >
      <path d="M2.5 4.5L6 8l3.5-3.5" />
    </svg>
  );
}

function ContractReference({ fields }: { fields: ContractField[] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        flex: '0 0 auto',
        maxHeight: collapsed ? '28px' : '210px',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid hsl(var(--border))',
        transition: 'max-height 0.18s ease',
        overflow: 'hidden',
      }}
    >
      <button
        className="ide-sub-header ide-sub-header--clickable"
        onClick={() => setCollapsed((c) => !c)}
        style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
      >
        <span className="ide-sub-header-label">Contract Schema</span>
        <Chevron collapsed={collapsed} />
      </button>
      {!collapsed && (
        <div style={{ overflow: 'auto', flex: 1 }}>
          {fields.map((field) => (
            <div
              key={field.name}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                padding: '3px 12px',
                borderBottom: '1px solid hsl(var(--border))',
              }}
            >
              <code
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: 'hsl(var(--foreground))',
                  flexShrink: 0,
                  minWidth: '110px',
                }}
              >
                {field.name}
                {!field.required && <span style={{ color: 'hsl(var(--muted-foreground))' }}>?</span>}
              </code>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  color: '#7c3aed',
                  flexShrink: 0,
                  maxWidth: '130px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={field.type}
              >
                {field.type}
              </span>
              {field.description && (
                <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>{field.description}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorSection({ label, value, onChange, error, flex = 1, collapsible, renderContent }: EditorSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        flex: collapsed ? '0 0 28px' : flex,
        display: 'flex',
        flexDirection: 'column',
        borderBottom: '1px solid hsl(var(--border))',
        minHeight: 0,
        overflow: 'hidden',
        transition: 'flex 0.18s ease',
      }}
    >
      <div
        className={`ide-sub-header${collapsible ? ' ide-sub-header--clickable' : ''}`}
        onClick={collapsible ? () => setCollapsed((c) => !c) : undefined}
      >
        <span className="ide-sub-header-label">{label}</span>
        {error && !collapsed && (
          <span style={{ fontSize: '10px', color: '#ef4444', maxWidth: '60%', textAlign: 'right' }}>
            {error}
          </span>
        )}
        {collapsible && !error && <Chevron collapsed={collapsed} />}
      </div>
      {!collapsed && (
        renderContent ? (
          renderContent({ value, onChange })
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontFamily: 'monospace',
              fontSize: '11px',
              lineHeight: '1.5',
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: error ? 'rgba(239,68,68,0.1)' : 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        )
      )}
    </div>
  );
}
