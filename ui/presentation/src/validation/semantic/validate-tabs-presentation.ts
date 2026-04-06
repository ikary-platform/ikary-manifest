import type { TabsPresentation } from '../../contract/tabs/TabsPresentationSchema';
import type { PresentationValidationError } from '../types';

export function validateTabsPresentation(presentation: TabsPresentation): PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  // Items must remain meaningful
  if (presentation.items.length === 0) {
    errors.push({
      path: 'items',
      message: 'Tabs must define at least one item',
      code: 'TABS_ITEMS_REQUIRED',
    });
  }

  // Keys must be unique
  const itemKeys = presentation.items.map((item) => item.key);
  const duplicateItemKeys = itemKeys.filter((key, index) => itemKeys.indexOf(key) !== index);

  for (const key of new Set(duplicateItemKeys)) {
    errors.push({
      path: 'items',
      message: `Duplicate tab key "${key}"`,
      code: 'TABS_DUPLICATE_ITEM_KEY',
    });
  }

  // activeKey must reference a declared item
  if (presentation.activeKey && !presentation.items.some((item) => item.key === presentation.activeKey)) {
    errors.push({
      path: 'activeKey',
      message: `activeKey "${presentation.activeKey}" does not reference a declared tab item`,
      code: 'TABS_INVALID_ACTIVE_KEY',
    });
  }

  // Each item must define exactly one target
  for (const [index, item] of presentation.items.entries()) {
    if (!item.href && !item.actionKey) {
      errors.push({
        path: `items.${index}`,
        message: 'Tab item must define either href or actionKey',
        code: 'TABS_ITEM_TARGET_REQUIRED',
      });
    }

    if (item.href && item.actionKey) {
      errors.push({
        path: `items.${index}`,
        message: 'Tab item cannot define both href and actionKey at the same time',
        code: 'TABS_ITEM_TARGET_CONFLICT',
      });
    }

    if (!item.label.trim()) {
      errors.push({
        path: `items.${index}.label`,
        message: 'Tab item label is required',
        code: 'TABS_ITEM_LABEL_REQUIRED',
      });
    }

    if (item.count !== undefined && item.count < 0) {
      errors.push({
        path: `items.${index}.count`,
        message: 'Tab item count must be greater than or equal to 0',
        code: 'TABS_ITEM_INVALID_COUNT',
      });
    }
  }

  // Overflow mode should stay within the canonical V1 set
  if (presentation.overflow?.mode && presentation.overflow.mode !== 'scroll' && presentation.overflow.mode !== 'menu') {
    errors.push({
      path: 'overflow.mode',
      message: 'Only "scroll" or "menu" overflow modes are allowed in V1',
      code: 'TABS_INVALID_OVERFLOW_MODE',
    });
  }

  return errors;
}
