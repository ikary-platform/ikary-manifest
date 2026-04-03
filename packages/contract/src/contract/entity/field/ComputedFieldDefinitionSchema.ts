import { z } from 'zod';
import { snakeCaseKeySchema } from '../../../shared/identifiers';

const ComputedValueTypeSchema = z.enum(['number', 'string', 'boolean', 'date', 'datetime']);

const AggregationOperationSchema = z.enum(['sum', 'count', 'avg', 'min', 'max']);

const ComputedFieldBaseSchema = z.object({
  key: snakeCaseKeySchema,
  name: z.string().min(1),
  type: ComputedValueTypeSchema,
  helpText: z.string().optional(),
  dependencies: z
    .array(z.string().min(1))
    .optional()
    .refine((deps) => !deps || new Set(deps).size === deps.length, 'dependencies must be unique'),
});

const ExpressionComputedFieldSchema = ComputedFieldBaseSchema.extend({
  formulaType: z.literal('expression'),
  expression: z.string().min(1),
}).strict();

const ConditionalComputedFieldSchema = ComputedFieldBaseSchema.extend({
  formulaType: z.literal('conditional'),
  condition: z.string().min(1),
  then: z.string().min(1),
  else: z.string().min(1),
}).strict();

const AggregationComputedFieldSchema = ComputedFieldBaseSchema.extend({
  formulaType: z.literal('aggregation'),
  relation: z.string().min(1),
  operation: AggregationOperationSchema,
  field: z.string().min(1).optional(),
  filter: z.string().min(1).optional(),
}).strict();

export const ComputedFieldDefinitionSchema = z
  .discriminatedUnion('formulaType', [
    ExpressionComputedFieldSchema,
    ConditionalComputedFieldSchema,
    AggregationComputedFieldSchema,
  ])
  .superRefine((value, ctx) => {
    if (value.formulaType !== 'aggregation') return;

    // field requirement
    if (['sum', 'avg', 'min', 'max'].includes(value.operation) && !value.field) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['field'],
        message: `field is required when operation is "${value.operation}"`,
      });
    }

    // type compatibility
    if (value.operation === 'count' && value.type !== 'number') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['type'],
        message: 'type must be "number" when operation is "count"',
      });
    }

    if (['sum', 'avg'].includes(value.operation) && value.type !== 'number') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['type'],
        message: `type must be "number" when operation is "${value.operation}"`,
      });
    }

    if (['min', 'max'].includes(value.operation)) {
      const allowedTypes: Array<z.infer<typeof ComputedValueTypeSchema>> = ['number', 'date', 'datetime', 'string'];

      if (!allowedTypes.includes(value.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['type'],
          message: `type must be one of ${allowedTypes.join(', ')} when operation is "${value.operation}"`,
        });
      }
    }
  });

export type ComputedFieldDefinition = z.infer<typeof ComputedFieldDefinitionSchema>;
