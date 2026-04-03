import type { RadioGroupViewProps } from './RadioGroup.types';

export function RadioGroup({
  value,
  defaultValue,
  disabled = false,
  required = false,
  invalid = false,
  loading = false,
  name,
  id,
  direction = 'vertical',
  options,
  describedBy,
  onValueChange,
  onBlur,
}: RadioGroupViewProps) {
  const resolvedName = name ?? id;
  const layoutClass = direction === 'horizontal' ? 'flex flex-wrap items-center gap-4' : 'space-y-2';

  return (
    <div
      id={id}
      role="radiogroup"
      aria-invalid={invalid ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      aria-describedby={describedBy}
      className={layoutClass}
    >
      {options.map((option, index) => {
        const optionId = id ? `${id}-${index + 1}` : undefined;

        return (
          <label key={option.value} htmlFor={optionId} className="flex items-start gap-2">
            <input
              id={optionId}
              type="radio"
              name={resolvedName}
              value={option.value}
              checked={value === option.value}
              defaultChecked={value === undefined ? defaultValue === option.value : undefined}
              required={required}
              disabled={disabled || loading || option.disabled}
              onBlur={onBlur}
              onChange={(event) => onValueChange?.(event.currentTarget.value)}
              className={[
                'mt-0.5 h-4 w-4 border-gray-300 text-blue-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                'disabled:cursor-not-allowed disabled:opacity-60',
                'dark:border-gray-600 dark:bg-gray-900',
                invalid ? 'border-red-400 dark:border-red-700' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />

            <span className="min-w-0 text-sm text-gray-700 dark:text-gray-200">
              <span className="block">{option.label}</span>
              {option.description ? (
                <span className="block text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
