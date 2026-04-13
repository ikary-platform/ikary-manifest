import type { SelectViewProps } from './Select.types';

export function Select({
  value,
  defaultValue,
  placeholder,
  disabled = false,
  required = false,
  invalid = false,
  loading = false,
  name,
  id,
  options,
  emptyMessage = 'No options available',
  leadingIcon,
  describedBy,
  onValueChange,
  onBlur,
}: SelectViewProps) {
  const hasLeadingIcon = Boolean(leadingIcon);
  const hasOptions = options.length > 0;
  const resolvedValue = value ?? (placeholder ? '' : undefined);

  return (
    <div className="relative">
      {hasLeadingIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center pl-3 text-xs text-muted-foreground">
          {leadingIcon}
        </span>
      ) : null}

      <select
        id={id}
        name={name}
        value={resolvedValue}
        defaultValue={resolvedValue === undefined ? defaultValue : undefined}
        required={required}
        disabled={disabled || loading}
        aria-invalid={invalid ? 'true' : undefined}
        aria-busy={loading ? 'true' : undefined}
        aria-describedby={describedBy}
        onBlur={onBlur}
        onChange={(event) => onValueChange?.(event.currentTarget.value)}
        className={[
          'h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-60',
          hasLeadingIcon ? 'pl-9' : '',
          invalid ? 'border-destructive focus-visible:ring-destructive/30' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}

        {hasOptions ? (
          options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.icon ? `${option.icon} ` : ''}
              {option.label}
            </option>
          ))
        ) : (
          <option value="" disabled>
            {emptyMessage}
          </option>
        )}
      </select>

      {loading ? (
        <span className="pointer-events-none absolute inset-y-0 right-0 inline-flex items-center pr-3">
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
