import { useState } from 'react';
import { FormField } from '../form-field/FormField';
import { RelationField } from '../relation-field/RelationField';
import type { RelationFieldViewProps } from '../relation-field/RelationField.types';
import type { FormSectionResolvedAction, FormSectionStatus, FormSectionViewProps } from './FormSection.types';

export function FormSection({
  title,
  description,
  layout,
  fields,
  actions = [],
  collapsible,
  defaultExpanded,
  expanded: controlledExpanded,
  onExpandedChange,
  disabled,
  status = 'default',
  dense = false,
  testId,
  sectionId,
  titleId,
  descriptionId,
  contentId,
}: FormSectionViewProps) {
  const visibleActions = actions.filter((action) => !action.hidden);
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);

  const expanded = collapsible ? (controlledExpanded ?? uncontrolledExpanded) : true;

  const paddingClass = dense ? 'p-4' : 'p-5';
  const headerGapClass = dense ? 'gap-2' : 'gap-3';
  const hasHeaderActions = collapsible || visibleActions.length > 0;

  function toggleExpanded() {
    const nextExpanded = !expanded;

    if (controlledExpanded === undefined) {
      setUncontrolledExpanded(nextExpanded);
    }

    onExpandedChange?.(nextExpanded);
  }

  return (
    <section
      id={sectionId}
      data-testid={testId}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={sectionClassName(status)}
    >
      <div className={paddingClass}>
        <div className={`flex flex-col justify-between ${headerGapClass} lg:flex-row lg:items-start`}>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={titleId} className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
              {status !== 'default' && <span className={statusBadgeClassName(status)}>{statusLabel(status)}</span>}
            </div>

            {description && (
              <p id={descriptionId} className="max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>

          {hasHeaderActions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {visibleActions.map((action) => (
                <ActionButton key={action.key} action={action} disabled={disabled} />
              ))}

              {collapsible && (
                <button
                  type="button"
                  onClick={toggleExpanded}
                  aria-expanded={expanded}
                  aria-controls={contentId}
                  disabled={disabled}
                  className={collapseButtonClassName()}
                >
                  {expanded ? 'Collapse' : 'Expand'}
                </button>
              )}
            </div>
          )}
        </div>

        <div id={contentId} className={bodyClassName(layout)} hidden={!expanded}>
          {fields.map((field) => (
            <div key={field.key} className={fieldWrapperClass(layout, field)}>
              {field.variant === 'relation' ? (
                <RelationField {...(field as RelationFieldViewProps)} />
              ) : (
                <FormField {...field} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function bodyClassName(layout: FormSectionViewProps['layout']): string {
  if (layout === 'two-column') {
    return 'grid grid-cols-1 gap-4 pt-4 lg:grid-cols-2';
  }

  return 'space-y-4 pt-4';
}

function fieldWrapperClass(
  layout: FormSectionViewProps['layout'],
  field: FormSectionViewProps['fields'][number],
): string | undefined {
  if (layout !== 'two-column') {
    return undefined;
  }

  const shouldSpanBothColumns =
    field.variant === 'relation' ||
    field.variant === 'choice-group' ||
    (field.variant === 'standard' && field.control === 'textarea');

  return shouldSpanBothColumns ? 'lg:col-span-2' : undefined;
}

function ActionButton({ action, disabled }: { action: FormSectionResolvedAction; disabled: boolean }) {
  const isDisabled = disabled || action.disabled;
  const className = actionButtonClassName(action.intent);

  if (action.href) {
    return (
      <a
        href={action.href}
        aria-disabled={isDisabled ? 'true' : undefined}
        onClick={(event) => {
          if (isDisabled) {
            event.preventDefault();
          }
        }}
        className={className}
      >
        {action.label}
      </a>
    );
  }

  return (
    <button type="button" onClick={action.onClick} disabled={isDisabled} className={className}>
      {action.label}
    </button>
  );
}

function actionButtonClassName(intent: FormSectionResolvedAction['intent']): string {
  const base =
    'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50';

  if (intent === 'danger') {
    return `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/40`;
  }

  return `${base} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900`;
}

function collapseButtonClassName(): string {
  return 'inline-flex h-8 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900';
}

function sectionClassName(status: FormSectionStatus): string {
  const base = 'rounded-lg border bg-white dark:bg-gray-950';

  switch (status) {
    case 'warning':
      return `${base} border-yellow-200 dark:border-yellow-900`;
    case 'error':
      return `${base} border-red-200 dark:border-red-900`;
    case 'complete':
      return `${base} border-green-200 dark:border-green-900`;
    case 'disabled':
      return `${base} border-gray-200 opacity-80 dark:border-gray-800`;
    case 'readonly':
      return `${base} border-gray-200 dark:border-gray-800`;
    case 'default':
    default:
      return `${base} border-gray-200 dark:border-gray-800`;
  }
}

function statusBadgeClassName(status: FormSectionStatus): string {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide';

  switch (status) {
    case 'warning':
      return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300`;
    case 'error':
      return `${base} bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300`;
    case 'complete':
      return `${base} bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300`;
    case 'readonly':
      return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
    case 'disabled':
      return `${base} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400`;
    case 'default':
    default:
      return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
  }
}

function statusLabel(status: FormSectionStatus): string {
  switch (status) {
    case 'readonly':
      return 'Read only';
    case 'complete':
      return 'Complete';
    default:
      return status;
  }
}
