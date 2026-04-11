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
}: PropsEditorProps) {
  return (
    <div
      style={{
        flex: '0 0 38%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}
    >
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
}

function ContractReference({ fields }: { fields: ContractField[] }) {
  return (
    <div
      style={{
        flex: '0 0 auto',
        maxHeight: '210px',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          padding: '4px 12px',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.04em' }}>
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
              borderBottom: '1px solid #f8fafc',
            }}
          >
            <code
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#1e293b',
                flexShrink: 0,
                minWidth: '110px',
              }}
            >
              {field.name}
              {!field.required && <span style={{ color: '#94a3b8' }}>?</span>}
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
              <span style={{ fontSize: '10px', color: '#64748b' }}>{field.description}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorSection({ label, value, onChange, error, flex = 1 }: EditorSectionProps) {
  return (
    <div
      style={{
        flex,
        display: 'flex',
        flexDirection: 'column',
        borderBottom: '1px solid #e2e8f0',
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.04em' }}>
          {label}
        </span>
        {error && (
          <span style={{ fontSize: '10px', color: '#ef4444', maxWidth: '60%', textAlign: 'right' }}>
            {error}
          </span>
        )}
      </div>
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
          backgroundColor: error ? '#fff5f5' : '#fafafa',
          color: '#1e293b',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
