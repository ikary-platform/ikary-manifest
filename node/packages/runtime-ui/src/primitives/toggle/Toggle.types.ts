export type ToggleViewProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  label?: string;
  describedBy?: string;
  onCheckedChange?: (checked: boolean) => void;
  onBlur?: () => void;
};
