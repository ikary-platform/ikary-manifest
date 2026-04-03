import { z } from 'zod';
import { NavigationItemSchema, type NavigationItemInput } from './NavigationItemSchema';

function collectNavigationKeys(
  items: NavigationItemInput[],
  seen: Map<string, string[]> = new Map(),
  path: string[] = [],
): Map<string, string[]> {
  for (const item of items) {
    const itemPath = [...path, item.key];

    const existing = seen.get(item.key) ?? [];
    existing.push(itemPath.join(' > '));
    seen.set(item.key, existing);

    if (item.type === 'group') {
      collectNavigationKeys(item.children, seen, itemPath);
    }
  }

  return seen;
}

function collectPageKeys(
  items: NavigationItemInput[],
  seen: Map<string, string[]> = new Map(),
  path: string[] = [],
): Map<string, string[]> {
  for (const item of items) {
    const itemPath = [...path, item.key];

    if (item.type === 'page') {
      const existing = seen.get(item.pageKey) ?? [];
      existing.push(itemPath.join(' > '));
      seen.set(item.pageKey, existing);
    }

    if (item.type === 'group') {
      collectPageKeys(item.children, seen, itemPath);
    }
  }

  return seen;
}

export const NavigationDefinitionSchema = z
  .object({
    items: z.array(NavigationItemSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    // navigation item keys must be unique across the full tree
    const keyMap = collectNavigationKeys(value.items);
    for (const [key, paths] of keyMap.entries()) {
      if (paths.length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items'],
          message: `navigation item key "${key}" must be unique across the full navigation tree`,
        });
      }
    }

    // optional opinionated rule:
    // each pageKey should appear only once in navigation
    const pageKeyMap = collectPageKeys(value.items);
    for (const [pageKey, paths] of pageKeyMap.entries()) {
      if (paths.length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items'],
          message: `pageKey "${pageKey}" is referenced multiple times in navigation`,
        });
      }
    }
  });

export type NavigationDefinition = z.infer<typeof NavigationDefinitionSchema>;
