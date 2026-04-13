export interface ScenarioDefinition {
  label: string;
  description?: string;
  props: unknown;
  runtime?: unknown;
}

interface ScenarioTabsProps {
  scenarios: ScenarioDefinition[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function ScenarioTabs({ scenarios, activeIndex, onSelect }: ScenarioTabsProps) {
  if (scenarios.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '2px',
        padding: '8px 12px 0',
        borderBottom: '1px solid hsl(var(--border))',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {scenarios.map((s, i) => (
        <button
          key={i}
          type="button"
          title={s.description}
          onClick={() => onSelect(i)}
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            border: 'none',
            borderBottom: i === activeIndex ? '2px solid #3b82f6' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            color: i === activeIndex ? '#3b82f6' : 'hsl(var(--muted-foreground))',
            fontWeight: i === activeIndex ? 600 : 400,
            whiteSpace: 'nowrap',
            marginBottom: '-1px',
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
