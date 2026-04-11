import type { ProgressViewProps } from './Progress.types';

export function Progress({ value, label, showValue = false }: ProgressViewProps) {
  const safeValue = value ?? 0;
  const isIndeterminate = value === undefined;

  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={isIndeterminate ? undefined : safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-4 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          className={[
            'h-full w-full flex-1 bg-primary transition-all',
            isIndeterminate ? 'animate-pulse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={isIndeterminate ? undefined : { transform: `translateX(-${100 - safeValue}%)` }}
        />
      </div>
      {showValue && !isIndeterminate ? (
        <span className="shrink-0 text-xs text-muted-foreground">{safeValue}%</span>
      ) : null}
    </div>
  );
}
