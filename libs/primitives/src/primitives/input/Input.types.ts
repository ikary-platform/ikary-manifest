export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel';

export type InputValue = string | number;

export type InputViewProps = {
  inputType: InputType;
  value?: InputValue;
  defaultValue?: InputValue;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  leadingText?: string;
  trailingText?: string;
  describedBy?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};
