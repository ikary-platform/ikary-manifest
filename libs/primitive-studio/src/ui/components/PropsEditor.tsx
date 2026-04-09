import { type ScenarioDefinition, ScenarioTabs } from './ScenarioTabs';
import type { ParseState } from '../hooks/usePropsEditorState';

interface PropsEditorProps {
  propsState: ParseState<unknown>;
  runtimeState: ParseState<unknown>;
  onPropsChange: (text: string) => void;
  onRuntimeChange: (text: string) => void;
  scenarios: ScenarioDefinition[];
  activeScenario: number;
  onScenarioSelect: (index: number) => void;
}

export function PropsEditor({
  propsState,
  runtimeState,
  onPropsChange,
  onRuntimeChange,
  scenarios,
  activeScenario,
  onScenarioSelect,
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
