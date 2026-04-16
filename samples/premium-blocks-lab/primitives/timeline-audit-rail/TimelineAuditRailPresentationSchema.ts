import { z } from 'zod';

export const TimelineItemSchema = z
  .object({
    id: z.string().min(1),
    timestamp: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    actor: z.string().optional(),
    actorInitials: z.string().max(4).optional(),
    tone: z
      .enum(['default', 'positive', 'warning', 'negative', 'info'])
      .default('default'),
    groupHeading: z.string().optional(),
  })
  .strict();

export const TimelineAuditRailPresentationSchema = z
  .object({
    items: z.array(TimelineItemSchema),
    density: z.enum(['default', 'compact']).default('default'),
  })
  .strict();

export type TimelineAuditRailProps = z.infer<typeof TimelineAuditRailPresentationSchema>;
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
