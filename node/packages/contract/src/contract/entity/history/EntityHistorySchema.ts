import { z } from 'zod';

export const FieldDiffKindSchema = z.enum(['modified', 'added', 'removed']);

export const FieldDiffSchema = z
  .object({
    fieldKey: z.string().min(1),
    fieldName: z.string().min(1),
    before: z.unknown(),
    after: z.unknown(),
    kind: FieldDiffKindSchema,
  })
  .strict();

export const EntityVersionSchema = z
  .object({
    version: z.number().int().positive(),
    data: z.record(z.unknown()),
    updatedAt: z.string().min(1),
    updatedBy: z.string().min(1),
    diff: z.array(FieldDiffSchema),
  })
  .strict();

export const AuditEventTypeSchema = z.enum(['entity.created', 'entity.updated', 'entity.deleted', 'entity.rollback']);

export const AuditEventSchema = z
  .object({
    id: z.string().min(1),
    timestamp: z.string().min(1),
    actor: z.string().min(1),
    eventType: AuditEventTypeSchema,
    entityKey: z.string().min(1),
    entityId: z.string().min(1),
    version: z.number().int().positive(),
    description: z.string().min(1),
    diff: z.array(FieldDiffSchema),
  })
  .strict();

export type FieldDiff = z.infer<typeof FieldDiffSchema>;
export type EntityVersion = z.infer<typeof EntityVersionSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
