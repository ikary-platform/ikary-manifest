import type { ReactNode } from 'react';
import type { KpiClusterProps, KpiItem } from './KpiClusterPresentationSchema';
import {
  Badge,
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  IconMinus,
  IconTrendingDown,
  IconTrendingUp,
} from '../../shared/ui';
import { SectionShell } from '../../shared/SectionShell';

export interface KpiClusterSlots {
  actions?: ReactNode;
  footer?: ReactNode;
}

export interface KpiClusterViewProps extends KpiClusterProps {
  slots?: KpiClusterSlots;
}

const COLS: Record<NonNullable<KpiClusterProps['columns']>, string> = {
  auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

function TrendIcon({
  direction,
  size = 14,
}: {
  direction: 'up' | 'down' | 'neutral';
  size?: number;
}) {
  if (direction === 'up') return <IconTrendingUp size={size} />;
  if (direction === 'down') return <IconTrendingDown size={size} />;
  return <IconMinus size={size} />;
}

function KpiCard({ kpi }: { kpi: KpiItem }) {
  const trend = kpi.trend;
  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card dark:bg-card">
      <CardHeader>
        <CardDescription>{kpi.label}</CardDescription>
        <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
          {kpi.value}
        </CardTitle>
        {trend ? (
          <CardAction>
            <Badge variant="outline">
              <TrendIcon direction={trend.direction} size={12} />
              {trend.value}
            </Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      {(kpi.description || kpi.helper) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {kpi.description ? (
            <div className="line-clamp-1 flex gap-2 font-medium">
              {kpi.description}
              {trend ? <TrendIcon direction={trend.direction} size={16} /> : null}
            </div>
          ) : null}
          {kpi.helper ? (
            <div className="text-muted-foreground">{kpi.helper}</div>
          ) : null}
        </CardFooter>
      )}
    </Card>
  );
}

export function KpiCluster({
  title,
  kpis,
  columns = 'auto',
  slots,
}: KpiClusterViewProps) {
  return (
    <SectionShell>
      {(title || slots?.actions) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title ? (
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          ) : (
            <span />
          )}
          {slots?.actions ? (
            <div className="flex items-center gap-2">{slots.actions}</div>
          ) : null}
        </div>
      )}
      <div className={['grid gap-4', COLS[columns]].join(' ')}>
        {kpis.map((kpi, idx) => (
          <KpiCard key={`${kpi.label}-${idx}`} kpi={kpi} />
        ))}
      </div>
      {slots?.footer ? (
        <div className="mt-3 text-xs text-muted-foreground">{slots.footer}</div>
      ) : null}
    </SectionShell>
  );
}
