/**
 * LifecycleDefinitionSchema
 * Purpose: validates lifecycle state-machine configuration on an entity.
 */
import { z } from 'zod';
import { LifecycleTransitionDefinitionSchema } from '../../manifest/lifecycle/LifecycleTransitionDefinitionSchema';

export const LifecycleDefinitionSchema = z
  .object({
    field: z.string().min(1),
    initial: z.string().min(1),
    states: z.array(z.string().min(1)).min(1),
    transitions: z.array(LifecycleTransitionDefinitionSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    // states must be unique
    if (new Set(value.states).size !== value.states.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['states'],
        message: 'states must be unique',
      });
    }

    // initial must be one of the declared states
    if (!value.states.includes(value.initial)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['initial'],
        message: 'initial must be one of the declared lifecycle states',
      });
    }

    // transition keys must be unique
    const transitionKeys = value.transitions.map((t) => t.key);
    if (new Set(transitionKeys).size !== transitionKeys.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['transitions'],
        message: 'transition keys must be unique',
      });
    }

    // transitions must reference declared states
    value.transitions.forEach((transition, index) => {
      if (!value.states.includes(transition.from)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['transitions', index, 'from'],
          message: `transition.from must be one of: ${value.states.join(', ')}`,
        });
      }

      if (!value.states.includes(transition.to)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['transitions', index, 'to'],
          message: `transition.to must be one of: ${value.states.join(', ')}`,
        });
      }
    });

    // optional: prevent duplicate from->to transitions
    const seenPairs = new Set<string>();
    value.transitions.forEach((transition, index) => {
      const pair = `${transition.from}::${transition.to}`;
      if (seenPairs.has(pair)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['transitions', index],
          message: `duplicate transition "${transition.from}" -> "${transition.to}"`,
        });
      }
      seenPairs.add(pair);
    });
  });

export type LifecycleDefinition = z.infer<typeof LifecycleDefinitionSchema>;
