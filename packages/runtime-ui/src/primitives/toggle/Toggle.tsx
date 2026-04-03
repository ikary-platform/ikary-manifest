import type { ToggleViewProps } from './Toggle.types';

export function Toggle({
  checked,
  defaultChecked,
  disabled = false,
  required = false,
  invalid = false,
  loading = false,
  name,
  id,
  label,
  describedBy,
  onCheckedChange,
  onBlur,
}: ToggleViewProps) {
  const isDisabled = disabled || loading;

  const control = (
    <span className="relative inline-flex">
      <input
        id={id}
        name={name}
        type="checkbox"
        role="switch"
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        required={required}
        disabled={isDisabled}
        aria-invalid={invalid ? 'true' : undefined}
        aria-busy={loading ? 'true' : undefined}
        aria-describedby={describedBy}
        onBlur={onBlur}
        onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        className={[
          'relative inline-flex h-6 w-10 items-center rounded-full border border-transparent transition-colors',
          'bg-gray-300 dark:bg-gray-700',
          'peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500',
          'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
          invalid ? 'ring-1 ring-red-400 dark:ring-red-700' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="ml-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
      </span>
    </span>
  );

  if (!label) {
    return control;
  }

  return (
    <label htmlFor={id} className="inline-flex items-center gap-2">
      {control}
      <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
    </label>
  );
}
