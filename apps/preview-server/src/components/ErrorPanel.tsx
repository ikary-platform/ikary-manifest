interface ErrorPanelProps {
  errors: Array<{ field: string; message: string }>;
}

export function ErrorPanel({ errors }: ErrorPanelProps) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', color: '#dc2626' }}>
      <h2 style={{ marginBottom: '1rem' }}>Manifest errors</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {errors.map((e, i) => (
          <li key={i} style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280' }}>{e.field || 'root'}</span>{' '}
            {e.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
