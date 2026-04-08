import type { PageHeaderMetaItem, PageHeaderResolvedAction, PageHeaderViewProps } from './PageHeader.types';
import { buildFieldValueViewModel } from '../field-value/FieldValue.adapter';
import { FieldValue } from '../field-value/FieldValue';

export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs = [],
  meta = [],
  primaryAction,
  secondaryActions = [],
  lowerSlot,
  dense = false,
}: PageHeaderViewProps) {
  const visibleSecondaryActions = secondaryActions.filter((action) => !action.hidden);
  const visiblePrimaryAction = primaryAction && !primaryAction.hidden ? primaryAction : undefined;

  const topPadding = dense ? 'py-4' : 'py-5';
  const gapClass = dense ? 'gap-3' : 'gap-4';

  return (
    <header className={`border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 ${topPadding}`}>
      <div className="space-y-4">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="px-4 sm:px-6">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <li key={item.key} className="flex items-center gap-1">
                    {item.href && !isLast ? (
                      <a
                        href={item.href}
                        className="rounded-sm hover:text-gray-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:hover:text-gray-200"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className={isLast ? 'font-medium text-gray-700 dark:text-gray-200' : undefined}>
                        {item.label}
                      </span>
                    )}

                    {!isLast && <span aria-hidden="true">/</span>}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <div className={`flex flex-col justify-between px-4 sm:px-6 lg:flex-row lg:items-start ${gapClass}`}>
          <div className="min-w-0 flex-1 space-y-2">
            {eyebrow && (
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                {eyebrow}
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">{title}</h1>

              {description && <p className="max-w-3xl text-sm text-gray-600 dark:text-gray-400">{description}</p>}
            </div>

            {meta.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {meta.map((item) => (
                  <MetaItemView key={item.key} item={item} dense={dense} />
                ))}
              </div>
            )}
          </div>

          {(visiblePrimaryAction || visibleSecondaryActions.length > 0) && (
            <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 lg:justify-end">
              {visibleSecondaryActions.map((action) => (
                <ActionButton key={action.key} action={action} variant="secondary" />
              ))}

              {visiblePrimaryAction && <ActionButton action={visiblePrimaryAction} variant="primary" />}
            </div>
          )}
        </div>

        {lowerSlot?.content && (
          <div className="border-t border-gray-100 px-4 pt-3 dark:border-gray-800 sm:px-6">{lowerSlot.content}</div>
        )}
      </div>
    </header>
  );
}

function MetaItemView({ item, dense }: { item: PageHeaderMetaItem; dense: boolean }) {
  if (item.type === 'badge') {
    const viewModel = buildFieldValueViewModel({
      presentation: {
        type: 'field-value',
        valueType: 'badge',
        tone: item.tone,
        dense,
      },
      value: item.label,
    });

    return <FieldValue {...viewModel} />;
  }

  return <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>;
}

function ActionButton({ action, variant }: { action: PageHeaderResolvedAction; variant: 'primary' | 'secondary' }) {
  const className = resolveActionClassName(action, variant);

  if (action.href) {
    return (
      <a
        href={action.href}
        aria-disabled={action.disabled ? 'true' : undefined}
        onClick={(event) => {
          if (action.disabled) {
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
    <button type="button" onClick={action.onClick} disabled={action.disabled} className={className}>
      {action.label}
    </button>
  );
}

function resolveActionClassName(action: PageHeaderResolvedAction, variant: 'primary' | 'secondary'): string {
  const base =
    'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50';

  if (variant === 'primary') {
    if (action.intent === 'danger') {
      return `${base} bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600`;
    }

    return `${base} bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white`;
  }

  if (action.intent === 'danger') {
    return `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/40`;
  }

  return `${base} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900`;
}
