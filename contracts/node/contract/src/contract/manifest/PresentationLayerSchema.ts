import { z } from 'zod';
import { AppShellDefinitionSchema } from './shell/AppShellDefinitionSchema';
import { PageDefinitionSchema } from './page/PageDefinitionSchema';
import { NavigationDefinitionSchema } from './navigation/NavigationDefinitionSchema';
import { CellMountDefinitionSchema } from './shell/CellMountDefinitionSchema';

export const PresentationLayerSchema = z.object({
  appShell: AppShellDefinitionSchema.optional(),
  pages: z.array(PageDefinitionSchema).default([]),
  navigation: NavigationDefinitionSchema.optional(),
  mount: CellMountDefinitionSchema.optional(),
});

export type PresentationLayer = z.infer<typeof PresentationLayerSchema>;
