import type { DateInputViewProps } from './DateInput.types';

export function DateInput({
  value,
  defaultValue,
  placeholder,
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
}: DateInputViewProps) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type="date"
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        placeholder={placeholder}
        readOnly={readonly}
        required={required}
        disabled={disabled}
        aria-invalid={invalid ? 'true' : undefined}
        aria-busy={loading ? 'true' : undefined}
        aria-describedby={describedBy}
        onBlur={onBlur}
        onChange={(event) => onValueChange?.(event.currentTarget.value)}
        className={[
          'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200',
          loading ? 'pr-9' : '',
          invalid ? 'border-red-300 focus-visible:ring-red-500/30 dark:border-red-700' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />

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
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300"
    />
  );
}
