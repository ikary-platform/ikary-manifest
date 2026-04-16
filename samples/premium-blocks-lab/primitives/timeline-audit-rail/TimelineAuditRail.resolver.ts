import {
  TimelineAuditRailPresentationSchema,
  type TimelineAuditRailProps,
} from './TimelineAuditRailPresentationSchema';

export function resolveTimelineAuditRail(
  props: TimelineAuditRailProps & { __slotContext?: unknown },
): TimelineAuditRailProps {
  const { __slotContext, ...rest } = props as Record<string, unknown>;
  return TimelineAuditRailPresentationSchema.parse(rest);
}
