import type { ReactNode } from 'react';
import type { DashboardHeroProps } from './DashboardHeroPresentationSchema';
import { SectionShell } from '../../shared/SectionShell';

export interface DashboardHeroSlots {
  actions?: ReactNode;
  secondary?: ReactNode;
  aside?: ReactNode;
}

export interface DashboardHeroViewProps extends DashboardHeroProps {
  slots?: DashboardHeroSlots;
}

const TONE_SURFACE: Record<NonNullable<DashboardHeroProps['tone']>, string> = {
  default: '',
  subtle: 'bg-muted/40',
  emphasis: 'bg-gradient-to-br from-primary/10 via-card to-card',
};

export function DashboardHero({
  title,
  eyebrow,
  subtitle,
  meta,
  tone = 'default',
  slots,
}: DashboardHeroViewProps) {
  const hasMeta = meta && meta.length > 0;
  const toneClass = TONE_SURFACE[tone];

  return (
    <SectionShell>
      <div
        className={[
          'rounded-xl border bg-card text-card-foreground shadow-sm',
          toneClass || '',
        ].join(' ').trim()}
      >
        <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between lg:p-8">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {eyebrow ? (
              <span
                className="text-xs font-semibold uppercase text-muted-foreground"
                style={{ letterSpacing: '0.14em' }}
              >
                {eyebrow}
              </span>
            ) : null}
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
            {hasMeta ? (
              <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm">
                {meta!.map((item, idx) => (
                  <div
                    key={`${item.label}-${idx}`}
                    className="flex items-baseline gap-2"
                  >
                    <dt className="text-muted-foreground">{item.label}</dt>
                    <dd className="font-medium text-foreground">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {slots?.secondary ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {slots.secondary}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-stretch gap-4 lg:items-end">
            {slots?.actions ? (
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                {slots.actions}
              </div>
            ) : null}
            {slots?.aside ? (
              <div className="w-full rounded-lg border bg-background/60 p-4 shadow-sm lg:w-72">
                {slots.aside}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
