import type {
  ActivityFeedPresentation,
  BulkCommandBarPresentation,
  CheckboxPresentation,
  DashboardPagePresentation,
  DataGridPresentation,
  DateInputPresentation,
  DetailItemPresentation,
  DetailPagePresentation,
  DetailSectionPresentation,
  EmptyStatePresentation,
  ErrorStatePresentation,
  FilterBarPresentation,
  InputPresentation,
  LoadingStatePresentation,
  FormFieldPresentation,
  IkaryFormPresentation,
  FormSectionPresentation,
  FieldValuePresentation,
  ListPagePresentation,
  MetricCardPresentation,
  PageHeaderPresentation,
  PaginationPresentation,
  RadioGroupPresentation,
  SelectPresentation,
  TabsPresentation,
  TextareaPresentation,
  TogglePresentation,
} from '@ikary/cell-contract-presentation';

type ContractPresentationType =
  | 'activity-feed'
  | 'bulk-command-bar'
  | 'card-list'
  | 'checkbox'
  | 'dashboard-page'
  | 'date-input'
  | 'detail-page'
  | 'empty-state'
  | 'error-state'
  | 'filter-bar'
  | 'input'
  | 'loading-state'
  | 'metric-card'
  | 'radio-group'
  | 'select'
  | 'textarea'
  | 'toggle'
  | DataGridPresentation['type']
  | DetailItemPresentation['type']
  | DetailSectionPresentation['type']
  | FormFieldPresentation['type']
  | IkaryFormPresentation['type']
  | FormSectionPresentation['type']
  | FieldValuePresentation['type']
  | ListPagePresentation['type']
  | PageHeaderPresentation['type']
  | PaginationPresentation['type']
  | TabsPresentation['type'];

export interface PrimitiveDemo {
  label: string;
  description: string;
  primitive: string;
  contractType: ContractPresentationType;
  props: Record<string, unknown>;
  runtime: Record<string, unknown>;
}

const DATA_GRID_CONTRACT_TYPE: DataGridPresentation['type'] = 'data-grid';
const CARD_LIST_CONTRACT_TYPE = 'card-list' as const;
const BULK_COMMAND_BAR_CONTRACT_TYPE = 'bulk-command-bar' as const;
const METRIC_CARD_CONTRACT_TYPE = 'metric-card' as const;
const ACTIVITY_FEED_CONTRACT_TYPE = 'activity-feed' as const;
const DETAIL_ITEM_CONTRACT_TYPE: DetailItemPresentation['type'] = 'detail-item';
const DETAIL_PAGE_CONTRACT_TYPE = 'detail-page' as const;
const DASHBOARD_PAGE_CONTRACT_TYPE = 'dashboard-page' as const;
const DETAIL_SECTION_CONTRACT_TYPE: DetailSectionPresentation['type'] = 'detail-section';
const EMPTY_STATE_CONTRACT_TYPE = 'empty-state' as const;
const ERROR_STATE_CONTRACT_TYPE = 'error-state' as const;
const FILTER_BAR_CONTRACT_TYPE = 'filter-bar' as const;
const INPUT_CONTRACT_TYPE = 'input' as const;
const LOADING_STATE_CONTRACT_TYPE = 'loading-state' as const;
const TEXTAREA_CONTRACT_TYPE = 'textarea' as const;
const SELECT_CONTRACT_TYPE = 'select' as const;
const CHECKBOX_CONTRACT_TYPE = 'checkbox' as const;
const RADIO_GROUP_CONTRACT_TYPE = 'radio-group' as const;
const TOGGLE_CONTRACT_TYPE = 'toggle' as const;
const DATE_INPUT_CONTRACT_TYPE = 'date-input' as const;
const FORM_FIELD_CONTRACT_TYPE: FormFieldPresentation['type'] = 'form-field';
const IKARY_FORM_CONTRACT_TYPE: IkaryFormPresentation['type'] = 'form';
const FORM_SECTION_CONTRACT_TYPE: FormSectionPresentation['type'] = 'form-section';
const FIELD_VALUE_CONTRACT_TYPE: FieldValuePresentation['type'] = 'field-value';
const LIST_PAGE_CONTRACT_TYPE: ListPagePresentation['type'] = 'list-page';
const PAGE_HEADER_CONTRACT_TYPE: PageHeaderPresentation['type'] = 'page-header';
const PAGINATION_CONTRACT_TYPE: PaginationPresentation['type'] = 'pagination';
const TABS_CONTRACT_TYPE: TabsPresentation['type'] = 'tabs';

const DATA_GRID_PROPS: DataGridPresentation = {
  type: DATA_GRID_CONTRACT_TYPE,
  columns: [
    {
      key: 'name',
      field: 'name',
      label: 'Name',
      type: 'link',
      sortable: true,
      sortField: 'name',
      minWidth: 220,
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
      key: 'createdAt',
      field: 'createdAt',
      label: 'Created',
      type: 'date',
      sortable: true,
      sortField: 'createdAt',
      align: 'start',
      minWidth: 140,
      format: { dateStyle: 'medium' },
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'end',
      width: 'content',
    },
  ],
  sorting: {
    enabled: true,
    mode: 'single',
  },
  pagination: {
    enabled: true,
    pageSizeOptions: [10, 25, 50],
    showTotalCount: true,
  },
  rowActions: [
    { key: 'open', label: 'Open', actionKey: 'open' },
    { key: 'edit', label: 'Edit', actionKey: 'edit' },
    {
      key: 'delete',
      label: 'Delete',
      actionKey: 'delete',
      intent: 'danger',
      requiresConfirmation: true,
    },
  ],
  emptyState: {
    title: 'No records found',
    description: 'Try changing your filters or create a new record.',
  },
};

const DATA_GRID_RUNTIME = {
  rows: [
    {
      id: 'rec-001',
      name: 'Acme Corporation',
      status: 'active',
      createdAt: '2026-02-10',
    },
    {
      id: 'rec-002',
      name: 'Globex Ltd',
      status: 'pending',
      createdAt: '2026-02-14',
    },
    {
      id: 'rec-003',
      name: 'Umbrella Systems',
      status: 'inactive',
      createdAt: '2026-02-21',
    },
  ],
  selectedRowIds: ['rec-002'],
  sort: {
    field: 'createdAt',
    direction: 'asc',
  },
};

