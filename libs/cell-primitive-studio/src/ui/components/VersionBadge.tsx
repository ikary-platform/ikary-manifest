interface VersionBadgeProps {
  version?: string;
  source?: 'core' | 'custom';
}

export function VersionBadge({ version, source }: VersionBadgeProps) {
  if (!version && source !== 'custom') return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        fontFamily: 'monospace',
        padding: '1px 5px',
        borderRadius: '3px',
        backgroundColor: source === 'custom' ? '#fffbeb' : '#f1f5f9',
        color: source === 'custom' ? '#92400e' : '#475569',
        border: `1px solid ${source === 'custom' ? '#fcd34d' : '#e2e8f0'}`,
        flexShrink: 0,
      }}
    >
      {source === 'custom' && <span>★</span>}
      {version && version !== 'latest' ? version : source === 'custom' ? 'custom' : null}
    </span>
  );
}
