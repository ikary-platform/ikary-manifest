interface ChartHeaderProps {
  title?: string;
  description?: string;
}

export function ChartHeader({ title, description }: ChartHeaderProps) {
  if (!title && !description) return null;
  return (
    <div style={{ marginBottom: '12px' }}>
      {title && <div style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{title}</div>}
      {description && <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>{description}</div>}
    </div>
  );
}
