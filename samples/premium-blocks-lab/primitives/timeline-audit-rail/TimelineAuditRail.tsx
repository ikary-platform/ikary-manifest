import type { ReactNode } from 'react';
import type {
  TimelineAuditRailProps,
  TimelineItem,
} from './TimelineAuditRailPresentationSchema';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui';
import { SectionShell } from '../../shared/SectionShell';

export interface TimelineAuditRailSlots {
  header?: ReactNode;
  footer?: ReactNode;
  /**
   * Render-per-item trailing content (e.g. a chevron, a badge, or a quick
   * action). Called once per item with the full item shape.
   */
  itemTrailing?: (item: TimelineItem) => ReactNode;
}

export interface TimelineAuditRailViewProps extends TimelineAuditRailProps {
  slots?: TimelineAuditRailSlots;
}

const DOT_TONE: Record<NonNullable<TimelineItem['tone']>, string> = {
  default: 'bg-foreground',
  positive: 'bg-emerald-500',
  warning: 'bg-amber-500',
  negative: 'bg-rose-500',
  info: 'bg-sky-500',
};

interface GroupedItems {
  heading?: string;
  items: TimelineItem[];
}

function groupItems(items: TimelineItem[]): GroupedItems[] {
  const groups = new Map<string, TimelineItem[]>();
  const order: string[] = [];
  for (const item of items) {
    const key = item.groupHeading ?? '';
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(item);
  }
  return order.map((key) => ({ heading: key || undefined, items: groups.get(key)! }));
}

function ActorChip({ item }: { item: TimelineItem }) {
  if (!item.actor) return null;
  const initials =
    item.actorInitials ??
    item.actor
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        aria-hidden
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground"
        style={{ fontSize: 10 }}
      >
        {initials || '•'}
      </span>
      <span>{item.actor}</span>
    </span>
  );
}

export function TimelineAuditRail({
  items,
  density = 'default',
  slots,
}: TimelineAuditRailViewProps) {
  const groups = groupItems(items);
  const isEmpty = items.length === 0;
  const rowGap = density === 'compact' ? 'gap-4' : 'gap-5';

  return (
    <SectionShell>
      <Card>
        <CardHeader>
          {slots?.header ?? (
            <>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                Events affecting revenue, accounts, and pipeline.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="pb-0">
          {isEmpty ? (
            <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">No activity yet</span>
              <span>Events will show up here as they happen.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {groups.map((group, gIdx) => (
                <div key={`g-${gIdx}`} className="flex flex-col gap-3">
                  {group.heading ? (
                    <h3
                      className="text-xs font-semibold uppercase text-muted-foreground"
                      style={{ letterSpacing: '0.06em' }}
                    >
                      {group.heading}
                    </h3>
                  ) : null}
                  <ol className="relative ml-2 border-l">
                    {group.items.map((item, iIdx) => (
                      <li
                        key={item.id}
                        className={['relative flex items-start gap-3 pl-6', rowGap, iIdx === 0 ? 'pt-0' : 'pt-4'].join(' ')}
                      >
                        <span
                          aria-hidden
                          className={[
                            'absolute -left-[6px] top-1 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-background',
                            DOT_TONE[item.tone ?? 'default'],
                          ].join(' ')}
                        />
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="text-sm font-medium text-foreground">
                                {item.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {item.timestamp}
                              </span>
                            </div>
                            {slots?.itemTrailing ? (
                              <div className="shrink-0">{slots.itemTrailing(item)}</div>
                            ) : null}
                          </div>
                          {item.description ? (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          ) : null}
                          <ActorChip item={item} />
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {slots?.footer ? (
          <div className="mt-4 border-t px-6 pt-4 text-xs text-muted-foreground">
            {slots.footer}
          </div>
        ) : null}
      </Card>
    </SectionShell>
  );
}