const CARD_LIST_PROPS = {
  type: CARD_LIST_CONTRACT_TYPE,
  layout: {
    columns: '3',
  },
  card: {
    titleField: 'name',
    subtitleField: 'owner.email',
    badge: {
      field: 'status',
      tone: 'neutral',
    },
    fields: [
      {
        key: 'owner',
        label: 'Owner',
        field: 'owner.name',
        valueType: 'text',
      },
      {
        key: 'contact',
        label: 'Contact',
        field: 'owner.email',
        valueType: 'link',
      },
      {
        key: 'nextRenewal',
        label: 'Renewal',
        field: 'nextRenewalAt',
        valueType: 'date',
      },
    ],
    metrics: [
      {
        key: 'arr',
        label: 'ARR',
        field: 'arr',
        valueType: 'currency',
      },
      {
        key: 'seats',
        label: 'Seats',
        field: 'seatCount',
        valueType: 'number',
      },
    ],
    actions: [
      {
        key: 'open',
        label: 'Open',
        actionKey: 'open-card',
      },
      {
        key: 'archive',
        label: 'Archive',
        actionKey: 'archive-card',
        intent: 'danger',
        hiddenWhenUnauthorized: true,
      },
    ],
  },
  emptyState: {
    title: 'No accounts found',
    description: 'Try changing filters to broaden results.',
  },
};

const CARD_LIST_RUNTIME = {
  records: [
    {
      id: 'acc-001',
      name: 'Acme Corporation',
      status: 'active',
      owner: {
        name: 'Marta Reed',
        email: 'marta@acme.io',
      },
      arr: 120000,
      seatCount: 42,
      nextRenewalAt: '2026-06-10',
    },
    {
      id: 'acc-002',
      name: 'Globex Ltd',
      status: 'pending',
      owner: {
        name: 'Lucas Shaw',
        email: 'lucas@globex.io',
      },
      arr: 84000,
      seatCount: 21,
      nextRenewalAt: '2026-07-18',
    },
    {
      id: 'acc-003',
      name: 'Umbrella Systems',
      status: 'inactive',
      owner: {
        name: 'Nina Patel',
        email: 'nina@umbrella.io',
      },
      arr: 0,
      seatCount: 0,
      nextRenewalAt: '',
    },
  ],
  authorizedActionKeys: ['open-card'],
  linkBasePath: '/customers',
};

const METRIC_CARD_PROPS: MetricCardPresentation = {
  variant: 'default',
  density: 'comfortable',
  label: 'Revenue This Month',
  value: '€128,400',
  subtitle: 'Across all active accounts',
  delta: '+12.4%',
  deltaDirection: 'up',
  tone: 'success',
  icon: 'rev',
  action: {
    label: 'Open details',
    actionKey: 'open-metric-details',
  },
};

const METRIC_CARD_RUNTIME = {
  actionHandlers: ['open-metric-details'],
};

const ACTIVITY_FEED_PROPS: ActivityFeedPresentation = {
  variant: 'timeline',
  density: 'comfortable',
  title: 'Recent Activity',
  subtitle: 'Latest operational changes in the workspace',
  items: [
    {
      key: 'evt-001',
      summary: 'Alice approved invoice INV-2026-014',
      actor: 'Alice Martin',
      timestamp: '2 minutes ago',
      targetLabel: 'Invoice INV-2026-014',
      tone: 'success',
      actionKey: 'open-invoice',
    },
    {
      key: 'evt-002',
      summary: 'Customer status changed to Active',
      actor: 'System',
      timestamp: '18 minutes ago',
      targetLabel: 'Acme Corporation',
      tone: 'info',
      href: '/primitives/detail-page',
    },
    {
      key: 'evt-003',
      summary: 'Payment method sync failed',
      actor: 'Billing Connector',
      timestamp: 'Today at 09:14',
      targetLabel: 'Customer Umbrella Systems',
      tone: 'warning',
      actionKey: 'open-sync-details',
    },
    {
      key: 'evt-004',
      summary: 'Contract renewal processed',
      actor: 'Lucas Shaw',
      timestamp: 'Yesterday',
      targetLabel: 'Contract CR-0021',
      tone: 'default',
    },
  ],
  limit: 4,
  action: {
    label: 'View all activity',
    actionKey: 'open-activity-center',
  },
};

const ACTIVITY_FEED_RUNTIME = {
  actionHandlers: ['open-invoice', 'open-sync-details', 'open-activity-center'],
};

const PAGINATION_PROPS: PaginationPresentation = {
  type: PAGINATION_CONTRACT_TYPE,
  visibility: {
    hideWhenSinglePage: true,
  },
  range: {
    visible: true,
    format: 'start-end-of-total',
  },
  pageSize: {
    visible: true,
    options: [10, 25, 50, 100],
    label: 'Items per page',
  },
  navigation: {
    showFirst: true,
    showLast: true,
    showPrevious: true,
    showNext: true,
    showPageList: true,
    pageListMode: 'compact-ellipsis',
    maxVisiblePages: 7,
  },
  responsive: {
    collapsePageListBelow: 'md',
    stackBelow: 'lg',
  },
};

const PAGINATION_RUNTIME = {
  page: 2,
  pageSize: 25,
  totalItems: 132,
  totalPages: 6,
};

const PAGE_HEADER_PROPS: PageHeaderPresentation = {
  type: PAGE_HEADER_CONTRACT_TYPE,
  title: 'Customer Accounts',
  description: 'Manage customer lifecycle, access, and billing profile data.',
  eyebrow: 'Workspace / CRM',
  breadcrumbs: [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'customers', label: 'Customers', href: '/customers' },
    { key: 'accounts', label: 'Accounts' },
  ],
  meta: [
    { type: 'text', key: 'workspace', label: 'Workspace: Harbor' },
    { type: 'badge', key: 'status', label: 'Active', tone: 'success' },
  ],
  primaryAction: {
    key: 'create',
    label: 'Create Account',
    actionKey: 'create-account',
    intent: 'default',
  },
  secondaryActions: [
    {
      key: 'invite',
      label: 'Invite User',
      actionKey: 'invite-user',
    },
    {
      key: 'archive',
      label: 'Archive',
      actionKey: 'archive-account',
      intent: 'danger',
      hiddenWhenUnauthorized: true,
    },
  ],
  lowerSlot: {
    type: 'tabs',
  },
};

const PAGE_HEADER_RUNTIME = {
  authorizedActionKeys: ['create-account', 'invite-user'],
  lowerSlotContentText: 'Overview | Contacts | Billing | Activity',
};

