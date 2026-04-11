// Static composition tree for each primitive.
// Composite primitives show which sub-primitives they render.
// Leaf primitives show only themselves.

export const PRIMITIVE_TREES: Record<string, string[]> = {
  form: [
    'form',
    '  form-section',
    '    form-field',
    '      input | textarea | select | checkbox | radio-group | toggle | date-input',
  ],

  'form-section': [
    'form-section',
    '  form-field',
    '    input | textarea | select | checkbox | radio-group | toggle | date-input',
  ],

  'form-field': [
    'form-field',
    '  input | textarea | select | checkbox | radio-group | toggle | date-input',
  ],

  'list-page': [
    'list-page',
    '  page-header',
    '  filter-bar',
    '  data-grid | card-list',
    '    (rows)',
    '  bulk-command-bar  (when rows selected)',
    '  pagination',
    '  empty-state | loading-state | error-state  (on state changes)',
  ],

  'detail-page': [
    'detail-page',
    '  page-header',
    '  tabs',
    '  detail-section',
    '    detail-item',
    '      field-value',
  ],

  'dashboard-page': [
    'dashboard-page',
    '  page-header',
    '  metric-card  (×N for KPIs)',
    '  data-grid | card-list | activity-feed  (widgets)',
  ],

  'data-grid': [
    'data-grid',
    '  (columns defined by presentation contract)',
    '  pagination  (when enabled)',
    '  empty-state | loading-state | error-state  (on state changes)',
  ],

  'card-list': [
    'card-list',
    '  (card layout defined by presentation contract)',
    '  empty-state | loading-state  (on state changes)',
  ],

  'detail-section': [
    'detail-section',
    '  detail-item  (×N items)',
    '    field-value',
  ],

  tabs: [
    'tabs',
    '  (tab items defined by presentation contract)',
    '  (content rendered by parent)',
  ],

  'page-header': [
    'page-header',
    '  breadcrumbs',
    '  meta badges / text',
    '  primary action | secondary actions',
  ],

  'filter-bar': ['filter-bar', '  search input', '  filter chips', '  sort selector'],
  'bulk-command-bar': ['bulk-command-bar', '  selection summary', '  action buttons'],
  pagination: ['pagination', '  page size selector', '  page navigation', '  range display'],

  // Leaf primitives
  input: ['input'],
  textarea: ['textarea'],
  select: ['select'],
  checkbox: ['checkbox'],
  'radio-group': ['radio-group'],
  toggle: ['toggle'],
  'date-input': ['date-input'],
  'detail-item': ['detail-item', '  field-value'],
  'field-value': ['field-value'],
  'empty-state': ['empty-state'],
  'loading-state': ['loading-state'],
  'error-state': ['error-state'],
  'metric-card': ['metric-card'],
  'activity-feed': ['activity-feed', '  (activity items)'],
  entity_header: ['entity_header', '  title + subtitle', '  status badge', '  actions'],
};
