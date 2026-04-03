export type SelectOptionView = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: string;
};

export type SelectViewProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  options: SelectOptionView[];
  emptyMessage?: string;
  leadingIcon?: string;
  describedBy?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};
