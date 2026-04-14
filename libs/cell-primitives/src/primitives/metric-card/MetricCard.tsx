import { RenderStateBoundary } from '../../runtime/RenderStateBoundary';
import type { MetricCardViewProps } from './MetricCard.types';

export function MetricCard({
  variant = 'default',
  density = 'comfortable',
  label,
  value,
  subtitle,
  delta,
  deltaDirection,
  tone = 'default',
  icon,
  action,
  renderState,
}: MetricCardViewProps) {
  const paddingClass = resolvePaddingClassName(variant, density);

  return (
    <section
      data-metric-card-variant={variant}
      data-metric-card-density={density}
      data-metric-card-tone={tone}
      className={resolveContainerClassName(variant, tone)}
    >
      <div className={`${paddingClass} space-y-3`}>
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="inline-flex items-center gap-1.5">
              {icon ? (
                <span
                  aria-hidden="true"
                  className={[
                    'inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 text-[9px] font-semibold uppercase tracking-wide',
                    resolveIconClassName(tone),
                  ].join(' ')}
                >
                  {icon}
                </span>
              ) : null}
              <h3 className={resolveLabelClassName(variant, density)}>{label}</h3>
            </div>
          </div>

          {action ? <CardAction action={action} /> : null}
        </header>

        <div className="space-y-1">
          <RenderStateBoundary state={renderState}>
            <MetricCardContent
              value={value}
              delta={delta}
              deltaDirection={deltaDirection}
              subtitle={subtitle}
              tone={tone}
              variant={variant}
              density={density}
            />
          </RenderStateBoundary>
        </div>
      </div>
    </section>
  );
}

function MetricCardContent({
  value,
  delta,
  deltaDirection,
  subtitle,
  tone,
  variant,
  density,
}: {
  value: string;
  delta?: string;
  deltaDirection?: MetricCardViewProps['deltaDirection'];
  subtitle?: string;
  tone: MetricCardViewProps['tone'];
  variant: MetricCardViewProps['variant'];
  density: MetricCardViewProps['density'];
}) {
  return (
    <>
      <div className={resolveValueClassName(variant, density, tone)}>{value}</div>

      {delta ? (
        <div
          className={[
            'inline-flex items-center gap-1.5 text-xs font-medium',
            resolveDeltaClassName(deltaDirection, tone),
          ].join(' ')}
          aria-label={resolveDeltaLabel(delta, deltaDirection)}
        >
          <span aria-hidden="true">{resolveDeltaGlyph(deltaDirection)}</span>
          <span>{delta}</span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {resolveDeltaDirectionText(deltaDirection)}
          </span>
        </div>
      ) : null}

      {subtitle ? <p className={resolveSubtitleClassName(density)}>{subtitle}</p> : null}
    </>
  );
}

function CardAction({ action }: { action: NonNullable<MetricCardViewProps['action']> }) {
  const className = [
    'inline-flex h-7 items-center justify-center rounded-md px-2.5 text-xs font-medium',
    'border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900',
  ].join(' ');

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
        className={[className, action.disabled ? 'pointer-events-none' : ''].join(' ')}
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

function resolveContainerClassName(variant: MetricCardViewProps['variant'], tone: MetricCardViewProps['tone']): string {
  const base = 'rounded-lg border bg-white dark:bg-gray-950';

  if (variant === 'emphasis') {
    return [base, 'shadow-sm', toneBorderClassName(tone)].join(' ');
  }

  return [base, 'border-gray-200 dark:border-gray-800'].join(' ');
}

function toneBorderClassName(tone: MetricCardViewProps['tone']): string {
  switch (tone) {
    case 'success':
      return 'border-emerald-300 dark:border-emerald-800';
    case 'warning':
      return 'border-amber-300 dark:border-amber-800';
    case 'danger':
      return 'border-red-300 dark:border-red-800';
    case 'info':
      return 'border-blue-300 dark:border-blue-800';
    case 'default':
    default:
      return 'border-gray-300 dark:border-gray-700';
  }
}

function resolvePaddingClassName(
  variant: MetricCardViewProps['variant'],
  density: MetricCardViewProps['density'],
): string {
  if (density === 'compact') {
    return variant === 'compact' ? 'p-3' : 'p-3.5';
  }

  return variant === 'compact' ? 'p-3.5' : 'p-4';
}

function resolveLabelClassName(
  variant: MetricCardViewProps['variant'],
  density: MetricCardViewProps['density'],
): string {
  if (variant === 'compact' || density === 'compact') {
    return 'text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400';
  }

  return 'text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400';
}

function resolveValueClassName(
  variant: MetricCardViewProps['variant'],
  density: MetricCardViewProps['density'],
  tone: MetricCardViewProps['tone'],
): string {
  const sizeClass =
    variant === 'compact' || density === 'compact' ? 'text-xl' : variant === 'emphasis' ? 'text-3xl' : 'text-2xl';

  return [sizeClass, 'font-semibold tabular-nums', resolveValueToneClassName(tone)].join(' ');
}

function resolveValueToneClassName(tone: MetricCardViewProps['tone']): string {
  switch (tone) {
    case 'success':
      return 'text-emerald-700 dark:text-emerald-300';
    case 'warning':
      return 'text-amber-700 dark:text-amber-300';
    case 'danger':
      return 'text-red-700 dark:text-red-300';
    case 'info':
      return 'text-blue-700 dark:text-blue-300';
    case 'default':
    default:
      return 'text-gray-900 dark:text-gray-100';
  }
}

function resolveDeltaClassName(
  direction: MetricCardViewProps['deltaDirection'],
  tone: MetricCardViewProps['tone'],
): string {
  if (direction === 'up') {
    return tone === 'default' ? 'text-emerald-700 dark:text-emerald-300' : resolveValueToneClassName(tone);
  }

  if (direction === 'down') {
    return tone === 'default' ? 'text-red-700 dark:text-red-300' : resolveValueToneClassName(tone);
  }

  return 'text-gray-600 dark:text-gray-300';
}

function resolveDeltaGlyph(direction: MetricCardViewProps['deltaDirection']): string {
  if (direction === 'up') return '▲';
  if (direction === 'down') return '▼';
  return '●';
}

function resolveDeltaDirectionText(direction: MetricCardViewProps['deltaDirection']): string {
  if (direction === 'up') return 'Up';
  if (direction === 'down') return 'Down';
  return 'No change';
}

function resolveDeltaLabel(delta: string, direction: MetricCardViewProps['deltaDirection']): string {
  return `${resolveDeltaDirectionText(direction)}: ${delta}`;
}

function resolveSubtitleClassName(density: MetricCardViewProps['density']): string {
  return density === 'compact'
    ? 'text-xs text-gray-500 dark:text-gray-400'
    : 'text-sm text-gray-500 dark:text-gray-400';
}

function resolveIconClassName(tone: MetricCardViewProps['tone']): string {
  switch (tone) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    case 'danger':
      return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300';
    case 'info':
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300';
    case 'default':
    default:
      return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300';
  }
}
