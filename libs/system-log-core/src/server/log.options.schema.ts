import { z } from 'zod';

export const systemLogModuleOptionsSchema = z.object({
  service: z.string().min(1),
  pretty: z.boolean().default(false),
  packageVersion: z.string().default('1.0.0'),
  /** Seed a persistent sink with 72h retention on first boot (default: true). */
  seedDefaultSink: z.boolean().default(true),
});

export type SystemLogModuleOptions = z.infer<typeof systemLogModuleOptionsSchema>;
