import type {
  BulkCommandBarConfirmView,
  BulkCommandBarResolvedAction,
  BulkCommandBarResolvedUtilityAction,
  BulkCommandBarViewProps,
} from './BulkCommandBar.types';

export function BulkCommandBar({
  variant = 'list',
  density = 'comfortable',
  selectedCount,
  scope = 'page',
  summaryLabel,
  actions = [],
  overflowActions = [],
  clearSelectionAction,
  selectAllResultsAction,
}: BulkCommandBarViewProps) {
  if (selectedCount <= 0) {
    return null;
  }

  const summary = summaryLabel ?? buildDefaultSummaryLabel(selectedCount, scope);

  return (
    <section
      data-bulk-command-bar-variant={variant}
      className={[
        'rounded-lg border',
        density === 'compact' ? 'px-3 py-2.5' : 'px-4 py-3',
        variantClassName(variant),
      ].join(' ')}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <p aria-live="polite" className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <ActionButton key={action.key} action={action} emphasis="visible" />
          ))}

          {overflowActions.length > 0 ? (
            <details className="group relative">
              <summary className={overflowTriggerClassName()}>More actions</summary>
              <div className="absolute right-0 z-10 mt-2 min-w-52 space-y-1 rounded-md border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                {overflowActions.map((action) => (
                  <ActionButton key={action.key} action={action} emphasis="overflow" />
                ))}
              </div>
            </details>
          ) : null}

          {selectAllResultsAction ? <UtilityActionButton action={selectAllResultsAction} variant="secondary" /> : null}

          {clearSelectionAction ? <UtilityActionButton action={clearSelectionAction} variant="clear" /> : null}
        </div>
      </div>
    </section>
  );
}

function ActionButton({
  action,
  emphasis,
}: {
  action: BulkCommandBarResolvedAction;
  emphasis: 'visible' | 'overflow';
}) {
  const className = actionClassName(action, emphasis);

  return (
    <button
      type="button"
      disabled={action.disabled || action.loading}
      onClick={() => {
        if (action.confirm && !confirmBulkAction(action.confirm, action.label)) {
          return;
        }

        action.onClick?.();
      }}
      className={className}
    >
      {action.loading ? <InlineSpinner /> : null}
      {action.icon ? <span aria-hidden="true">{action.icon}</span> : null}
      <span>{action.label}</span>
    </button>
  );
}

function UtilityActionButton({
  action,
  variant,
}: {
  action: BulkCommandBarResolvedUtilityAction;
  variant: 'secondary' | 'clear';
}) {
  return (
    <button
      type="button"
      disabled={action.disabled}
      onClick={action.onClick}
      className={[
        'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'clear'
          ? 'text-gray-600 hover:text-gray-800 hover:underline dark:text-gray-300 dark:hover:text-gray-100'
          : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900',
      ].join(' ')}
    >
      {action.label}
    </button>
  );
}

function confirmBulkAction(confirm: BulkCommandBarConfirmView, label: string): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  const title = confirm.title ?? label;
  const description = confirm.description ?? 'Please confirm this bulk action.';
  const message = `${title}\n\n${description}`;

  return window.confirm(message);
}

function buildDefaultSummaryLabel(selectedCount: number, scope: BulkCommandBarViewProps['scope']): string {
  if (scope === 'all-results') {
    return `${selectedCount} selected across all results`;
  }

  return `${selectedCount} selected on this page`;
}

function variantClassName(variant: BulkCommandBarViewProps['variant']): string {
  switch (variant) {
    case 'section':
      return 'border-gray-200 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-900/50';
    case 'list':
    default:
      return 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950';
  }
}

function overflowTriggerClassName(): string {
  return [
    'inline-flex h-8 cursor-pointer list-none items-center justify-center rounded-md px-3 text-sm font-medium',
    'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
    'dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900',
  ].join(' ');
}

function actionClassName(action: BulkCommandBarResolvedAction, emphasis: 'visible' | 'overflow'): string {
  const base =
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50';

  if (action.variant === 'destructive') {
    return `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/40`;
  }

  if (action.variant === 'secondary' || emphasis === 'overflow') {
    return `${base} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900`;
  }

  return `${base} bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white`;
}

function InlineSpinner() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