const DETAIL_PAGE_PROPS: DetailPagePresentation = {
  title: 'Acme Corporation',
  metadata: [
    { key: 'createdAt', label: 'Created', value: '2026-01-12' },
    { key: 'createdBy', label: 'Created by', value: 'Marta Reed' },
    { key: 'updatedAt', label: 'Updated', value: '2026-03-12' },
    { key: 'updatedBy', label: 'Updated by', value: 'Lucas Shaw' },
    { key: 'version', label: 'Version', value: 'v12' },
    { key: 'status', label: 'Status', value: 'Active' },
  ],
  actions: [
    {
      key: 'edit',
      label: 'Edit',
      actionKey: 'edit-entity',
      variant: 'default',
    },
    {
      key: 'archive',
      label: 'Archive',
      actionKey: 'archive-entity',
      variant: 'destructive',
    },
  ],
  tabs: [
    {
      key: 'overview',
      label: 'Overview',
      href: '/primitives/detail-page',
      kind: 'overview',
    },
    {
      key: 'members',
      label: 'Members',
      href: '/primitives/detail-page',
      kind: 'domain',
    },
    {
      key: 'history',
      label: 'History',
      href: '/primitives/detail-page',
      kind: 'history',
    },
    {
      key: 'audit',
      label: 'Audit Log',
      href: '/primitives/detail-page',
      kind: 'audit',
    },
  ],
  activeTabKey: 'overview',
  overviewEditable: true,
  isEditing: false,
  content: {
    key: 'overview-content',
  },
};

const DETAIL_PAGE_RUNTIME = {
  actionHandlers: ['edit-entity', 'archive-entity'],
  contentByKey: {
    'overview-content': 'Overview content surface. Compose DetailSection blocks and related primitives here.',
  },
};

const DASHBOARD_PAGE_PROPS: DashboardPagePresentation = {
  variant: 'workspace',
  density: 'comfortable',
  title: 'Workspace Operations Dashboard',
  subtitle: 'Operational snapshot for March 2026',
  actions: [
    {
      key: 'refresh-all',
      label: 'Refresh',
      actionKey: 'refresh-all',
      variant: 'secondary',
    },
    {
      key: 'create-work-item',
      label: 'Create Work Item',
      actionKey: 'create-work-item',
      variant: 'default',
    },
  ],
  kpis: [
    {
      key: 'kpi-open-items',
      title: 'Open Work Items',
      subtitle: 'Current backlog',
      size: 'small',
      renderer: { key: 'kpi-open-items-renderer' },
    },
    {
      key: 'kpi-sla-risk',
      title: 'SLA At Risk',
      subtitle: 'Needs attention',
      size: 'small',
      renderer: { key: 'kpi-sla-risk-renderer' },
      renderState: {
        kind: 'error',
        state: {
          title: 'Metric unavailable',
          description: 'SLA source is temporarily unavailable.',
          variant: 'inline',
          severity: 'soft',
        },
      },
    },
    {
      key: 'kpi-throughput',
      title: '7-Day Throughput',
      subtitle: 'Completed this week',
      size: 'small',
      renderer: { key: 'kpi-throughput-renderer' },
    },
  ],
  primaryWidgets: [
    {
      key: 'queue-widget',
      title: 'Priority Queue',
      subtitle: 'Top actions for this morning',
      size: 'large',
      renderer: { key: 'priority-queue-renderer' },
      actions: [
        {
          key: 'open-queue',
          label: 'Open Queue',
          actionKey: 'open-queue',
        },
      ],
    },
    {
      key: 'activity-widget',
      title: 'Recent Activity',
      subtitle: 'Last 24 hours',
      size: 'medium',
      renderer: { key: 'activity-renderer' },
      actions: [
        {
          key: 'view-all-activity',
          label: 'View all',
          href: '/primitives/activity-feed',
        },
      ],
    },
  ],
  secondaryWidgets: [
    {
      key: 'announcements-widget',
      title: 'Announcements',
      subtitle: 'Team and platform updates',
      size: 'medium',
      renderer: { key: 'announcements-renderer' },
    },
    {
      key: 'health-widget',
      title: 'System Health',
      subtitle: 'Pipeline and sync status',
      size: 'small',
      renderer: { key: 'health-renderer' },
      actions: [
        {
          key: 'open-health',
          label: 'Open health',
          actionKey: 'open-health',
        },
      ],
    },
  ],
};

const DASHBOARD_PAGE_RUNTIME = {
  actionHandlers: ['refresh-all', 'create-work-item', 'open-queue', 'open-health'],
  widgetContentByRendererKey: {
    'kpi-open-items-renderer': {
      value: '128',
      delta: '+4.7%',
      deltaDirection: 'up',
      tone: 'info',
      icon: 'ops',
    },
    'kpi-throughput-renderer': {
      value: '46',
      delta: '+8.2%',
      deltaDirection: 'up',
      tone: 'success',
      icon: 'done',
    },
    'priority-queue-renderer': {
      primitive: 'data-grid',
      props: {
        type: 'data-grid',
        columns: [
          {
            key: 'name',
            field: 'name',
            label: 'Name',
            type: 'text',
            sortable: true,
          },
          {
            key: 'status',
            field: 'status',
            label: 'Status',
            type: 'badge',
          },
          {
            key: 'createdAt',
            field: 'createdAt',
            label: 'Created',
            type: 'date',
          },
        ],
        sorting: {
          enabled: true,
          mode: 'single',
        },
        pagination: {
          enabled: false,
        },
        emptyState: {
          title: 'No queued records',
          description: 'Everything in the queue is up to date.',
        },
      },
      runtime: {
        rows: DATA_GRID_RUNTIME.rows,
        sort: DATA_GRID_RUNTIME.sort,
      },
    },
    'activity-renderer': {
      primitive: 'activity-feed',
      props: {
        variant: 'timeline',
        density: 'compact',
        title: 'Recent activity',
        subtitle: 'Latest operational updates',
        items: [
          {
            key: 'evt-101',
            summary: 'Alice approved invoice INV-2026-014',
            actor: 'Alice Martin',
            timestamp: '2 minutes ago',
            targetLabel: 'INV-2026-014',
            tone: 'success',
            href: '/primitives/detail-page',
          },
          {
            key: 'evt-102',
            summary: 'Customer Acme Corporation moved to Active',
            actor: 'System',
            timestamp: '18 minutes ago',
            targetLabel: 'Acme Corporation',
            tone: 'info',
            href: '/primitives/detail-page',
          },
          {
            key: 'evt-103',
            summary: 'Connector sync reported warning',
            actor: 'Billing Connector',
            timestamp: 'Today at 09:14',
            targetLabel: 'Payments',
            tone: 'warning',
            href: '/primitives/error-state',
          },
        ],
        action: {
          label: 'View all',
          href: '/primitives/activity-feed',
        },
      },
      runtime: {},
    },
    'announcements-renderer': {
      primitive: 'card-list',
      props: CARD_LIST_PROPS,
      runtime: CARD_LIST_RUNTIME,
    },
    'health-renderer': {
      primitive: 'metric-card',
      props: {
        variant: 'compact',
        density: 'compact',
        label: 'System Health',
        value: 'Nominal',
        subtitle: 'API 84ms · Queue stable',
        tone: 'success',
        icon: 'ops',
      },
      runtime: {},
    },
  },
};

