export type FormFieldVariant = 'standard' | 'checkbox' | 'choice-group';

export type FormFieldStandardControl =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'textarea'
  | 'select'
  | 'date'
  | 'toggle';

export type FormFieldMessageTone = 'error' | 'warning' | 'success';

export type FormFieldOptionView = {
  key: string;
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
};

export type FormFieldMessageView = {
  tone: FormFieldMessageTone;
  text: string;
};

type FormFieldBaseViewProps = {
  key: string;
  variant: FormFieldVariant;

  helpText?: string;
  smallTip?: string;
  message?: FormFieldMessageView;

  required: boolean;
  readonly: boolean;
  disabled: boolean;
  loading: boolean;
  dense: boolean;

  testId?: string;

  fieldId: string;
  helpTextId?: string;
  smallTipId?: string;
  messageId?: string;
  describedBy?: string;

  onBlur?: () => void;
};

export type FormFieldStandardViewProps = FormFieldBaseViewProps & {
  variant: 'standard';
  control: FormFieldStandardControl;
  label: string;
  placeholder?: string;
  options?: FormFieldOptionView[];
  value?: unknown;
  onValueChange?: (value: unknown) => void;
};

export type FormFieldCheckboxViewProps = FormFieldBaseViewProps & {
  variant: 'checkbox';
  label: string;
  checked: boolean;
  onValueChange?: (value: boolean) => void;
};

export type FormFieldChoiceGroupViewProps = FormFieldBaseViewProps & {
  variant: 'choice-group';
  legend: string;
  options: FormFieldOptionView[];
  value?: string;
  onValueChange?: (value: string) => void;
};

export type FormFieldViewProps =
  | FormFieldStandardViewProps
  | FormFieldCheckboxViewProps
  | FormFieldChoiceGroupViewProps;
