export interface PrimitiveCatalogEntry {
  key: string;
  category: string;
  description: string;
  bestFor?: string[];
  avoidWhen?: string[];
}

export const PRIMITIVE_CATALOG: PrimitiveCatalogEntry[] = [
  // Collection
  { key: 'data-grid', category: 'collection', description: 'Sortable, filterable tabular data grid with pagination', bestFor: ['large entity lists', 'sortable/filterable data'], avoidWhen: ['card-heavy visual displays'] },
  { key: 'card-list', category: 'collection', description: 'Card-based collection layout for visual data', bestFor: ['visual summaries', 'dashboard widgets'], avoidWhen: ['dense tabular data'] },
  { key: 'pagination', category: 'collection', description: 'Page navigation controls for collections', bestFor: ['paginated lists'], avoidWhen: ['infinite scroll UIs'] },
  { key: 'filter-bar', category: 'collection', description: 'Filter controls for collection views', bestFor: ['list pages with multiple filter dimensions'] },
  { key: 'bulk-command-bar', category: 'collection', description: 'Batch action toolbar for selected items', bestFor: ['bulk operations on selected records'] },

  // Input
  { key: 'input', category: 'input', description: 'Text input field', bestFor: ['short text, emails, URLs'] },
  { key: 'textarea', category: 'input', description: 'Multi-line text input', bestFor: ['long text, descriptions, notes'] },
  { key: 'select', category: 'input', description: 'Dropdown select field', bestFor: ['enum fields, single selection from options'] },
  { key: 'checkbox', category: 'input', description: 'Boolean checkbox input', bestFor: ['boolean flags, toggleable options'] },
  { key: 'radio-group', category: 'input', description: 'Radio button group for single selection', bestFor: ['small set of mutually exclusive options'] },
  { key: 'toggle', category: 'input', description: 'Toggle switch for boolean values', bestFor: ['on/off settings, feature flags'] },
  { key: 'date-input', category: 'input', description: 'Date picker input', bestFor: ['date and datetime fields'] },
  { key: 'relation-field', category: 'input', description: 'Related entity selector', bestFor: ['belongs_to relation fields'] },

  // Form
  { key: 'form', category: 'form', description: 'Complete form with sections, validation, and submit actions', bestFor: ['entity create/edit pages'] },
  { key: 'form-field', category: 'form', description: 'Individual form field wrapper with label and validation', bestFor: ['wrapping input primitives in forms'] },
  { key: 'form-section', category: 'form', description: 'Grouped section within a form', bestFor: ['organizing related fields'] },

  // Layout
  { key: 'page-header', category: 'layout', description: 'Page header with title, breadcrumbs, and actions', bestFor: ['top of any page'] },
  { key: 'tabs', category: 'layout', description: 'Tabbed content container', bestFor: ['detail pages with multiple views'] },
  { key: 'detail-section', category: 'layout', description: 'Grouped section in a detail view', bestFor: ['organizing fields in detail pages'] },
  { key: 'detail-item', category: 'layout', description: 'Single label-value pair in a detail view', bestFor: ['displaying individual field values'] },

  // Page
  { key: 'list-page', category: 'page', description: 'Full list page with header, filters, grid, and pagination', bestFor: ['entity-list page type'] },
  { key: 'detail-page', category: 'page', description: 'Full detail page with header, tabs, and sections', bestFor: ['entity-detail page type'] },
  { key: 'dashboard-page', category: 'page', description: 'Dashboard layout with metric cards and widgets', bestFor: ['dashboard page type'] },
  { key: 'entity-header', category: 'page', description: 'Entity record header with title, status, and actions', bestFor: ['top of detail/edit pages'] },

  // Display
  { key: 'field-value', category: 'display', description: 'Formatted field value renderer (handles all field types)', bestFor: ['displaying field values outside forms'] },
  { key: 'metric-card', category: 'display', description: 'KPI metric card with value, trend, and delta', bestFor: ['dashboards, summary views'] },
  { key: 'activity-feed', category: 'display', description: 'Chronological activity/event feed', bestFor: ['audit trails, activity logs'] },

  // Feedback
  { key: 'empty-state', category: 'feedback', description: 'Empty state placeholder with title and action', bestFor: ['lists with no data, first-use screens'] },
  { key: 'loading-state', category: 'feedback', description: 'Loading skeleton or spinner', bestFor: ['async data loading'] },
  { key: 'error-state', category: 'feedback', description: 'Error display with message and retry action', bestFor: ['failed data loads, validation errors'] },
];

export const PRIMITIVE_CATEGORIES = [
  'collection', 'input', 'form', 'layout', 'page', 'display', 'feedback',
] as const;
