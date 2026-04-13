import * as React from 'react';
import type { SelectOptionPresentation } from '@ikary/cell-presentation';
import { useUIComponents } from '../UIComponentsProvider';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }) {
  const { TextInput: TextInputComponent } = useUIComponents();
  return <TextInputComponent {...props} />;
}

export function NumberInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> },
) {
  const { NumberInput: NumberInputComponent } = useUIComponents();
  return <NumberInputComponent {...props} />;
}

export const DateInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    const { TextInput: TextInputComponent } = useUIComponents();
    return <TextInputComponent ref={ref} type="date" {...props} />;
  },
);
DateInput.displayName = 'DateInput';

export const DateTimeInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    const { TextInput: TextInputComponent } = useUIComponents();
    return <TextInputComponent ref={ref} type="datetime-local" {...props} />;
  },
);
DateTimeInput.displayName = 'DateTimeInput';

export const TextareaInput = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => {
    const { Textarea: TextareaComponent } = useUIComponents();
    return <TextareaComponent ref={ref} rows={3} {...props} />;
  },
);
TextareaInput.displayName = 'TextareaInput';

export interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOptionPresentation[];
}

export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ options, className, ...props }, ref) => (
    <select
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
      {...props}
    >
      {!props.required && <option value="">Select…</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
);
SelectInput.displayName = 'SelectInput';
