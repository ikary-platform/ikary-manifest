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
          'min-h-24 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200',
          invalid ? 'border-red-300 focus-visible:ring-red-500/30 dark:border-red-700' : '',
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
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300"
    />
  );
}
