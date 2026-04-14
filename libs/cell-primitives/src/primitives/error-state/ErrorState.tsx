import type { ErrorStateResolvedAction, ErrorStateTechnicalDetailsView, ErrorStateViewProps } from './ErrorState.types';

export function ErrorState({
  title,
  description,
  icon,
  variant,
  severity,
  retryAction,
  secondaryAction,
  technicalDetails,
}: ErrorStateViewProps) {
  const spacingClass = variant === 'inline' ? 'px-0 py-0' : 'px-5 py-4';
  const titleClass = variant === 'inline' ? 'text-sm' : 'text-base';
  const descriptionClass = variant === 'inline' ? 'text-xs' : 'text-sm';

  return (
    <section
      data-error-state-variant={variant}
      data-error-state-severity={severity}
      role={severity === 'blocking' ? 'alert' : 'status'}
      aria-live={severity === 'blocking' ? 'assertive' : 'polite'}
      className={containerClassName(variant, severity, spacingClass)}
    >
      <div className={variant === 'inline' ? 'space-y-2' : 'space-y-3'}>
        {icon ? (
          <div
            aria-hidden="true"
            className={[
              'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold uppercase tracking-wide',
              iconToneClass(variant),
            ].join(' ')}
          >
            {icon}
          </div>
        ) : null}

        <div className="space-y-1">
          <h3 className={`${titleClass} font-semibold text-gray-900 dark:text-gray-100`}>{title}</h3>

          {description ? <p className={`${descriptionClass} text-gray-600 dark:text-gray-400`}>{description}</p> : null}
        </div>

        {retryAction || secondaryAction ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {secondaryAction ? <ActionButton action={secondaryAction} emphasis="secondary" /> : null}
            {retryAction ? <ActionButton action={retryAction} emphasis="primary" /> : null}
          </div>
        ) : null}

        {technicalDetails ? <TechnicalDetails details={technicalDetails} /> : null}
      </div>
    </section>
  );
}

function ActionButton({ action, emphasis }: { action: ErrorStateResolvedAction; emphasis: 'primary' | 'secondary' }) {
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

function TechnicalDetails({ details }: { details: ErrorStateTechnicalDetailsView }) {
  return (
    <details className="rounded-md border border-gray-200 dark:border-gray-700">
      <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300">
        Technical details
      </summary>
      <div className="space-y-1.5 border-t border-gray-200 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
        {details.code ? (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Code:</span> {details.code}
          </div>
        ) : null}
        {details.correlationId ? (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Correlation ID:</span>{' '}
            {details.correlationId}
          </div>
        ) : null}
        {details.message ? (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Message:</span> {details.message}
          </div>
        ) : null}
      </div>
    </details>
  );
}

function containerClassName(
  variant: ErrorStateViewProps['variant'],
  severity: ErrorStateViewProps['severity'],
  spacingClass: string,
): string {
  if (variant === 'inline') {
    return `w-full ${spacingClass}`;
  }

  const severityTone =
    severity === 'soft'
      ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20'
      : 'border-red-200 bg-red-50/70 dark:border-red-900 dark:bg-red-950/25';

  return ['w-full rounded-lg border', severityTone, spacingClass].join(' ');
}

function iconToneClass(variant: ErrorStateViewProps['variant']): string {
  switch (variant) {
    case 'network':
      return 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
    case 'notFound':
      return 'border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300';
    case 'unexpected':
    case 'page':
    case 'section':
    case 'inline':
    default:
      return 'border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300';
  }
}

function actionClassName(emphasis: 'primary' | 'secondary'): string {
  const base =
    'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50';

  if (emphasis === 'primary') {
    return `${base} bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white`;
  }

  return `${base} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900`;
}
