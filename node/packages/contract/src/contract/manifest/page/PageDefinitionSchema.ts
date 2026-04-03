import { z } from 'zod';
import { PageTypeSchema, type PageType } from './PageTypeSchema';
import { DataContextSchema } from '../../data/DataContextSchema';
import { DataProviderSchema } from '../../data/DataProviderSchema';

const PageMenuSchema = z
  .object({
    label: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    order: z.number().int().optional(),
  })
  .strict()
  .refine(
    (value) => value.label !== undefined || value.icon !== undefined || value.order !== undefined,
    'menu must define at least label, icon, or order',
  );

const ENTITY_BOUND_PAGE_TYPES = new Set<PageType>([
  'entity-list',
  'entity-detail',
  'entity-create',
  'entity-edit',
] as const);

export const PageDefinitionSchema = z
  .object({
    key: z.string().min(1),
    type: PageTypeSchema,
    title: z.string().min(1),
    path: z.string().min(1),
    entity: z.string().min(1).optional(),
    menu: PageMenuSchema.optional(),
    options: z.record(z.unknown()).optional(),
    dataContext: DataContextSchema.optional(),
    dataProviders: z.array(DataProviderSchema).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.path.startsWith('/')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['path'],
        message: 'path must start with "/"',
      });
    }

    if (ENTITY_BOUND_PAGE_TYPES.has(value.type) && !value.entity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['entity'],
        message: `entity is required when page type is "${value.type}"`,
      });
    }

    if (!ENTITY_BOUND_PAGE_TYPES.has(value.type) && value.entity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['entity'],
        message: `entity must not be set when page type is "${value.type}"`,
      });
    }
  });
