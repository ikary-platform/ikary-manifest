import type { ReactNode } from 'react';
import type { EntityDetailHeroProps } from './EntityDetailHeroPresentationSchema';
import { SectionShell } from '../../shared/SectionShell';

export interface EntityDetailHeroSlots {
  actions?: ReactNode;
  badges?: ReactNode;
  aside?: ReactNode;
  facts?: ReactNode;
}

export interface EntityDetailHeroViewProps extends EntityDetailHeroProps {
  slots?: EntityDetailHeroSlots;
}

const STATUS_TONE: Record<
  NonNullable<NonNullable<EntityDetailHeroProps['status']>['tone']>,
  string
> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  positive:
    'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
  warning:
    'bg-amber-500/10 text-amber-800 border-amber-500/30 dark:text-amber-200',
  danger:
    'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300',
};

function Avatar({ url, fallback }: { url?: string; fallback?: string }) {
  const initials = (fallback ?? '').trim().slice(0, 2).toUpperCase() || '•';
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-primary/10 text-lg font-semibold text-primary">
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}

export function EntityDetailHero({
  name,
  subtitle,
  avatarUrl,
  avatarFallback,
  status,
  slots,
}: EntityDetailHeroViewProps) {
  const hasSecondary = slots?.facts || slots?.aside;
  return (
    <SectionShell>
      <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <Avatar url={avatarUrl} fallback={avatarFallback ?? name} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="truncate text-xl lg:text-2xl font-semibold tracking-tight">
                  {name}
                </h1>
                {status ? (
                  <span
                    className={[
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      STATUS_TONE[status.tone ?? 'neutral'],
                    ].join(' ')}
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-current"
                    />
                    {status.label}
                  </span>
                ) : null}
              </div>
              {subtitle ? (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
              {slots?.badges ? (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {slots.badges}
                </div>
              ) : null}
            </div>
          </div>

          {slots?.actions ? (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {slots.actions}
            </div>
          ) : null}
        </div>

        {hasSecondary ? (
          <>
            <div className="h-px w-full bg-border" />
            <div className="grid gap-4 p-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              {slots?.facts ? (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm lg:grid-cols-3">
                  {slots.facts}
                </dl>
              ) : (
                <span />
              )}
              {slots?.aside ? (
                <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                  {slots.aside}
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </SectionShell>
  );
}

export function EntityFact({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
