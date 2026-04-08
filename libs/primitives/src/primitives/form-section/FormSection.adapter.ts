import type {
  FormFieldPresentation,
  FormFieldRelationPresentation,
  FormSectionPresentation,
} from '@ikary/presentation';
import { buildFormFieldViewModel } from '../form-field/FormField.adapter';
import type { FormFieldViewProps } from '../form-field/FormField.types';
import { buildRelationFieldViewModel } from '../relation-field/RelationField.adapter';
import type { RelationFieldRuntime, RelationFieldViewProps } from '../relation-field/RelationField.types';
import type { FormSectionResolvedAction, FormSectionViewProps } from './FormSection.types';

export type FormSectionFieldRuntime = {
  value?: unknown;
  onValueChange?: (value: unknown) => void;
  onBlur?: () => void;
};

export type BuildFormSectionViewModelInput = {
  presentation: FormSectionPresentation;

  fieldRuntime?: Record<string, FormSectionFieldRuntime | RelationFieldRuntime>;

  actionHandlers?: Record<string, () => void>;
  isAuthorized?: (actionKey: string) => boolean;

  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export function buildFormSectionViewModel(input: BuildFormSectionViewModelInput): FormSectionViewProps {
  const ids = resolveIds(input.presentation);

  const readonly = input.presentation.readonly === true || input.presentation.status === 'readonly';

  const disabled = input.presentation.disabled === true || input.presentation.status === 'disabled';

  return {
    title: input.presentation.title,
    description: input.presentation.description,

    layout: input.presentation.layout ?? 'stack',
    fields: input.presentation.fields.map((field) =>
      resolveField(field, input, {
        readonly,
        disabled,
        dense: input.presentation.dense,
      }),
    ),

    actions: input.presentation.actions?.map((action) => resolveAction(action, input, disabled)),

    collapsible: input.presentation.collapsible ?? false,
    defaultExpanded: input.presentation.defaultExpanded ?? true,
    expanded: input.expanded,
    onExpandedChange: input.onExpandedChange,

    readonly,
    disabled,
    status: input.presentation.status,
    dense: input.presentation.dense ?? false,
    testId: input.presentation.testId,

    sectionId: ids.sectionId,
    titleId: ids.titleId,
    descriptionId: ids.descriptionId,
    contentId: ids.contentId,
  };
}

function resolveField(
  field: FormSectionPresentation['fields'][number],
  input: BuildFormSectionViewModelInput,
  sectionDefaults: {
    readonly: boolean;
    disabled: boolean;
    dense: boolean | undefined;
  },
): FormFieldViewProps | RelationFieldViewProps {
  if (field.variant === 'relation') {
    const runtime = input.fieldRuntime?.[field.key] as RelationFieldRuntime | undefined;
    return buildRelationFieldViewModel({
      presentation: field as FormFieldRelationPresentation,
      disabled: sectionDefaults.disabled ? true : field.disabled,
      readonly: sectionDefaults.readonly ? true : field.readonly,
      dense: sectionDefaults.dense ?? field.dense,
      ...runtime,
    });
  }

  const fieldPresentation: FormFieldPresentation = {
    ...field,
    readonly: sectionDefaults.readonly ? true : (field as FormFieldPresentation).readonly,
    disabled: sectionDefaults.disabled ? true : (field as FormFieldPresentation).disabled,
    dense: sectionDefaults.dense ?? (field as FormFieldPresentation).dense,
  } as FormFieldPresentation;

  const runtime = input.fieldRuntime?.[field.key] as FormSectionFieldRuntime | undefined;

  return buildFormFieldViewModel({
    presentation: fieldPresentation,
    value: runtime?.value,
    onValueChange: runtime?.onValueChange,
    onBlur: runtime?.onBlur,
  });
}

function resolveAction(
  action: NonNullable<FormSectionPresentation['actions']>[number],
  input: BuildFormSectionViewModelInput,
  sectionDisabled: boolean,
): FormSectionResolvedAction {
  const authorized = resolveAuthorization(action.actionKey, input);
  const hidden = action.hiddenWhenUnauthorized === true && authorized === false;

  const resolved: FormSectionResolvedAction = {
    key: action.key,
    label: action.label,
    icon: action.icon,
    intent: action.intent,
    href: action.href,
    disabled: sectionDisabled || action.disabled,
    hidden,
  };

  if (action.actionKey) {
    const handler = input.actionHandlers?.[action.actionKey];
    resolved.onClick = handler;
    resolved.disabled = sectionDisabled || action.disabled || typeof handler !== 'function';
  }

  return resolved;
}

function resolveAuthorization(
  actionKey: string | undefined,
  input: BuildFormSectionViewModelInput,
): boolean | undefined {
  if (!actionKey) return undefined;
  if (!input.isAuthorized) return undefined;

  return input.isAuthorized(actionKey);
}

function resolveIds(presentation: FormSectionPresentation): {
  sectionId: string;
  titleId: string;
  descriptionId?: string;
  contentId: string;
} {
  const safeKey = presentation.key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');

  const sectionId = `form-section-${safeKey}`;
  const titleId = `${sectionId}-title`;
  const descriptionId = presentation.description ? `${sectionId}-description` : undefined;
  const contentId = `${sectionId}-content`;

  return {
    sectionId,
    titleId,
    descriptionId,
    contentId,
  };
}
