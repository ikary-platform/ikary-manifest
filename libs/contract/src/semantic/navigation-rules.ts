import type { NavigationItem, ValidationError } from '../shared/types';

function collectNavigationReferences(items: NavigationItem[]): { pageRefs: string[]; keys: string[] } {
  const pageRefs: string[] = [];
  const keys: string[] = [];

  for (const item of items ?? []) {
    keys.push(item.key);

    if (item.type === 'page') {
      pageRefs.push(item.pageKey);
      continue;
    }

    const nested = collectNavigationReferences(item.children);
    pageRefs.push(...nested.pageRefs);
    keys.push(...nested.keys);
  }

  return { pageRefs, keys };
}

export function validateNavigationRules(items: NavigationItem[], pageKeySet: Set<string>): ValidationError[] {
  const errors: ValidationError[] = [];
  const { pageRefs, keys } = collectNavigationReferences(items);

  const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
  for (const key of new Set(duplicateKeys)) {
    errors.push({ field: 'spec.navigation', message: `Duplicate navigation key: "${key}"` });
  }

  for (const ref of pageRefs) {
    if (!pageKeySet.has(ref)) {
      errors.push({
        field: 'spec.navigation',
        message: `Navigation references unknown page key: "${ref}"`,
      });
    }
  }

  return errors;
}
