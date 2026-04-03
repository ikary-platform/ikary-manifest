import { z } from 'zod';

export const LifecycleTransitionDefinitionSchema = z
  .object({
    key: z.string().min(1),
    from: z.string().min(1),
    to: z.string().min(1),
    label: z.string().min(1).optional(),
    guards: z.array(z.string().min(1)).optional(),
    hooks: z.array(z.string().min(1)).optional(),
    event: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.guards && new Set(value.guards).size !== value.guards.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['guards'],
        message: 'guards must be unique',
      });
    }

    if (value.hooks && new Set(value.hooks).size !== value.hooks.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['hooks'],
        message: 'hooks must be unique',
      });
    }
  });

export type LifecycleTransitionDefinition = z.infer<typeof LifecycleTransitionDefinitionSchema>;
