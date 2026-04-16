import { z } from 'zod';

/**
 * Zod schema for `ikary.config.json` — an optional project-level config file
 * read from the invoking project's root (process.cwd()).
 *
 * Nested sections keep room for future CLI-level configuration (preview
 * settings, deploy defaults, etc.) without churning the top-level shape.
 * Every field is optional so a partial file is valid — the CLI falls back to
 * hard-coded defaults for anything the user does not specify.
 */
export const ikaryConfigSchema = z
  .object({
    migrate: z
      .object({
        /**
         * Extra `@ikary/*` (or any resolvable) packages to include in
         * `ikary local db migrate | status | reset`. Merged with — not
         * replacing — the CLI's built-in defaults. Packages not installed in
         * the active project are silently skipped.
         */
        packages: z.array(z.string().min(1)).default([]),
      })
      .default({ packages: [] }),
  })
  .default({});

export type IkaryConfig = z.infer<typeof ikaryConfigSchema>;
