import type { FormFieldViewProps } from '../form-field/FormField.types';
import type { RelationFieldViewProps } from '../relation-field/RelationField.types';

export type FormSectionLayout = 'stack' | 'two-column';

export type FormSectionStatus = 'default' | 'readonly' | 'disabled' | 'warning' | 'error' | 'complete';

export type FormSectionActionIntent = 'default' | 'neutral' | 'danger';

export type FormSectionResolvedAction = {
  key: string;
  label: string;
  icon?: string;
  intent?: FormSectionActionIntent;
  href?: string;
  disabled?: boolean;
  hidden?: boolean;
  onClick?: () => void;
};

export type FormSectionViewProps = {
  title: string;
  description?: string;

  layout: FormSectionLayout;
  fields: (FormFieldViewProps | RelationFieldViewProps)[];

  actions?: FormSectionResolvedAction[];

  collapsible: boolean;
  defaultExpanded: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;

  readonly: boolean;
  disabled: boolean;
  status?: FormSectionStatus;
  dense: boolean;
  testId?: string;

  sectionId: string;
  titleId: string;
  descriptionId?: string;
  contentId: string;
};
