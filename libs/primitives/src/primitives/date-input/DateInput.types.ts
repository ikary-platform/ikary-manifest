export type DateInputViewProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  describedBy?: string;
  onValueChange?: (value: string | undefined) => void;
  onBlur?: () => void;
};
