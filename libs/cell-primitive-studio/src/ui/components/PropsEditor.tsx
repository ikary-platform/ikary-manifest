import type { ReactNode } from 'react';
import { type ScenarioDefinition, ScenarioTabs } from './ScenarioTabs';
import type { ParseState } from '../hooks/usePropsEditorState';

export interface ContractField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
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
      {/* Panel header bar — matches the 36px height used by AppRuntime/ApiRuntime */}
      <div
        style={{
          height: '36px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: '1px solid hsl(var(--border))',
          background: 'hsl(var(--muted))',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          Props
        </span>
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
  /** When provided, replaces the textarea with a custom editor component */
  renderContent?: (p: { value: string; onChange: (v: string) => void }) => ReactNode;
}

function ContractReference({ fields }: { fields: ContractField[] }) {
  return (
    <div
      style={{
        flex: '0 0 auto',
        maxHeight: '210px',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid hsl(var(--border))',
      }}
    >
      <div
        style={{
          padding: '4px 12px',
          borderBottom: '1px solid hsl(var(--border))',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.04em' }}>
          CONTRACT SCHEMA
        </span>
      </div>
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
    </div>
  );
}

function EditorSection({ label, value, onChange, error, flex = 1, renderContent }: EditorSectionProps) {
  return (
    <div
      style={{
        flex,
        display: 'flex',
        flexDirection: 'column',
        borderBottom: '1px solid hsl(var(--border))',
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px',
          borderBottom: '1px solid hsl(var(--border))',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.04em' }}>
          {label}
        </span>
        {error && (
          <span style={{ fontSize: '10px', color: '#ef4444', maxWidth: '60%', textAlign: 'right' }}>
            {error}
          </span>
        )}
      </div>
      {renderContent ? (
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
      )}
    </div>
  );
}