const DETAIL_SECTION_PROPS: DetailSectionPresentation = {
  type: DETAIL_SECTION_CONTRACT_TYPE,
  title: 'General Information',
  description: 'Read-mode grouping used in DetailPage Overview. Edit mode stays in IkaryForm.',
  actions: [
    {
      key: 'open-policy',
      label: 'Open Policy',
      actionKey: 'open-policy',
    },
  ],
  content: {
    mode: 'field-list',
    items: [
      {
        key: 'legalName',
        label: 'Legal name',
        field: 'customer.legalName',
        valueType: 'text',
      },
      {
        key: 'externalId',
        label: 'External ID',
        field: 'customer.externalId',
        valueType: 'text',
      },
      {
        key: 'owner',
        label: 'Owner',
        field: 'customer.owner.name',
        valueType: 'text',
      },
      {
        key: 'ownerEmail',
        label: 'Owner email',
        field: 'customer.owner.email',
        valueType: 'link',
      },
      {
        key: 'lifecycle',
        label: 'Lifecycle',
        field: 'customer.lifecycle',
        valueType: 'status',
      },
      {
        key: 'createdAt',
        label: 'Created',
        field: 'customer.createdAt',
        valueType: 'date',
      },
    ],
  },
  emphasis: 'default',
};

const DETAIL_SECTION_RUNTIME = {
  data: {
    customer: {
      id: 'cus-001',
      legalName: 'Acme Corporation',
      externalId: 'CUST-001',
      owner: {
        name: 'Marta Reed',
        email: 'marta@acme.io',
      },
      lifecycle: 'active',
      createdAt: '2026-02-10',
    },
  },
  authorizedActionKeys: ['open-policy'],
  linkBasePath: '/users',
};

const DETAIL_ITEM_PROPS: DetailItemPresentation = {
  type: DETAIL_ITEM_CONTRACT_TYPE,
  key: 'owner',
  label: 'Owner',
  field: 'customer.owner',
  kind: 'user-reference',
  showSecondary: true,
  emptyLabel: 'Not set',
};

const DETAIL_ITEM_RUNTIME = {
  data: {
    customer: {
      owner: {
        id: 'usr-102',
        name: 'Marta Reed',
        email: 'marta@acme.io',
      },
    },
  },
  linkBasePath: '/users',
};

const EMPTY_STATE_PROPS: EmptyStatePresentation = {
  title: 'No customer accounts yet',
  description: 'Create your first account to start tracking lifecycle and billing data.',
  icon: 'inbox',
  variant: 'initial',
  density: 'comfortable',
  primaryAction: {
    label: 'Create Account',
    actionKey: 'create-account',
  },
  secondaryAction: {
    label: 'Open Docs',
    href: '/docs/customer-accounts',
  },
};

const EMPTY_STATE_RUNTIME = {};

const ERROR_STATE_PROPS: ErrorStatePresentation = {
  title: 'Unable to load customer accounts',
  description: 'Please retry in a moment. If the issue continues, contact support.',
  icon: 'warning',
  variant: 'network',
  severity: 'soft',
  retryAction: {
    label: 'Retry',
    actionKey: 'retry-load',
  },
  secondaryAction: {
    label: 'Open support',
    href: '/support',
  },
  technicalDetails: {
    code: 'NET_TIMEOUT',
    correlationId: 'cor-9f3a2c71',
    message: 'Timed out while requesting accounts list',
  },
};

const ERROR_STATE_RUNTIME = {
  showTechnicalDetails: true,
};

const LOADING_STATE_PROPS: LoadingStatePresentation = {
  variant: 'section',
  density: 'comfortable',
  mode: 'mixed',
  label: 'Loading account details',
  description: 'This section is being refreshed.',
  skeleton: {
    lines: 4,
    blocks: 1,
    avatar: false,
  },
};

const LOADING_STATE_RUNTIME = {};

const FILTER_BAR_PROPS: FilterBarPresentation = {
  variant: 'list',
  density: 'comfortable',
  search: {
    value: 'acme',
    placeholder: 'Search accounts',
  },
  filters: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: 'active',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
    },
    {
      key: 'archived',
      label: 'Archived',
      type: 'toggle',
      value: false,
    },
    {
      key: 'createdAt',
      label: 'Created between',
      type: 'date-range',
      value: {
        from: '2026-01-01',
        to: '2026-03-01',
      },
    },
  ],
  sort: {
    value: 'createdAt:desc',
    placeholder: 'Sort by',
    options: [
      { value: 'createdAt:desc', label: 'Newest first' },
      { value: 'createdAt:asc', label: 'Oldest first' },
      { value: 'name:asc', label: 'Name A-Z' },
    ],
  },
  activeFilters: [
    { key: 'status', label: 'Status', valueLabel: 'Active' },
    { key: 'dateRange', label: 'Created', valueLabel: 'Jan 1 to Mar 1' },
  ],
  clearAction: {
    label: 'Clear filters',
    actionKey: 'clear-filters',
  },
  advancedFilters: {
    enabled: true,
    open: true,
    label: 'Advanced filters',
  },
};

const FILTER_BAR_RUNTIME = {
  loading: false,
};

