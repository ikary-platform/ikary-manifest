import type { EntityDefinition, PageType } from '@ikary/cell-contract';

export interface SlotContext {
  /** The zone name this slot is associated with, e.g. "header", "toolbar", "table", "footer". */
  slotZone: string;
  /** Whether this primitive was prepended before, appended after, or replaced the zone content. */
  slotMode: 'prepend' | 'append' | 'replace';
  pageType: PageType;
  pageTitle: string;
  pageKey: string;
  /** Present for entity-bound pages (entity-list, entity-detail, entity-create, entity-edit). */
  entityKey?: string;
  entityName?: string;
  entityPluralName?: string;
  /** Full EntityDefinition from the manifest, if the page is entity-bound. */
  entity?: EntityDefinition;
}
