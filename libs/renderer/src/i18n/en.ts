/**
 * Default English strings shipped with @ikary/renderer.
 *
 * These are baked into the renderer bundle so every cell renders with sane
 * English defaults out of the box. Users override these in their app's
 * `src/locales/overrides/en.ts` or translate them for additional locales.
 */
export const messages = {
  // Common actions
  'common.cancel': 'Cancel',

  // Entity list page
  'entity.list.create_button': 'Create {entityName}',
  'entity.list.search_placeholder': 'Search {pluralName}',
  'entity.list.empty_title': 'No {pluralName} yet',
  'entity.list.empty_filtered_description': 'Try clearing your search or filters.',

  // Entity detail page
  'entity.detail.back_link': 'Back to {pluralName}',
  'entity.detail.not_found': '{entityName} not found (id: {id}).',
  'entity.detail.edit_button': 'Edit',
  'entity.detail.delete_button': 'Delete',
  'entity.detail.save_button': 'Save Changes',
  'entity.detail.saving_state': 'Saving\u2026',
} as const;

export default messages;
