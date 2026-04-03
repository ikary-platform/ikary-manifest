import { z } from 'zod';

export interface CellPackageMeta {
  name: string;
  version: string;
  schemaVersion: string;
  author?: string;
  description?: string;
  createdAt: string;
}

export const CellPackageMetaSchema = z.object({
  name: z.string().min(1).max(120),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be valid semver'),
  schemaVersion: z.literal('ikary.io/v1alpha1'),
  author: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
});
