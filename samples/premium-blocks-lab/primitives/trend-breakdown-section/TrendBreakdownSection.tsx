import type { ReactNode } from 'react';
import type { TrendBreakdownSectionProps } from './TrendBreakdownSectionPresentationSchema';
import { DefaultAreaChart, DefaultSegmentedControl } from './DefaultAreaChart';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui';
import { SectionShell } from '../../shared/SectionShell';

export interface TrendBreakdownSectionSlots {
  header?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  chart?: ReactNode;
  breakdown?: ReactNode;
}

export interface TrendBreakdownSectionViewProps extends TrendBreakdownSectionProps {
  slots?: TrendBreakdownSectionSlots;
}

export function TrendBreakdownSection({
  title,
  subtitle,
  breakdownPosition = 'right',
  slots,
}: TrendBreakdownSectionViewProps) {
  const chartContent = slots?.chart ?? <DefaultAreaChart />;
  const asideContent = slots?.aside ?? <DefaultSegmentedControl />;
  const hasBreakdown = Boolean(slots?.breakdown);
  const breakdownFirst = breakdownPosition === 'left';

  return (
    <SectionShell>
      <Card>
        <CardHeader>
          {slots?.header ?? (
            <>
              {title ? <CardTitle>{title}</CardTitle> : null}
              {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
            </>
          )}
          <CardAction>{asideContent}</CardAction>
        </CardHeader>

        <CardContent>
          <div
            className={[
              'grid gap-6',
              hasBreakdown
                ? 'grid-cols-1 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]'
                : 'grid-cols-1',
            ].join(' ')}
          >
            {breakdownFirst && hasBreakdown ? (
              <BreakdownShell>{slots!.breakdown}</BreakdownShell>
            ) : null}
            <div className="min-w-0">{chartContent}</div>
            {!breakdownFirst && hasBreakdown ? (
              <BreakdownShell>{slots!.breakdown}</BreakdownShell>
            ) : null}
          </div>
        </CardContent>

        {slots?.footer ? (
          <div className="border-t px-6 pt-4 text-xs text-muted-foreground">
            {slots.footer}
          </div>
        ) : null}
      </Card>
    </SectionShell>
  );
}

function BreakdownShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[220px] flex-col gap-2 rounded-lg border bg-muted/40 p-4">
      {children}
    </div>
  );
}
