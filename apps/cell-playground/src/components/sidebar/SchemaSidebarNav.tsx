import { useSearchParams } from 'react-router-dom';

const VIEWS = [
  { key: 'schemas', label: 'Schemas' },
  { key: 'dependencies', label: 'Dependencies' },
] as const;

type SchemaView = typeof VIEWS[number]['key'];

export function SchemaSidebarNav() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view: SchemaView = searchParams.get('view') === 'dependencies' ? 'dependencies' : 'schemas';

  return (
    <div style={{ flex: 1, padding: '4px 0' }}>
      {VIEWS.map(({ key, label }) => {
        const isSelected = view === key;
        return (
          <button
            key={key}
            onClick={() =>
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  if (key === 'schemas') next.delete('view');
                  else next.set('view', key);
                  return next;
                },
                { replace: true },
              )
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '6px 12px 6px 20px',
              background: isSelected ? 'hsl(var(--accent))' : 'transparent',
              border: 'none',
              borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '13px',
              color: isSelected ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))',
              textAlign: 'left',
              fontWeight: isSelected ? 500 : 400,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
