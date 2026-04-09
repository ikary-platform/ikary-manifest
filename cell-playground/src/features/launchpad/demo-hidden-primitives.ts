const HIDDEN_DEMO_PRIMITIVES = new Set([
  'entity_header',
  'entity_form',
  'entity_detail_page',
  'ikary-form',
  'tabs_layout',
  'data_table',
]);

export function isDemoPrimitiveVisible(name: string): boolean {
  return !HIDDEN_DEMO_PRIMITIVES.has(name);
}
