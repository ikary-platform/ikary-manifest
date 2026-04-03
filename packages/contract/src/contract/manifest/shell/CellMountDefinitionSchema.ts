import { z } from 'zod';

export const CellMountDefinitionSchema = z
  .object({
    title: z.string().min(1).optional(),
    mountPath: z.string().min(1),
    landingPage: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.mountPath.startsWith('/')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mountPath'],
        message: 'mountPath must start with "/"',
      });
    }
  });

export type CellMountDefinition = z.infer<typeof CellMountDefinitionSchema>;
