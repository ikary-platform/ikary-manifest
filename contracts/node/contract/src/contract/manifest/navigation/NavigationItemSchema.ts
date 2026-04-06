import { z } from 'zod';

export type NavigationItemInput =
  | {
      type: 'page';
      key: string;
      pageKey: string;
      label?: string;
      icon?: string;
      order?: number;
    }
  | {
      type: 'group';
      key: string;
      label: string;
      icon?: string;
      order?: number;
      children: NavigationItemInput[];
    };

export const NavigationItemSchema: z.ZodType<NavigationItemInput> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('page'),
      key: z.string().min(1),
      pageKey: z.string().min(1),
      label: z.string().optional(),
      icon: z.string().optional(),
      order: z.number().optional(),
    }),
    z.object({
      type: z.literal('group'),
      key: z.string().min(1),
      label: z.string().min(1),
      icon: z.string().optional(),
      order: z.number().optional(),
      children: z.array(NavigationItemSchema),
    }),
  ]),
);
