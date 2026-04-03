import { z } from 'zod';
import { CapabilityInputTypeSchema } from './CapabilityInputTypeSchema';

const CapabilityInputBaseSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1).optional(),
  required: z.boolean().optional(),
});

const StringCapabilityInputSchema = CapabilityInputBaseSchema.extend({
  type: z.literal('string'),
  defaultValue: z.string().optional(),
}).strict();

const TextCapabilityInputSchema = CapabilityInputBaseSchema.extend({
  type: z.literal('text'),
  defaultValue: z.string().optional(),
}).strict();

const NumberCapabilityInputSchema = CapabilityInputBaseSchema.extend({
  type: z.literal('number'),
  defaultValue: z.number().optional(),
}).strict();

const BooleanCapabilityInputSchema = CapabilityInputBaseSchema.extend({
  type: z.literal('boolean'),
  defaultValue: z.boolean().optional(),
}).strict();

const DateCapabilityInputSchema = CapabilityInputBaseSchema.extend({
  type: z.literal('date'),
  defaultValue: z.string().min(1).optional(),
}).strict();

const SelectCapabilityInputSchema = CapabilityInputBaseSchema.extend({
  type: z.literal('select'),
  options: z
    .array(z.string().min(1))
    .min(1)
    .refine((values) => new Set(values).size === values.length, 'options must be unique'),
  defaultValue: z.string().min(1).optional(),
}).strict();

const EntityCapabilityInputSchema = CapabilityInputBaseSchema.extend({
  type: z.literal('entity'),
  entity: z.string().min(1),
  defaultValue: z.string().min(1).optional(),
}).strict();

export const CapabilityInputDefinitionSchema = z
  .discriminatedUnion('type', [
    StringCapabilityInputSchema,
    TextCapabilityInputSchema,
    NumberCapabilityInputSchema,
    BooleanCapabilityInputSchema,
    DateCapabilityInputSchema,
    SelectCapabilityInputSchema,
    EntityCapabilityInputSchema,
  ])
  .superRefine((value, ctx) => {
    if (value.type === 'select') {
      if (value.defaultValue && !value.options.includes(value.defaultValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['defaultValue'],
          message: 'defaultValue must be one of the declared options',
        });
      }
    }
  });

export type CapabilityInputDefinition = z.infer<typeof CapabilityInputDefinitionSchema>;

export type CapabilityInputType = z.infer<typeof CapabilityInputTypeSchema>;
