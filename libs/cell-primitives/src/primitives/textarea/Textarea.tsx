import type { TextareaViewProps } from './Textarea.types';

export function Textarea({
  value,
  defaultValue,
  placeholder,
  rows,
  disabled = false,
  readonly = false,
  required = false,
  invalid = false,
  loading = false,
  name,
  id,
  describedBy,
  onValueChange,
  onBlur,
}: TextareaViewProps) {
  return (
    <div className="relative">
      <textarea
        id={id}
        name={name}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        placeholder={placeholder}
        rows={rows ?? 4}
        readOnly={readonly}
        required={required}
        disabled={disabled}
        aria-invalid={invalid ? 'true' : undefined}
        aria-busy={loading ? 'true' : undefined}
        aria-describedby={describedBy}
        onBlur={onBlur}
        onChange={(event) => onValueChange?.(event.currentTarget.value)}
        className={[
          'min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-60',
          invalid ? 'border-destructive focus-visible:ring-destructive/30' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {loading ? (
        <span className="pointer-events-none absolute right-3 top-3 inline-flex">
          <InlineSpinner />
        </span>
      ) : null}
    </div>
  );
}

function InlineSpinner() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-foreground/50"
    />
  );
}
