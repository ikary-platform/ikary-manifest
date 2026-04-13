import { z } from 'zod';

export const migrationFileSchema = z.object({
  fileName: z.string(),
  absolutePath: z.string(),
});
export type MigrationFile = z.infer<typeof migrationFileSchema>;

export const migrationVersionSchema = z.object({
  packageName: z.string(),
  version: z.string(),
  versionDir: z.string(),
  files: z.array(migrationFileSchema),
});
export type MigrationVersion = z.infer<typeof migrationVersionSchema>;

export const migrationRunnerOptionsSchema = z.object({
  packageName: z.string(),
  migrationsRoot: z.string(),
});
export type MigrationRunnerOptions = z.infer<typeof migrationRunnerOptionsSchema>;

export const migrationStatusSchema = z.object({
  applied: z.array(z.string()),
  pending: z.array(z.string()),
});
export type MigrationStatus = z.infer<typeof migrationStatusSchema>;
