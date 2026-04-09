import { z } from 'zod';

export const PrimitiveCatalogEntrySchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string().optional(),
  category: z
    .enum(['data', 'form', 'layout', 'feedback', 'navigation', 'custom'])
    .default('custom'),
  version: z.string().optional(),
  source: z.enum(['core', 'custom']).default('core'),
  isController: z.boolean().optional(),
});

export type PrimitiveCatalogEntry = z.infer<typeof PrimitiveCatalogEntrySchema>;

export const PRIMITIVE_CATEGORIES = [
  'data',
  'form',
  'layout',
  'feedback',
  'navigation',
  'custom',
] as const;

export type PrimitiveCategory = (typeof PRIMITIVE_CATEGORIES)[number];

export interface PrimitiveCatalogGroup {
  category: PrimitiveCategory | 'all';
  label: string;
  entries: PrimitiveCatalogEntry[];
}

export function groupPrimitivesByCategory(
  entries: PrimitiveCatalogEntry[],
): PrimitiveCatalogGroup[] {
  const grouped = new Map<string, PrimitiveCatalogEntry[]>();

  for (const entry of entries) {
    const cat = entry.category ?? 'custom';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(entry);
  }

  const LABEL_MAP: Record<string, string> = {
    data: 'Data',
    form: 'Form',
    layout: 'Layout',
    feedback: 'Feedback',
    navigation: 'Navigation',
    custom: 'Custom',
  };

  return Array.from(grouped.entries()).map(([cat, items]) => ({
    category: cat as PrimitiveCategory,
    label: LABEL_MAP[cat] ?? cat,
    entries: items,
  }));
}