const BULK_COMMAND_BAR_PROPS: BulkCommandBarPresentation = {
  variant: 'list',
  density: 'comfortable',
  selectedCount: 24,
  scope: 'page',
  summaryLabel: '24 customer accounts selected',
  actions: [
    {
      key: 'export-selected',
      label: 'Export Selected',
      variant: 'secondary',
    },
    {
      key: 'archive-selected',
      label: 'Archive Selected',
      variant: 'destructive',
      confirm: {
        title: 'Archive selected accounts?',
        description: 'This action updates account lifecycle and will be written to audit history.',
        confirmLabel: 'Archive',
        cancelLabel: 'Cancel',
      },
    },
  ],
  overflowActions: [
    {
      key: 'assign-owner',
      label: 'Assign Owner',
      variant: 'default',
    },
    {
      key: 'tag-selected',
      label: 'Apply Tag',
      variant: 'secondary',
    },
  ],
  clearSelectionAction: {
    label: 'Clear selection',
    actionKey: 'clear-selection',
  },
  selectAllResultsAction: {
    label: 'Select all 128 results',
    actionKey: 'select-all-results',
  },
};

const BULK_COMMAND_BAR_RUNTIME = {};

const FIELD_VALUE_PROPS: FieldValuePresentation = {
  type: FIELD_VALUE_CONTRACT_TYPE,
  valueType: 'link',
  link: {
    target: 'internal',
  },
  truncate: true,
  tooltip: true,
};

const FIELD_VALUE_RUNTIME = {
  value: 'Acme Corporation',
  href: '/customers/cus-001',
};

const INPUT_PROPS: InputPresentation = {
  inputType: 'email',
  placeholder: 'owner@company.com',
  required: true,
  leadingText: '@',
};

const INPUT_RUNTIME = {
  value: 'ops@ikary.io',
};

const TEXTAREA_PROPS: TextareaPresentation = {
  placeholder: 'Add context for operators',
  rows: 4,
  required: true,
};

const TEXTAREA_RUNTIME = {
  value: 'Keep enterprise-facing copy concise and explicit.',
};

const SELECT_PROPS: SelectPresentation = {
  placeholder: 'Select region',
  options: [
    { value: 'emea', label: 'EMEA' },
    { value: 'na', label: 'North America' },
    { value: 'apac', label: 'APAC' },
  ],
};

const SELECT_RUNTIME = {
  value: 'emea',
};

const CHECKBOX_PROPS: CheckboxPresentation = {
  label: 'Audit trail enabled',
};

const CHECKBOX_RUNTIME = {
  checked: true,
};

const RADIO_GROUP_PROPS: RadioGroupPresentation = {
  direction: 'vertical',
  options: [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' },
    { value: 'hybrid', label: 'Hybrid', description: 'Manual fallback available' },
  ],
};

const RADIO_GROUP_RUNTIME = {
  value: 'automatic',
};

const TOGGLE_PROPS: TogglePresentation = {
  label: 'Enable notifications',
};

const TOGGLE_RUNTIME = {
  checked: true,
};

const DATE_INPUT_PROPS: DateInputPresentation = {
  required: true,
};

const DATE_INPUT_RUNTIME = {
  value: '2026-03-12',
};

const FORM_FIELD_PROPS: FormFieldPresentation = {
  type: FORM_FIELD_CONTRACT_TYPE,
  key: 'region',
  variant: 'standard',
  control: 'select',
  label: 'Region',
  placeholder: 'Select region',
  required: true,
  options: [
    { key: 'emea', label: 'EMEA', value: 'emea' },
    { key: 'na', label: 'North America', value: 'na' },
    { key: 'apac', label: 'APAC', value: 'apac' },
  ],
  helpText: 'FormField delegates control rendering to the shared Select primitive.',
  smallTip: 'Switch control in JSON to text/textarea/date/toggle to test others.',
  message: {
    tone: 'warning',
    text: 'Selection should match customer billing geography.',
  },
};

const FORM_FIELD_RUNTIME = {
  value: 'emea',
};

const FORM_SECTION_PROPS: FormSectionPresentation = {
  type: FORM_SECTION_CONTRACT_TYPE,
  key: 'general-information',
  title: 'General Information',
  description: 'Core project settings using the shared input/control primitives.',
  layout: 'stack',
  collapsible: true,
  defaultExpanded: true,
  fields: [
    {
      type: FORM_FIELD_CONTRACT_TYPE,
      key: 'projectName',
      variant: 'standard',
      control: 'text',
      label: 'Project name',
      required: true,
      helpText: 'Rendered with the Input primitive.',
      placeholder: 'Enter project name',
    },
    {
      type: FORM_FIELD_CONTRACT_TYPE,
      key: 'ownerEmail',
      variant: 'standard',
      control: 'email',
      label: 'Owner email',
      helpText: 'Rendered with the Input primitive in email mode.',
      placeholder: 'owner@company.com',
    },
    {
      type: FORM_FIELD_CONTRACT_TYPE,
      key: 'accessCode',
      variant: 'standard',
      control: 'password',
      label: 'Access code',
      placeholder: '********',
    },
    {
      type: FORM_FIELD_CONTRACT_TYPE,
      key: 'teamSize',
      variant: 'standard',
      control: 'number',
      label: 'Team size',
      placeholder: '25',
    },
    {
      type: FORM_FIELD_CONTRACT_TYPE,
      key: 'summary',
      variant: 'standard',
      control: 'textarea',
      label: 'Summary',
      helpText: 'Rendered with the Textarea primitive.',
      placeholder: 'Summarize customer scope and commitments.',
    },
    {
      type: FORM_FIELD_CONTRACT_TYPE,
      key: 'region',
      variant: 'standard',
      control: 'select',
      label: 'Region',
      options: [
        { key: 'emea', label: 'EMEA', value: 'emea' },
        { key: 'na', label: 'North America', value: 'na' },
        { key: 'apac', label: 'APAC', value: 'apac' },
      ],
      placeholder: 'Select region',
    },
    {
      type: FORM_FIELD_CONTRACT_TYPE,
      key: 'launchDate',
      variant: 'standard',
      control: 'date',
      label: 'Launch date',
      helpText: 'Rendered with the DateInput primitive.',
    },
    {
      type: FORM_FIELD_CONTRACT_TYPE,
      key: 'notificationsEnabled',
      variant: 'standard',
      control: 'toggle',
      label: 'Notifications enabled',
      helpText: 'Rendered with the Toggle primitive.',
    },
    {
      type: FORM_FIELD_CONTRACT_TYPE,
      key: 'isActive',
      variant: 'checkbox',
      label: 'Project is active',
      helpText: 'Rendered with the Checkbox primitive.',
    },
    {
      type: FORM_FIELD_CONTRACT_TYPE,
      key: 'approvalMode',
      variant: 'choice-group',
      legend: 'Approval mode',
      options: [
        { key: 'manual', label: 'Manual', value: 'manual' },
        { key: 'automatic', label: 'Automatic', value: 'automatic' },
      ],
      helpText: 'Rendered with the RadioGroup primitive.',
    },
  ],
  actions: [
    {
      key: 'add-owner',
      label: 'Add Owner',
      actionKey: 'add-owner',
      intent: 'neutral',
    },
  ],
};

