import type { CheckboxViewProps } from './Checkbox.types';

export function Checkbox({
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
}: CheckboxViewProps) {
  const control = (
    <input
      id={id}
      name={name}
      type="checkbox"
      checked={checked}
      defaultChecked={checked === undefined ? defaultChecked : undefined}
      required={required}
      disabled={disabled || loading}
      aria-invalid={invalid ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      aria-describedby={describedBy}
      onBlur={onBlur}
      onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
      className={[
        'mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'dark:border-gray-600 dark:bg-gray-900',
        invalid ? 'border-red-400 dark:border-red-700' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );

  if (!label) {
    return control;
  }

  return (
    <label htmlFor={id} className="inline-flex items-start gap-2">
      {control}
      <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
    </label>
  );
}
