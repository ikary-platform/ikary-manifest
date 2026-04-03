import type { EmptyStateResolvedAction, EmptyStateViewProps } from './EmptyState.types';

export function EmptyState({
  title,
  description,
  icon,
  variant,
  density,
  primaryAction,
  secondaryAction,
}: EmptyStateViewProps) {
  const spacingClass = density === 'compact' ? 'px-4 py-4' : 'px-6 py-6';
  const titleClass = density === 'compact' ? 'text-sm' : 'text-base';
  const descriptionClass = density === 'compact' ? 'text-xs' : 'text-sm';

  return (
    <section
      data-empty-state-variant={variant}
      className={[
        'rounded-lg border border-dashed text-center',
        'bg-white dark:bg-gray-950',
        'border-gray-200 dark:border-gray-800',
        spacingClass,
      ].join(' ')}
    >
      <div className={density === 'compact' ? 'space-y-2.5' : 'space-y-3'}>
        {icon ? (
          <div
            aria-hidden="true"
            className={[
              'mx-auto inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold uppercase tracking-wide',
              iconToneClass(variant),
            ].join(' ')}
          >
            {icon}
          </div>
        ) : null}

        <div className="space-y-1">
          <h3 className={`${titleClass} font-semibold text-gray-900 dark:text-gray-100`}>{title}</h3>

          {description ? (
            <p className={`${descriptionClass} max-w-2xl mx-auto text-gray-600 dark:text-gray-400`}>{description}</p>
          ) : null}
        </div>

        {primaryAction || secondaryAction ? (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {secondaryAction ? <ActionButton action={secondaryAction} emphasis="secondary" /> : null}
            {primaryAction ? <ActionButton action={primaryAction} emphasis="primary" /> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ActionButton({ action, emphasis }: { action: EmptyStateResolvedAction; emphasis: 'primary' | 'secondary' }) {
  const className = actionClassName(emphasis);

  if (action.href) {
    return (
      <a
        href={action.href}
        aria-disabled={action.disabled ? 'true' : undefined}
        onClick={(event) => {
          if (action.disabled) {
            event.preventDefault();
            return;
          }

          action.onClick?.();
        }}
        className={[className, action.disabled ? 'pointer-events-none opacity-50' : ''].filter(Boolean).join(' ')}
      >
        {action.label}
      </a>
    );
  }

  return (
    <button type="button" onClick={action.onClick} disabled={action.disabled} className={className}>
      {action.label}
    </button>
  );
}

function iconToneClass(variant: EmptyStateViewProps['variant']): string {
  switch (variant) {
    case 'search':
    case 'filter':
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300';
    case 'relation':
    case 'section':
      return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300';
    case 'widget':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300';
    case 'initial':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
  }
}

function actionClassName(emphasis: 'primary' | 'secondary'): string {
  const base =
    'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50';

  if (emphasis === 'primary') {
    return `${base} bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white`;
  }

  return `${base} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900`;
}