const FORM_SECTION_RUNTIME = {
  fieldValues: {
    projectName: 'Harbor Platform',
    ownerEmail: 'ops@ikary.io',
    accessCode: 'secret-2026',
    teamSize: 42,
    summary: 'Primary enterprise workspace for customer account operations.',
    region: 'emea',
    launchDate: '2026-03-01',
    notificationsEnabled: true,
    isActive: true,
    approvalMode: 'manual',
  },
  authorizedActionKeys: ['add-owner'],
  expanded: true,
};

const IKARY_FORM_PROPS: IkaryFormPresentation = {
  type: IKARY_FORM_CONTRACT_TYPE,
  key: 'customer-profile-form',
  title: 'Customer Profile',
  description: 'Edit customer identity, ownership, and lifecycle defaults.',
  mode: 'draft-and-commit',
  autosave: {
    enabled: true,
    debounceMs: 900,
    saveOnBlur: true,
  },
  actionLabels: {
    saveDraft: 'Save Draft',
    commit: 'Publish Changes',
    discard: 'Discard',
    retry: 'Retry',
    resolveConflict: 'Resolve Conflict',
  },
  sections: [
    FORM_SECTION_PROPS,
    {
      type: FORM_SECTION_CONTRACT_TYPE,
      key: 'governance',
      title: 'Governance',
      description: 'Canonical business controls for this entity.',
      layout: 'stack',
      fields: [
        {
          type: FORM_FIELD_CONTRACT_TYPE,
          key: 'releaseChannel',
          variant: 'standard',
          control: 'select',
          label: 'Release channel',
          options: [
            { key: 'stable', label: 'Stable', value: 'stable' },
            { key: 'canary', label: 'Canary', value: 'canary' },
            { key: 'beta', label: 'Beta', value: 'beta' },
          ],
          helpText: 'Rendered with the shared Select primitive.',
        },
        {
          type: FORM_FIELD_CONTRACT_TYPE,
          key: 'auditEnabled',
          variant: 'checkbox',
          label: 'Audit trail enabled',
          helpText: 'Capture all edits in immutable audit history.',
        },
        {
          type: FORM_FIELD_CONTRACT_TYPE,
          key: 'changeControlMode',
          variant: 'choice-group',
          legend: 'Change control mode',
          options: [
            { key: 'manual-review', label: 'Manual review', value: 'manual-review' },
            { key: 'auto-approve', label: 'Auto approve', value: 'auto-approve' },
          ],
          helpText: 'Rendered with the shared RadioGroup primitive.',
        },
      ],
      actions: [
        {
          key: 'open-policy',
          label: 'Open Policy',
          actionKey: 'open-policy',
        },
      ],
    },
  ],
  reviewRequired: true,
};

const IKARY_FORM_RUNTIME = {
  initialValues: {
    projectName: 'Harbor Platform',
    ownerEmail: 'ops@ikary.io',
    accessCode: 'secret-2026',
    teamSize: 42,
    summary: 'Primary enterprise workspace for customer account operations.',
    region: 'emea',
    launchDate: '2026-03-01',
    notificationsEnabled: true,
    isActive: true,
    approvalMode: 'manual',
    releaseChannel: 'stable',
    auditEnabled: true,
    changeControlMode: 'manual-review',
  },
  draftValues: {
    projectName: 'Harbor Platform',
    ownerEmail: 'platform-ops@ikary.io',
    accessCode: 'secret-2026',
    teamSize: 44,
    summary: 'Updated rollout summary for Q2 onboarding.',
    region: 'na',
    launchDate: '2026-03-15',
    notificationsEnabled: false,
    isActive: true,
    approvalMode: 'automatic',
    releaseChannel: 'canary',
    auditEnabled: true,
    changeControlMode: 'auto-approve',
  },
  permissions: {
    canEdit: true,
    canSaveDraft: true,
    canCommit: true,
    canDiscard: true,
    canResolveConflict: true,
  },
  expandedSections: {
    'general-information': true,
    governance: true,
  },
  authorizedActionKeys: ['add-owner', 'open-policy'],
  lastSavedAt: '2026-03-12T09:45:00.000Z',
  saveDraftDelayMs: 350,
  commitDelayMs: 550,
};

const TABS_PROPS: TabsPresentation = {
  type: TABS_CONTRACT_TYPE,
  activeKey: 'overview',
  overflow: {
    mode: 'menu',
    collapseBelow: 'md',
  },
  items: [
    {
      key: 'overview',
      label: 'Overview',
      href: '/primitives/tabs',
      count: 12,
    },
    {
      key: 'activity',
      label: 'Activity',
      actionKey: 'open-activity',
      count: 4,
    },
    {
      key: 'billing',
      label: 'Billing',
      actionKey: 'open-billing',
      hiddenWhenUnauthorized: true,
    },
    {
      key: 'settings',
      label: 'Settings',
      href: '/primitives/tabs',
      disabled: true,
    },
  ],
};

const TABS_RUNTIME = {
  authorizedActionKeys: ['open-activity'],
};

