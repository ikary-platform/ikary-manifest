import { Checkbox } from '../checkbox/Checkbox';
import { DateInput } from '../date-input/DateInput';
import { Input } from '../input/Input';
import { RadioGroup } from '../radio-group/RadioGroup';
import { Select } from '../select/Select';
import { Textarea } from '../textarea/Textarea';
import { Toggle } from '../toggle/Toggle';
import type { FormFieldMessageTone, FormFieldStandardViewProps, FormFieldViewProps } from './FormField.types';

export function FormField(props: FormFieldViewProps) {
  const containerClassName = ['space-y-1.5', props.dense ? 'text-xs' : 'text-sm'].join(' ');

  if (props.variant === 'standard') {
    return (
      <div data-testid={props.testId} className={containerClassName}>
        <label htmlFor={props.fieldId} className={labelClassName()}>
          {props.label}
          {props.required ? <RequiredMark /> : null}
        </label>

        <FieldSupportText id={props.helpTextId} text={props.helpText} tone="help" />

        <div>{renderStandardControl(props)}</div>

        <FieldSupportText id={props.smallTipId} text={props.smallTip} tone="tip" />

        <FieldMessage id={props.messageId} message={props.message} />
      </div>
    );
  }

  if (props.variant === 'checkbox') {
    return (
      <div data-testid={props.testId} className={containerClassName}>
        <div className="flex items-start gap-2">
          <Checkbox
            id={props.fieldId}
            checked={props.checked}
            onBlur={props.onBlur}
            onCheckedChange={(checked) => props.onValueChange?.(checked)}
            describedBy={props.describedBy}
            invalid={props.message?.tone === 'error'}
            disabled={props.disabled}
            loading={props.loading}
            required={props.required}
          />

          <label htmlFor={props.fieldId} className={labelClassName()}>
            {props.label}
            {props.required ? <RequiredMark /> : null}
          </label>
        </div>

        <FieldSupportText id={props.helpTextId} text={props.helpText} tone="help" />

        <FieldSupportText id={props.smallTipId} text={props.smallTip} tone="tip" />

        <FieldMessage id={props.messageId} message={props.message} />
      </div>
    );
  }

  return (
    <fieldset
      data-testid={props.testId}
      className={containerClassName}
      aria-describedby={props.describedBy}
      aria-invalid={props.message?.tone === 'error' ? 'true' : undefined}
      disabled={props.disabled || props.loading}
    >
      <legend className={labelClassName()}>
        {props.legend}
        {props.required ? <RequiredMark /> : null}
      </legend>

      <FieldSupportText id={props.helpTextId} text={props.helpText} tone="help" />

      <RadioGroup
        id={props.fieldId}
        name={props.fieldId}
        value={props.value}
        onBlur={props.onBlur}
        onValueChange={(value) => props.onValueChange?.(value)}
        disabled={props.disabled || props.readonly}
        required={props.required}
        loading={props.loading}
        invalid={props.message?.tone === 'error'}
        describedBy={props.describedBy}
        direction="vertical"
        options={(props.options ?? []).map((option) => ({
          value: option.value,
          label: option.label,
          disabled: option.disabled,
          description: option.description,
        }))}
      />

      <FieldSupportText id={props.smallTipId} text={props.smallTip} tone="tip" />

      <FieldMessage id={props.messageId} message={props.message} />
    </fieldset>
  );
}

function renderStandardControl(props: FormFieldStandardViewProps) {
  const invalid = props.message?.tone === 'error';
  const describedBy = props.describedBy;

  if (props.control === 'textarea') {
    return (
      <Textarea
        id={props.fieldId}
        value={toStringOrUndefined(props.value)}
        onBlur={props.onBlur}
        onValueChange={(value) => props.onValueChange?.(value)}
        describedBy={describedBy}
        invalid={invalid}
        placeholder={props.placeholder}
        readonly={props.readonly}
        disabled={props.disabled}
        required={props.required}
        loading={props.loading}
      />
    );
  }

  if (props.control === 'select') {
    return (
      <Select
        id={props.fieldId}
        value={toStringOrUndefined(props.value)}
        onBlur={props.onBlur}
        onValueChange={(value) => props.onValueChange?.(value)}
        describedBy={describedBy}
        invalid={invalid}
        disabled={props.disabled || props.readonly}
        required={props.required}
        loading={props.loading}
        options={(props.options ?? []).map((option) => ({
          value: option.value,
          label: option.label,
          disabled: option.disabled,
          description: option.description,
        }))}
        placeholder={props.placeholder}
      />
    );
  }

  if (props.control === 'toggle') {
    return (
      <div className="flex items-center">
        <Toggle
          id={props.fieldId}
          checked={Boolean(props.value)}
          onBlur={props.onBlur}
          onCheckedChange={(checked) => props.onValueChange?.(checked)}
          describedBy={describedBy}
          invalid={invalid}
          disabled={props.disabled}
          required={props.required}
          loading={props.loading}
        />
      </div>
    );
  }

  if (props.control === 'date') {
    return (
      <DateInput
        id={props.fieldId}
        value={toStringOrUndefined(props.value)}
        onBlur={props.onBlur}
        onValueChange={(value) => props.onValueChange?.(value)}
        describedBy={describedBy}
        invalid={invalid}
        placeholder={props.placeholder}
        readonly={props.readonly}
        disabled={props.disabled}
        required={props.required}
        loading={props.loading}
      />
    );
  }

  const inputType = toInputType(props.control);

  return (
    <Input
      id={props.fieldId}
      inputType={inputType}
      value={inputType === 'number' ? toNumberOrString(props.value) : toStringOrUndefined(props.value)}
      onBlur={props.onBlur}
      onValueChange={(value) => props.onValueChange?.(value)}
      describedBy={describedBy}
      invalid={invalid}
      placeholder={props.placeholder}
      readonly={props.readonly}
      disabled={props.disabled}
      required={props.required}
      loading={props.loading}
    />
  );
}

function FieldSupportText({ id, text, tone }: { id?: string; text?: string; tone: 'help' | 'tip' }) {
  if (!text) return null;

  return (
    <p
      id={id}
      className={
        tone === 'help' ? 'text-xs text-gray-500 dark:text-gray-400' : 'text-xs text-gray-500 dark:text-gray-500'
      }
    >
      {text}
    </p>
  );
}

function FieldMessage({ id, message }: { id?: string; message?: { tone: FormFieldMessageTone; text: string } }) {
  if (!message) return null;

  return (
    <p id={id} role={message.tone === 'error' ? 'alert' : 'status'} className={messageClassName(message.tone)}>
      {message.text}
    </p>
  );
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-1 text-red-600 dark:text-red-400">
      *
    </span>
  );
}

function labelClassName(): string {
  return 'text-sm font-medium text-gray-900 dark:text-gray-100';
}

function messageClassName(tone: FormFieldMessageTone): string {
  switch (tone) {
    case 'error':
      return 'text-xs text-red-700 dark:text-red-300';
    case 'warning':
      return 'text-xs text-yellow-800 dark:text-yellow-300';
    case 'success':
    default:
      return 'text-xs text-green-700 dark:text-green-300';
  }
}

function toInputType(control: FormFieldStandardViewProps['control']): 'text' | 'number' | 'email' | 'password' {
  if (control === 'number') return 'number';
  if (control === 'email') return 'email';
  if (control === 'password') return 'password';
  return 'text';
}

function toStringOrUndefined(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  return String(value);
}

function toNumberOrString(value: unknown): string | number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') return value;
  return String(value);
}
