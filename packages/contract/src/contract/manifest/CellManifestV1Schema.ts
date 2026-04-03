import { z } from 'zod';
import { CellMetadataSchema } from './CellMetadataSchema';
import { CellSpecSchema } from './CellSpecSchema';

export const CellManifestV1Schema = z
  .object({
    apiVersion: z.literal('ikary.io/v1alpha1'),
    kind: z.literal('Cell'),
    metadata: CellMetadataSchema,
    spec: CellSpecSchema,
  })
  .strict();

export type CellManifestV1 = z.infer<typeof CellManifestV1Schema>;