const LIST_PAGE_PROPS: ListPagePresentation = {
  type: LIST_PAGE_CONTRACT_TYPE,
  header: {
    type: PAGE_HEADER_CONTRACT_TYPE,
    title: 'Customer Accounts',
    description: 'Manage customer lifecycle and account health.',
    eyebrow: 'Workspace / CRM',
    primaryAction: {
      key: 'create',
      label: 'Create Account',
      actionKey: 'create-account',
      intent: 'default',
    },
    secondaryActions: [
      {
        key: 'export',
        label: 'Export CSV',
        actionKey: 'export-list',
      },
    ],
  },
  navigation: {
    type: TABS_CONTRACT_TYPE,
    activeKey: 'all',
    overflow: {
      mode: 'menu',
      collapseBelow: 'md',
    },
    items: [
      { key: 'all', label: 'All', href: '/primitives/list-page', count: 128 },
      { key: 'active', label: 'Active', actionKey: 'open-active', count: 84 },
      { key: 'inactive', label: 'Inactive', actionKey: 'open-inactive', count: 44 },
    ],
  },
  controls: {
    search: {
      visible: true,
      placeholder: 'Search accounts',
    },
    filters: {
      visible: true,
      mode: 'inline',
      items: [
        { key: 'status', label: 'Status: Active' },
        { key: 'region', label: 'Region: EMEA' },
      ],
    },
    sorting: {
      visible: true,
      mode: 'summary',
    },
    bulkActions: {
      visibleWhenSelection: true,
    },
  },
  renderer: {
    mode: 'data-grid',
    presentation: DATA_GRID_PROPS,
  },
  pagination: PAGINATION_PROPS,
  emptyState: {
    title: 'No accounts found',
    description: 'Try changing your search or filters.',
  },
};

const LIST_PAGE_RUNTIME = {
  headerRuntime: {
    authorizedActionKeys: ['create-account', 'export-list'],
  },
  navigationRuntime: {
    authorizedActionKeys: ['open-active'],
  },
  rendererRuntime: {
    rows: DATA_GRID_RUNTIME.rows,
    selectedRowIds: DATA_GRID_RUNTIME.selectedRowIds,
    sort: DATA_GRID_RUNTIME.sort,
  },
  paginationRuntime: PAGINATION_RUNTIME,
  controlsRuntime: {
    searchValue: 'acme',
    sortingLabel: 'Sorted by Created (asc)',
    bulkActionsVisible: true,
    bulkActions: [
      { key: 'export-selected', label: 'Export Selected' },
      { key: 'archive-selected', label: 'Archive Selected', intent: 'danger' },
    ],
  },
  loading: false,
};

