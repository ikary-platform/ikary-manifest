// Sensible default presentation JSON for each registered primitive.
// For primitives with a resolver, this is the PRESENTATION CONTRACT (the input).
// For primitives without a resolver, these are ViewProps passed directly.

export const PRIMITIVES = [
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio-group',
  'toggle',
  'date-input',
  'form-field',
  'form-section',
  'form',
  'data-grid',
  'pagination',
  'card-list',
  'filter-bar',
  'bulk-command-bar',
  'page-header',
  'detail-item',
  'detail-section',
  'field-value',
  'tabs',
  'empty-state',
  'loading-state',
  'error-state',
  'metric-card',
  'activity-feed',
  'entity_header',
] as const;

export type PrimitiveName = (typeof PRIMITIVES)[number];

export const PRIMITIVE_SAMPLES: Record<string, unknown> = {
  input: {
    inputType: 'text',
    value: 'ACME Corporation',
    name: 'company',
    placeholder: 'Enter company name…',
  },

  textarea: {
    placeholder: 'Enter description…',
    value: 'A leading provider of widget solutions since 1985.',
    rows: 4,
  },

  select: {
    value: 'active',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
      { value: 'archived', label: 'Archived' },
    ],
  },

  checkbox: {
    label: 'I agree to the terms and conditions',
    checked: true,
  },

  'radio-group': {
    options: [
      { value: 'high', label: 'High priority' },
      { value: 'medium', label: 'Medium priority' },
      { value: 'low', label: 'Low priority' },
    ],
    value: 'medium',
    direction: 'vertical',
  },

  toggle: {
    label: 'Enable email notifications',
    checked: true,
  },

  'date-input': {
    placeholder: 'Pick a date…',
    value: '2025-06-15',
  },

  'form-field': {
    type: 'form-field',
    key: 'company_name',
    variant: 'standard',
    control: 'text',
    label: 'Company Name',
    required: true,
    helpText: 'The legal entity name',
  },

  'form-section': {
    type: 'form-section',
    key: 'general',
    title: 'General Information',
    layout: 'stack',
    fields: [
      {
        type: 'form-field',
        key: 'name',
        variant: 'standard',
        control: 'text',
        label: 'Name',
        required: true,
        helpText: 'Customer display name',
      },
      {
        type: 'form-field',
        key: 'status',
        variant: 'standard',
        control: 'select',
        label: 'Status',
        options: [
          { key: 'active', label: 'Active', value: 'active' },
          { key: 'paused', label: 'Paused', value: 'paused' },
        ],
      },
    ],
  },

  form: {
    type: 'form',
    key: 'create-customer',
    title: 'Create Customer',
    description: 'Add a new customer to the workspace.',
    mode: 'commit-only',
    sections: [
      {
        type: 'form-section',
        key: 'identity',
        title: 'Identity',
        layout: 'stack',
        fields: [
          {
            type: 'form-field',
            key: 'name',
            variant: 'standard',
            control: 'text',
            label: 'Full Name',
            required: true,
          },
          {
            type: 'form-field',
            key: 'email',
            variant: 'standard',
            control: 'text',
            label: 'Email',
            placeholder: 'name@example.com',
          },
        ],
      },
      {
        type: 'form-section',
        key: 'classification',
        title: 'Classification',
        layout: 'two-column',
        fields: [
          {
            type: 'form-field',
            key: 'status',
            variant: 'standard',
            control: 'select',
            label: 'Status',
            options: [
              { key: 'active', label: 'Active', value: 'active' },
              { key: 'inactive', label: 'Inactive', value: 'inactive' },
            ],
          },
          {
            type: 'form-field',
            key: 'priority',
            variant: 'standard',
            control: 'select',
            label: 'Priority',
            options: [
              { key: 'high', label: 'High', value: 'high' },
              { key: 'medium', label: 'Medium', value: 'medium' },
              { key: 'low', label: 'Low', value: 'low' },
            ],
          },
        ],
      },
    ],
  },

  'data-grid': {
    type: 'data-grid',
    columns: [
      {
        key: 'name',
        field: 'name',
        label: 'Name',
        type: 'link',
        sortable: true,
        sortField: 'name',
        minWidth: 200,
        linkTarget: { type: 'detail-page' },
      },
      {
        key: 'status',
        field: 'status',
        label: 'Status',
        type: 'badge',
        minWidth: 120,
      },
      {
        key: 'revenue',
        field: 'revenue',
        label: 'Revenue',
        type: 'currency',
        align: 'end',
        minWidth: 140,
        format: { currency: 'EUR' },
      },
      {
        key: 'actions',
        label: '',
        type: 'actions',
        align: 'end',
        width: 'content',
      },
    ],
    sorting: { enabled: true, mode: 'single' },
    pagination: { enabled: true, pageSizeOptions: [10, 25, 50], showTotalCount: true },
    rowActions: [
      { key: 'open', label: 'Open', actionKey: 'open' },
      { key: 'edit', label: 'Edit', actionKey: 'edit' },
      { key: 'delete', label: 'Delete', actionKey: 'delete', intent: 'danger', requiresConfirmation: true },
    ],
    emptyState: {
      title: 'No customers found',
      description: 'Try changing your filters or create a new customer.',
    },
  },

  pagination: {
    type: 'pagination',
    visibility: { hideWhenSinglePage: false },
    range: { visible: true, format: 'start-end-of-total' },
    pageSize: { visible: true, options: [10, 25, 50], label: 'Rows' },
    navigation: {
      showFirst: true,
      showLast: true,
      showPrevious: true,
      showNext: true,
      showPageList: true,
      pageListMode: 'pages',
      maxVisiblePages: 5,
    },
    summary: { visible: false },
  },

  'card-list': {
    type: 'card-list',
    layout: { columns: '3' },
    card: {
      title: { field: 'name' },
      subtitle: { field: 'email' },
      fields: [
        { key: 'status', label: 'Status', field: 'status', valueType: 'badge' },
        { key: 'revenue', label: 'Revenue', field: 'revenue', valueType: 'currency' },
      ],
      primaryAction: { label: 'Open', actionKey: 'open' },
    },
    emptyState: { title: 'No records', description: 'Create the first one.' },
  },

  'filter-bar': {
    variant: 'list',
    density: 'comfortable',
    search: { placeholder: 'Search customers', value: '' },
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        value: 'active',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'paused', label: 'Paused' },
        ],
      },
    ],
    sort: {
      value: 'name-asc',
      options: [
        { value: 'name-asc', label: 'Name A→Z' },
        { value: 'updatedAt-desc', label: 'Recently updated' },
      ],
    },
  },

  'bulk-command-bar': {
    variant: 'list',
    density: 'comfortable',
    selectedCount: 3,
    scope: 'page',
    actions: [
      { key: 'archive', label: 'Archive', variant: 'secondary' },
      { key: 'delete', label: 'Delete', variant: 'destructive', confirm: { title: 'Delete 3 items?' } },
    ],
    clearSelectionAction: { label: 'Clear selection', actionKey: 'clear-selection' },
  },

  'page-header': {
    type: 'page-header',
    title: 'Customers',
    description: 'Manage your customer accounts.',
    eyebrow: 'Workspace',
    breadcrumbs: [
      { key: 'home', label: 'Home', href: '/' },
      { key: 'customers', label: 'Customers', href: '/customers' },
    ],
    meta: [
      { type: 'badge', key: 'status', label: 'Live', tone: 'success' },
      { type: 'text', key: 'count', label: '284 records' },
    ],
    primaryAction: { key: 'create', label: 'New Customer', actionKey: 'create' },
  },

  'detail-item': {
    type: 'detail-item',
    kind: 'field-value',
    key: 'email',
    label: 'Email Address',
    field: 'email',
    valueType: 'link',
  },

  'detail-section': {
    type: 'detail-section',
    title: 'Customer Details',
    description: 'Core business information',
    content: {
      mode: 'field-list',
      items: [
        { key: 'name', label: 'Name', field: 'name', valueType: 'text' },
        { key: 'email', label: 'Email', field: 'email', valueType: 'link' },
        { key: 'status', label: 'Status', field: 'status', valueType: 'badge' },
        { key: 'revenue', label: 'Annual Revenue', field: 'revenue', valueType: 'currency' },
      ],
    },
    actions: [
      { key: 'edit', label: 'Edit', actionKey: 'edit-details' },
    ],
  },

  'field-value': {
    type: 'field-value',
    valueType: 'text',
  },

  tabs: {
    type: 'tabs',
    items: [
      { key: 'overview', label: 'Overview', actionKey: 'tab-overview' },
      { key: 'invoices', label: 'Invoices', actionKey: 'tab-invoices' },
      { key: 'activity', label: 'Activity', actionKey: 'tab-activity' },
    ],
    activeKey: 'overview',
    overflow: { mode: 'scroll', collapseBelow: 'md' },
  },

  'empty-state': {
    title: 'No customers yet',
    description: 'Create your first customer to get started.',
    variant: 'initial',
    primaryAction: { label: 'New Customer', actionKey: 'create' },
  },

  'loading-state': {
    variant: 'page',
    mode: 'skeleton',
    label: 'Loading customer data…',
    skeleton: { lines: 3, blocks: 1 },
  },

  'error-state': {
    title: 'Failed to load customers',
    description: 'There was a problem retrieving your data.',
    variant: 'section',
    severity: 'soft',
    retryAction: { label: 'Try again', actionKey: 'retry' },
  },

  'metric-card': {
    label: 'Active Customers',
    value: '284',
    delta: '+12',
    deltaDirection: 'up',
    tone: 'success',
    subtitle: 'vs last month',
  },

  'activity-feed': {
    variant: 'default',
    density: 'comfortable',
    title: 'Recent Activity',
    items: [
      {
        key: 'a1',
        summary: 'Customer created',
        actor: 'Alice Martin',
        timestamp: '2m ago',
        tone: 'success',
      },
      {
        key: 'a2',
        summary: 'Invoice #INV-042 approved',
        actor: 'System',
        timestamp: '15m ago',
        tone: 'info',
      },
      {
        key: 'a3',
        summary: 'Payment overdue',
        actor: 'System',
        timestamp: '2h ago',
        tone: 'warning',
      },
    ],
  },

  entity_header: {
    title: 'ACME Corporation',
    subtitle: 'Enterprise customer',
    status: { label: 'Active' },
  },
};
