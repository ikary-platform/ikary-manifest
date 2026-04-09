import { z } from 'zod';

export const changeKindSchema = z.enum(['snapshot', 'patch', 'rollback']);
export type ChangeKind = z.infer<typeof changeKindSchema>;

export const auditEntrySchema = z.object({
  entityKey: z.string(),
  entityId: z.string(),
  eventType: z.string(),
  resourceVersion: z.number().int().positive(),
  changeKind: changeKindSchema,
  snapshot: z.record(z.unknown()),
  diff: z.record(z.unknown()).nullable().optional(),
});
export type AuditEntry = z.infer<typeof auditEntrySchema>;
