interface ErrorPanelProps {
  errors: Array<{ field: string; message: string }>;
}

export function ErrorPanel({ errors }: ErrorPanelProps) {
  return (
    <div className="p-8 font-mono">
      <h2 className="text-destructive text-lg font-semibold mb-4">Manifest errors</h2>
      <ul className="space-y-2 list-none p-0">
        {errors.map((e, i) => (
          <li key={i} className="text-sm">
            <span className="text-muted-foreground">{e.field || 'root'}</span>{' '}
            <span className="text-destructive">{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
