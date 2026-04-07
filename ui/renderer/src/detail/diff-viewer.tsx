import type { EntityDefinition, FieldDiff } from '@ikary/contract';

interface DiffViewerProps {
  diffs: FieldDiff[];
  entity?: EntityDefinition;
}

function formatVal(v: unknown): string {
  if (v === undefined || v === null || v === '') return '(empty)';
  return String(v);
}

export function DiffViewer({ diffs, entity }: DiffViewerProps) {
  if (diffs.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No field changes recorded.</p>;
  }

  function getFieldName(fieldKey: string): string {
    if (entity) {
      const f = entity.fields.find((field) => field.key === fieldKey);
      if (f) return f.name;
    }
    return fieldKey;
  }

  return (
    <div className="space-y-1.5">
      {diffs.map((diff) => (
        <div key={diff.fieldKey} className="flex items-start gap-2 text-xs">
          <span className="w-28 shrink-0 font-medium text-muted-foreground">{getFieldName(diff.fieldKey)}</span>
          {diff.kind === 'modified' && (
            <span className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-destructive bg-destructive/10 px-1.5 py-0.5 rounded line-through truncate">
                {formatVal(diff.before)}
              </span>
              <span className="text-muted-foreground">&rarr;</span>
              <span className="text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded truncate">
                {formatVal(diff.after)}
              </span>
            </span>
          )}
          {diff.kind === 'added' && (
            <span className="text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
              + {formatVal(diff.after)}
            </span>
          )}
          {diff.kind === 'removed' && (
            <span className="text-destructive bg-destructive/10 px-1.5 py-0.5 rounded line-through">
              {formatVal(diff.before)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
