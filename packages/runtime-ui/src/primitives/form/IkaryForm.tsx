import { FormSection } from '../form-section/FormSection';
import { useIkaryForm } from './useIkaryForm';
import type { IkaryFormActionView, IkaryFormStatus, IkaryFormViewProps } from './IkaryForm.types';

export function IkaryForm(props: IkaryFormViewProps) {
  const model = useIkaryForm(props);
  const visibleActions = model.actions.filter((action) => action.visible);

  return (
    <section
      data-testid={props.config.testId}
      aria-busy={
        model.status === 'loading' || model.status === 'saving-draft' || model.status === 'committing'
          ? 'true'
          : undefined
      }
      className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
    >
      <header className="border-b border-gray-100 p-5 dark:border-gray-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{props.config.title}</h1>
            {props.config.description && (
              <p className="max-w-3xl text-sm text-gray-600 dark:text-gray-400">{props.config.description}</p>
            )}
          </div>

          {visibleActions.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {visibleActions.map((action) => (
                <ActionButton key={action.key} action={action} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={statusBadgeClassName(model.status)}>{statusLabel(model.status)}</span>

          {model.lastSavedAt && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last saved {new Date(model.lastSavedAt).toLocaleString()}
            </span>
          )}

          {model.feedback.lockReason && (
            <span className="text-xs text-gray-600 dark:text-gray-300">Lock: {model.feedback.lockReason}</span>
          )}

          {model.feedback.conflictMessage && (
            <span className="text-xs text-red-700 dark:text-red-300">Conflict detected</span>
          )}
        </div>
      </header>

      <div className={`space-y-4 p-5 ${props.config.dense ? 'text-xs' : 'text-sm'}`}>
        {model.sections.map((section) => (
          <FormSection key={section.sectionId} {...section} />
        ))}
      </div>

      {(model.feedback.formError || model.feedback.conflictMessage || model.feedback.reviewWarning) && (
        <footer className="border-t border-gray-100 p-4 dark:border-gray-800">
          <div className="space-y-2">
            {model.feedback.formError && <FeedbackMessage tone="error">{model.feedback.formError}</FeedbackMessage>}

            {model.feedback.conflictMessage && (
              <FeedbackMessage tone="error">{model.feedback.conflictMessage}</FeedbackMessage>
            )}

            {model.feedback.reviewWarning && (
              <FeedbackMessage tone="warning">{model.feedback.reviewWarning}</FeedbackMessage>
            )}
          </div>
        </footer>
      )}
    </section>
  );
}

function ActionButton({ action }: { action: IkaryFormActionView }) {
  const className = resolveActionClassName(action);

  return (
    <button type="button" disabled={action.disabled || action.pending} onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

function resolveActionClassName(action: IkaryFormActionView): string {
  const base =
    'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50';

  if (action.intent === 'danger') {
    return `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/40`;
  }

  if (action.intent === 'default') {
    return `${base} bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white`;
  }

  return `${base} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900`;
}

function statusBadgeClassName(status: IkaryFormStatus): string {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide';

  switch (status) {
    case 'loading':
    case 'saving-draft':
    case 'committing':
      return `${base} bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300`;
    case 'draft-saved':
    case 'committed':
      return `${base} bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300`;
    case 'needs-review':
      return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300`;
    case 'error':
    case 'conflict':
      return `${base} bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300`;
    case 'locked':
      return `${base} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400`;
    case 'editing':
      return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
    case 'ready':
    case 'idle':
    default:
      return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
  }
}

function statusLabel(status: IkaryFormStatus): string {
  switch (status) {
    case 'saving-draft':
      return 'Saving draft';
    case 'draft-saved':
      return 'Draft saved';
    default:
      return status;
  }
}

function FeedbackMessage({ tone, children }: { tone: 'error' | 'warning'; children: string }) {
  const className =
    tone === 'error'
      ? 'rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200'
      : 'rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200';

  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={className}>
      {children}
    </div>
  );
}

// Backward-compatible alias for existing imports.
export const Form = IkaryForm;
