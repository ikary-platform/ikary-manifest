import { z } from 'zod';

export const PageTypeSchema = z.enum([
  'entity-list',
  'entity-detail',
  'entity-create',
  'entity-edit',
  'dashboard',
  'custom',
]);

export type PageType = z.infer<typeof PageTypeSchema>;
