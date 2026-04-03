import type { ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';
import { useUIComponents } from '../UIComponentsProvider';

interface InputProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  smallTip?: string;
  error?: FieldError;
  className?: string;
  inlineLabel?: boolean;
  children: (inputProps: InputProps) => ReactNode;
}

export function FormField({
  id,
  label,
  required,
  helpText,
  smallTip,
  error,
  className,
  inlineLabel,
  children,
}: FormFieldProps) {
  const { Label } = useUIComponents();
  const describedByParts = [helpText && `${id}-help`, smallTip && `${id}-tip`, error && `${id}-error`].filter(
    Boolean,
  ) as string[];

  const inputProps: InputProps = {
    id,
    ...(describedByParts.length > 0 ? { 'aria-describedby': describedByParts.join(' ') } : {}),
    ...(error ? { 'aria-invalid': true as const } : {}),
  };

  if (inlineLabel) {
    return (
      <div className={`flex flex-col gap-y-1 ${className ?? ''}`}>
        {children(inputProps)}
        {helpText && (
          <p id={`${id}-help`} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
        {smallTip && (
          <p id={`${id}-tip`} className="text-xs text-muted-foreground/70">
            {smallTip}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
            {error.message ?? 'Invalid value.'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-y-1 ${className ?? ''}`}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive ml-0.5">
            *
          </span>
        )}
      </Label>
      {helpText && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
      <div>{children(inputProps)}</div>
      {smallTip && (
        <p id={`${id}-tip`} className="text-xs text-muted-foreground/70">
          {smallTip}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error.message ?? 'Invalid value.'}
        </p>
      )}
    </div>
  );
}
