export type RadioGroupDirection = 'vertical' | 'horizontal';

export type RadioGroupOptionView = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
};

export type RadioGroupViewProps = {
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  direction?: RadioGroupDirection;
  options: RadioGroupOptionView[];
  describedBy?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};
