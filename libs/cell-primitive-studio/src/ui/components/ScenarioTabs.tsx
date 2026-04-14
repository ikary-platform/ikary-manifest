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
    <div className="ide-scenario-tabs">
      {scenarios.map((s, i) => (
        <button
          key={i}
          type="button"
          title={s.description}
          onClick={() => onSelect(i)}
          className={`ide-scenario-tab${i === activeIndex ? ' ide-scenario-tab--active' : ''}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
