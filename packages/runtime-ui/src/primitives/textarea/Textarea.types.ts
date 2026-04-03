export type TextareaViewProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  describedBy?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};