export const PRIMITIVE_DEMOS: Record<string, PrimitiveDemo> = {
  'data-grid': {
    label: 'Data Grid',
    description: 'Preview through PrimitiveRenderer using presentation contract props + runtime state',
    primitive: 'data-grid',
    contractType: DATA_GRID_CONTRACT_TYPE,
    props: DATA_GRID_PROPS as unknown as Record<string, unknown>,
    runtime: DATA_GRID_RUNTIME,
  },

  'card-list': {
    label: 'Card List',
    description: 'Preview through PrimitiveRenderer using CardList contract props + runtime state',
    primitive: 'card-list',
    contractType: CARD_LIST_CONTRACT_TYPE,
    props: CARD_LIST_PROPS as Record<string, unknown>,
    runtime: CARD_LIST_RUNTIME,
  },

  'metric-card': {
    label: 'Metric Card',
    description: 'Preview through PrimitiveRenderer using MetricCardPresentation contract props + runtime state',
    primitive: 'metric-card',
    contractType: METRIC_CARD_CONTRACT_TYPE,
    props: METRIC_CARD_PROPS as unknown as Record<string, unknown>,
    runtime: METRIC_CARD_RUNTIME,
  },

  'activity-feed': {
    label: 'Activity Feed',
    description: 'Preview through PrimitiveRenderer using ActivityFeedPresentation contract props + runtime state',
    primitive: 'activity-feed',
    contractType: ACTIVITY_FEED_CONTRACT_TYPE,
    props: ACTIVITY_FEED_PROPS as unknown as Record<string, unknown>,
    runtime: ACTIVITY_FEED_RUNTIME,
  },

  pagination: {
    label: 'Pagination',
    description: 'Preview through PrimitiveRenderer using presentation contract props + runtime state',
    primitive: 'pagination',
    contractType: PAGINATION_CONTRACT_TYPE,
    props: PAGINATION_PROPS as unknown as Record<string, unknown>,
    runtime: PAGINATION_RUNTIME,
  },

  'page-header': {
    label: 'Page Header',
    description: 'Preview through PrimitiveRenderer using PageHeaderPresentation contract props + runtime state',
    primitive: 'page-header',
    contractType: PAGE_HEADER_CONTRACT_TYPE,
    props: PAGE_HEADER_PROPS as unknown as Record<string, unknown>,
    runtime: PAGE_HEADER_RUNTIME,
  },

  'detail-page': {
    label: 'Detail Page',
    description: 'Preview through PrimitiveRenderer using DetailPagePresentation contract props + runtime state',
    primitive: 'detail-page',
    contractType: DETAIL_PAGE_CONTRACT_TYPE,
    props: DETAIL_PAGE_PROPS as unknown as Record<string, unknown>,
    runtime: DETAIL_PAGE_RUNTIME,
  },

  'dashboard-page': {
    label: 'Dashboard Page',
    description: 'Preview through PrimitiveRenderer using DashboardPagePresentation contract props + runtime state',
    primitive: 'dashboard-page',
    contractType: DASHBOARD_PAGE_CONTRACT_TYPE,
    props: DASHBOARD_PAGE_PROPS as unknown as Record<string, unknown>,
    runtime: DASHBOARD_PAGE_RUNTIME,
  },

  'detail-section': {
    label: 'Detail Section',
    description: 'Preview through PrimitiveRenderer using DetailSectionPresentation contract props + runtime state',
    primitive: 'detail-section',
    contractType: DETAIL_SECTION_CONTRACT_TYPE,
    props: DETAIL_SECTION_PROPS as unknown as Record<string, unknown>,
    runtime: DETAIL_SECTION_RUNTIME,
  },

  'detail-item': {
    label: 'Detail Item',
    description: 'Preview through PrimitiveRenderer using DetailItemPresentation contract props + runtime state',
    primitive: 'detail-item',
    contractType: DETAIL_ITEM_CONTRACT_TYPE,
    props: DETAIL_ITEM_PROPS as unknown as Record<string, unknown>,
    runtime: DETAIL_ITEM_RUNTIME,
  },

  'empty-state': {
    label: 'Empty State',
    description: 'Preview through PrimitiveRenderer using EmptyStatePresentation contract props + runtime state',
    primitive: 'empty-state',
    contractType: EMPTY_STATE_CONTRACT_TYPE,
    props: EMPTY_STATE_PROPS as unknown as Record<string, unknown>,
    runtime: EMPTY_STATE_RUNTIME,
  },

  'error-state': {
    label: 'Error State',
    description: 'Preview through PrimitiveRenderer using ErrorStatePresentation contract props + runtime state',
    primitive: 'error-state',
    contractType: ERROR_STATE_CONTRACT_TYPE,
    props: ERROR_STATE_PROPS as unknown as Record<string, unknown>,
    runtime: ERROR_STATE_RUNTIME,
  },

  'loading-state': {
    label: 'Loading State',
    description: 'Preview through PrimitiveRenderer using LoadingStatePresentation contract props + runtime state',
    primitive: 'loading-state',
    contractType: LOADING_STATE_CONTRACT_TYPE,
    props: LOADING_STATE_PROPS as unknown as Record<string, unknown>,
    runtime: LOADING_STATE_RUNTIME,
  },

  'filter-bar': {
    label: 'Filter Bar',
    description: 'Preview through PrimitiveRenderer using FilterBarPresentation contract props + runtime state',
    primitive: 'filter-bar',
    contractType: FILTER_BAR_CONTRACT_TYPE,
    props: FILTER_BAR_PROPS as unknown as Record<string, unknown>,
    runtime: FILTER_BAR_RUNTIME,
  },

  'bulk-command-bar': {
    label: 'Bulk Command Bar',
    description: 'Preview through PrimitiveRenderer using BulkCommandBarPresentation contract props + runtime state',
    primitive: 'bulk-command-bar',
    contractType: BULK_COMMAND_BAR_CONTRACT_TYPE,
    props: BULK_COMMAND_BAR_PROPS as unknown as Record<string, unknown>,
    runtime: BULK_COMMAND_BAR_RUNTIME,
  },

  'field-value': {
    label: 'Field Value',
    description: 'Preview through PrimitiveRenderer using FieldValuePresentation contract props + runtime state',
    primitive: 'field-value',
    contractType: FIELD_VALUE_CONTRACT_TYPE,
    props: FIELD_VALUE_PROPS as unknown as Record<string, unknown>,
    runtime: FIELD_VALUE_RUNTIME,
  },

  input: {
    label: 'Input',
    description: 'Preview through PrimitiveRenderer using InputPresentation contract props + runtime state',
    primitive: 'input',
    contractType: INPUT_CONTRACT_TYPE,
    props: INPUT_PROPS as unknown as Record<string, unknown>,
    runtime: INPUT_RUNTIME,
  },

  textarea: {
    label: 'Textarea',
    description: 'Preview through PrimitiveRenderer using TextareaPresentation contract props + runtime state',
    primitive: 'textarea',
    contractType: TEXTAREA_CONTRACT_TYPE,
    props: TEXTAREA_PROPS as unknown as Record<string, unknown>,
    runtime: TEXTAREA_RUNTIME,
  },

  select: {
    label: 'Select',
    description: 'Preview through PrimitiveRenderer using SelectPresentation contract props + runtime state',
    primitive: 'select',
    contractType: SELECT_CONTRACT_TYPE,
    props: SELECT_PROPS as unknown as Record<string, unknown>,
    runtime: SELECT_RUNTIME,
  },

  checkbox: {
    label: 'Checkbox',
    description: 'Preview through PrimitiveRenderer using CheckboxPresentation contract props + runtime state',
    primitive: 'checkbox',
    contractType: CHECKBOX_CONTRACT_TYPE,
    props: CHECKBOX_PROPS as unknown as Record<string, unknown>,
    runtime: CHECKBOX_RUNTIME,
  },

  'radio-group': {
    label: 'Radio Group',
    description: 'Preview through PrimitiveRenderer using RadioGroupPresentation contract props + runtime state',
    primitive: 'radio-group',
    contractType: RADIO_GROUP_CONTRACT_TYPE,
    props: RADIO_GROUP_PROPS as unknown as Record<string, unknown>,
    runtime: RADIO_GROUP_RUNTIME,
  },

  toggle: {
    label: 'Toggle',
    description: 'Preview through PrimitiveRenderer using TogglePresentation contract props + runtime state',
    primitive: 'toggle',
    contractType: TOGGLE_CONTRACT_TYPE,
    props: TOGGLE_PROPS as unknown as Record<string, unknown>,
    runtime: TOGGLE_RUNTIME,
  },

  'date-input': {
    label: 'Date Input',
    description: 'Preview through PrimitiveRenderer using DateInputPresentation contract props + runtime state',
    primitive: 'date-input',
    contractType: DATE_INPUT_CONTRACT_TYPE,
    props: DATE_INPUT_PROPS as unknown as Record<string, unknown>,
    runtime: DATE_INPUT_RUNTIME,
  },

  'form-field': {
    label: 'Form Field',
    description: 'Preview through PrimitiveRenderer using FormFieldPresentation contract props + runtime state',
    primitive: 'form-field',
    contractType: FORM_FIELD_CONTRACT_TYPE,
    props: FORM_FIELD_PROPS as unknown as Record<string, unknown>,
    runtime: FORM_FIELD_RUNTIME,
  },

  'form-section': {
    label: 'Form Section',
    description: 'Preview through PrimitiveRenderer using FormSectionPresentation contract props + runtime state',
    primitive: 'form-section',
    contractType: FORM_SECTION_CONTRACT_TYPE,
    props: FORM_SECTION_PROPS as unknown as Record<string, unknown>,
    runtime: FORM_SECTION_RUNTIME,
  },

  form: {
    label: 'Ikary Form',
    description: 'Preview through PrimitiveRenderer using IkaryFormPresentation contract props + runtime state',
    primitive: 'form',
    contractType: IKARY_FORM_CONTRACT_TYPE,
    props: IKARY_FORM_PROPS as unknown as Record<string, unknown>,
    runtime: IKARY_FORM_RUNTIME,
  },

  'list-page': {
    label: 'List Page',
    description: 'Preview through PrimitiveRenderer using ListPagePresentation contract props + runtime state',
    primitive: 'list-page',
    contractType: LIST_PAGE_CONTRACT_TYPE,
    props: LIST_PAGE_PROPS as unknown as Record<string, unknown>,
    runtime: LIST_PAGE_RUNTIME,
  },

  tabs: {
    label: 'Tabs',
    description: 'Preview through PrimitiveRenderer using TabsPresentation contract props + runtime state',
    primitive: 'tabs',
    contractType: TABS_CONTRACT_TYPE,
    props: TABS_PROPS as unknown as Record<string, unknown>,
    runtime: TABS_RUNTIME,
  },
};

export const DEFAULT_DEMO = PRIMITIVE_DEMOS['data-grid'];
