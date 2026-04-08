import { z } from 'zod';

export const sortDirSchema = z.enum(['asc', 'desc']);

export const filterOperatorSchema = z.enum([
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'contains',
  'startsWith',
  'endsWith',
  'in',
  'notIn',
  'isNull',
  'isNotNull',
]);

export const filterRuleSchema = z.object({
  field: z.string().min(1),
  operator: filterOperatorSchema,
  value: z.unknown().optional(),
});

export const filterGroupSchema: z.ZodType<FilterGroup> = z.lazy(() =>
  z.object({
    logic: z.enum(['and', 'or']),
    rules: z.array(z.union([filterRuleSchema, filterGroupSchema])),
  }),
);

export const entityListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortField: z.string().min(1).optional(),
  sortDir: sortDirSchema.optional(),
  search: z.string().optional(),
  filter: z.preprocess((v) => (typeof v === 'string' ? JSON.parse(v) : v), filterGroupSchema).optional(),
});

export type SortDir = z.infer<typeof sortDirSchema>;
export type FilterOperator = z.infer<typeof filterOperatorSchema>;
export type FilterRule = z.infer<typeof filterRuleSchema>;
export interface FilterGroup {
  logic: 'and' | 'or';
  rules: Array<FilterRule | FilterGroup>;
}
export type EntityListQuery = z.infer<typeof entityListQuerySchema>;
