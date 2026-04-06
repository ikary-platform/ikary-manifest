import type { LoadingStateViewProps } from './LoadingState.types';

export function LoadingState({ variant, density, mode, label, description, skeleton }: LoadingStateViewProps) {
  const showSkeleton = mode === 'skeleton' || mode === 'mixed';
  const showSpinner = mode === 'spinner' || mode === 'mixed';

  return (
    <section
      data-loading-state-variant={variant}
      data-loading-state-mode={mode}
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={containerClassName(variant, density)}
    >
      <span className="sr-only">{label ?? 'Loading'}</span>

      <div className={contentClassName(variant, density)}>
        {showSkeleton ? <SkeletonLayout skeleton={skeleton} density={density} inline={variant === 'inline'} /> : null}

        {showSpinner ? <Spinner density={density} inline={variant === 'inline'} /> : null}

        {label || description ? (
          <div className={variant === 'inline' ? 'space-y-0.5' : 'space-y-1'}>
            {label ? <div className={labelClassName(density)}>{label}</div> : null}
            {description ? <div className={descriptionClassName(density)}>{description}</div> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Spinner({ density, inline }: { density: LoadingStateViewProps['density']; inline: boolean }) {
  const sizeClass = density === 'compact' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <span className={inline ? 'inline-flex shrink-0' : 'inline-flex mx-auto'}>
      <span
        aria-hidden="true"
        className={[
          sizeClass,
          'animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300',
        ].join(' ')}
      />
    </span>
  );
}

function SkeletonLayout({
  skeleton,
  density,
  inline,
}: {
  skeleton: LoadingStateViewProps['skeleton'];
  density: LoadingStateViewProps['density'];
  inline: boolean;
}) {
  const lineCount = skeleton?.lines ?? (density === 'compact' ? 3 : 4);
  const blockCount = skeleton?.blocks ?? 1;
  const showAvatar = skeleton?.avatar ?? false;

  return (
    <div className={inline ? 'min-w-[140px]' : 'w-full space-y-3'}>
      <div
        className={[inline ? 'flex items-center gap-2' : 'flex items-start gap-3', inline ? '' : 'w-full']
          .filter(Boolean)
          .join(' ')}
      >
        {showAvatar ? (
          <span
            aria-hidden="true"
            className={[
              density === 'compact' ? 'h-7 w-7' : 'h-9 w-9',
              'shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800',
            ].join(' ')}
          />
        ) : null}

        <div className={inline ? 'w-28 space-y-1.5' : 'w-full space-y-2'}>
          {Array.from({ length: lineCount }).map((_, index) => (
            <span
              key={`line-${index + 1}`}
              aria-hidden="true"
              className={[
                density === 'compact' ? 'h-2.5' : 'h-3',
                'block animate-pulse rounded bg-gray-200 dark:bg-gray-800',
                lineWidthClass(index),
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      {!inline
        ? Array.from({ length: blockCount }).map((_, index) => (
            <span
              key={`block-${index + 1}`}
              aria-hidden="true"
              className={[
                density === 'compact' ? 'h-12' : 'h-16',
                'block w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-800',
              ].join(' ')}
            />
          ))
        : null}
    </div>
  );
}

function containerClassName(
  variant: LoadingStateViewProps['variant'],
  density: LoadingStateViewProps['density'],
): string {
  const base = 'w-full';
  const spacing = spacingClassName(variant, density);

  switch (variant) {
    case 'page':
      return `${base} ${spacing} rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950`;
    case 'card':
      return `${base} ${spacing} rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950`;
    case 'inline':
      return `${base} ${spacing}`;
    case 'overlay':
      return `${base} ${spacing} rounded-lg border border-gray-200/80 bg-white/75 backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-950/75`;
    case 'section':
    default:
      return `${base} ${spacing} rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950`;
  }
}

function contentClassName(
  variant: LoadingStateViewProps['variant'],
  density: LoadingStateViewProps['density'],
): string {
  if (variant === 'inline') {
    return density === 'compact' ? 'flex items-center gap-2' : 'flex items-center gap-3';
  }

  return density === 'compact' ? 'space-y-2.5' : 'space-y-3';
}

function spacingClassName(
  variant: LoadingStateViewProps['variant'],
  density: LoadingStateViewProps['density'],
): string {
  if (variant === 'inline') {
    return density === 'compact' ? 'py-1' : 'py-1.5';
  }

  return density === 'compact' ? 'px-4 py-3' : 'px-5 py-4';
}

function labelClassName(density: LoadingStateViewProps['density']): string {
  return density === 'compact'
    ? 'text-xs font-medium text-gray-700 dark:text-gray-300'
    : 'text-sm font-medium text-gray-700 dark:text-gray-300';
}

function descriptionClassName(density: LoadingStateViewProps['density']): string {
  return density === 'compact'
    ? 'text-xs text-gray-500 dark:text-gray-400'
    : 'text-sm text-gray-500 dark:text-gray-400';
}

function lineWidthClass(index: number): string {
  const widths = ['w-full', 'w-11/12', 'w-10/12', 'w-9/12'];
  return widths[index % widths.length];
}
