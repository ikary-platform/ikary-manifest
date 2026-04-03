import { z } from 'zod';
import { EntityDefinitionSchema } from '../entity/EntityDefinitionSchema';
import { RoleDefinitionSchema } from './role/RoleDefinitionSchema';
import { CellMountDefinitionSchema } from './shell/CellMountDefinitionSchema';
import { PageDefinitionSchema } from './page/PageDefinitionSchema';
import { NavigationDefinitionSchema } from './navigation/NavigationDefinitionSchema';
import { AppShellDefinitionSchema } from './shell/AppShellDefinitionSchema';

export const CellSpecSchema = z
  .object({
    mount: CellMountDefinitionSchema,
    appShell: AppShellDefinitionSchema.optional(),
    entities: z.array(EntityDefinitionSchema).optional(),
    pages: z.array(PageDefinitionSchema).optional(),
    navigation: NavigationDefinitionSchema.optional(),
    roles: z.array(RoleDefinitionSchema).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.entities) {
      const keys = value.entities.map((e) => e.key);
      if (new Set(keys).size !== keys.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['entities'],
          message: 'entity keys must be unique',
        });
      }
    }

    if (value.pages) {
      const keys = value.pages.map((p) => p.key);
      if (new Set(keys).size !== keys.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pages'],
          message: 'page keys must be unique',
        });
      }
    }

    if (value.roles) {
      const keys = value.roles.map((r) => r.key);
      if (new Set(keys).size !== keys.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['roles'],
          message: 'role keys must be unique',
        });
      }
    }

    if (!value.entities && !value.pages && !value.navigation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [],
        message: 'cell spec must define at least entities, pages, or navigation',
      });
    }
  });

export type CellSpec = z.infer<typeof CellSpecSchema>;
