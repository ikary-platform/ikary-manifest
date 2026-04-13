import { z } from 'zod';

const responseMetaSchema = z
  .object({
    requestId: z.string().optional(),
  })
  .optional();

/** Generic schema factory for list responses — pass the row schema to get a typed schema. */
export const entityListResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    hasMore: z.boolean(),
    meta: responseMetaSchema,
  });

/** Generic schema factory for single-item responses. */
export const entityItemResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: responseMetaSchema,
  });

export const entityDeleteResponseSchema = z.object({
  data: z.object({ id: z.string().uuid(), deleted: z.literal(true) }),
  meta: responseMetaSchema,
});

export type EntityListResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  meta?: { requestId?: string };
};
export type EntityItemResponse<T> = { data: T; meta?: { requestId?: string } };
export type EntityDeleteResponse = z.infer<typeof entityDeleteResponseSchema>;
