interface PromotedMetadataRowProps {
  record: Record<string, unknown>;
}

function fmt(val: unknown): string {
  if (!val) return '—';
  const s = String(val);
  const d = new Date(s);
  if (!isNaN(d.getTime()) && s.includes('T')) {
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }
  return s;
}

export function PromotedMetadataRow({ record }: PromotedMetadataRowProps) {
  const version = record['_version'] ? `v${record['_version']}` : 'v1';
  const createdAt = fmt(record['_createdAt']);
  const createdBy = String(record['_createdBy'] ?? '—');
  const updatedAt = fmt(record['_updatedAt']);
  const updatedBy = String(record['_updatedBy'] ?? '—');
  const status = record['status'] ? String(record['status']) : null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
      <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{version}</span>
      <span>
        Created {createdAt} by <span className="text-foreground font-medium">{createdBy}</span>
      </span>
      <span>·</span>
      <span>
        Updated {updatedAt} by <span className="text-foreground font-medium">{updatedBy}</span>
      </span>
      {status && (
        <>
          <span>·</span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{status}</span>
        </>
      )}
    </div>
  );
}
