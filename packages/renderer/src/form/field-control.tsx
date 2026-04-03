import type { UseFormRegister, FieldError } from 'react-hook-form';
import type { ResolvedCreateField } from '@ikary-manifest/engine';
import { useUIComponents } from '../UIComponentsProvider';
import { FormField } from './form-field';
import { TextInput, NumberInput, DateInput, DateTimeInput, TextareaInput, SelectInput } from './input-controls';

interface FieldControlProps {
  field: ResolvedCreateField;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  error?: FieldError;
}

export function FieldControl({ field, register, error }: FieldControlProps) {
  const { Label } = useUIComponents();
  const id = `field-${field.key}`;
  const effectiveRequired = field.effectiveFieldRules.some((r) => r.type === 'required');

  if (field.type === 'boolean') {
    return (
      <FormField
        id={id}
        label={field.name}
        required={effectiveRequired}
        helpText={field.effectiveHelpText}
        smallTip={field.effectiveSmallTip}
        error={error}
        inlineLabel
      >
        {(inputProps) => (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id={id}
              aria-describedby={inputProps['aria-describedby']}
              aria-invalid={inputProps['aria-invalid']}
              disabled={field.effectiveReadonly}
              className="h-4 w-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
              {...register(field.key)}
            />
            <Label htmlFor={id}>
              {field.name}
              {effectiveRequired && (
                <span aria-hidden="true" className="text-destructive ml-0.5">
                  *
                </span>
              )}
            </Label>
          </div>
        )}
      </FormField>
    );
  }

  return (
    <FormField
      id={id}
      label={field.name}
      required={effectiveRequired}
      helpText={field.effectiveHelpText}
      smallTip={field.effectiveSmallTip}
      error={error}
    >
      {(inputProps) => {
        const common = {
          ...inputProps,
          readOnly: field.effectiveReadonly,
          placeholder: field.effectivePlaceholder,
        };

        if (field.type === 'text') {
          return <TextareaInput {...common} {...register(field.key)} />;
        }
        if (field.type === 'enum') {
          return (
            <SelectInput
              {...common}
              required={effectiveRequired}
              options={(field.enumValues ?? []).map((v) => ({ value: v, label: v }))}
              {...register(field.key)}
            />
          );
        }
        if (field.type === 'number') {
          return <NumberInput {...common} {...register(field.key)} />;
        }
        if (field.type === 'date') {
          return <DateInput {...common} {...register(field.key)} />;
        }
        if (field.type === 'datetime') {
          return <DateTimeInput {...common} {...register(field.key)} />;
        }
        return <TextInput {...common} {...register(field.key)} />;
      }}
    </FormField>
  );
}
