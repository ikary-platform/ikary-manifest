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
  BadgePresentation,
  SeparatorPresentation,
  LabelPresentation,
  ButtonPresentation,
  AlertPresentation,
  ProgressPresentation,
  SkeletonPresentation,
  AvatarPresentation,
  BreadcrumbPresentation,
  CardPresentation,
} from '@ikary/presentation';

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
  | 'badge'
  | 'separator'
  | 'label'
  | 'button'
  | 'alert'
  | 'progress'
  | 'skeleton'
  | 'avatar'
  | 'breadcrumb'
  | 'card'
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

export interface PrimitiveScenario {
  label: string;
  description?: string;
  props: Record<string, unknown>;
  runtime: Record<string, unknown>;
}

export interface PrimitiveDemoEntry {
  primitive: string;
  contractType: ContractPresentationType;
  scenarios: PrimitiveScenario[];
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
const BADGE_CONTRACT_TYPE = 'badge' as const;
const SEPARATOR_CONTRACT_TYPE = 'separator' as const;
const LABEL_CONTRACT_TYPE = 'label' as const;
const BUTTON_CONTRACT_TYPE = 'button' as const;
const ALERT_CONTRACT_TYPE = 'alert' as const;
const PROGRESS_CONTRACT_TYPE = 'progress' as const;
const SKELETON_CONTRACT_TYPE = 'skeleton' as const;
const AVATAR_CONTRACT_TYPE = 'avatar' as const;
const BREADCRUMB_CONTRACT_TYPE = 'breadcrumb' as const;
const CARD_CONTRACT_TYPE = 'card' as const;

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

const TABS_PROPS_LINE: TabsPresentation = {
  type: TABS_CONTRACT_TYPE,
  variant: 'line',
  activeKey: 'overview',
  overflow: { mode: 'scroll' },
  items: [
    { key: 'overview', label: 'Overview', href: '/primitives/tabs' },
    { key: 'activity', label: 'Activity', actionKey: 'open-activity' },
    { key: 'billing', label: 'Billing', actionKey: 'open-billing' },
    { key: 'settings', label: 'Settings', href: '/primitives/tabs', disabled: true },
  ],
};
const TABS_RUNTIME_LINE = { authorizedActionKeys: ['open-activity', 'open-billing'] };

const TABS_PROPS_PILL: TabsPresentation = {
  type: TABS_CONTRACT_TYPE,
  variant: 'pill',
  activeKey: 'active',
  items: [
    { key: 'all', label: 'All', href: '/primitives/tabs' },
    { key: 'active', label: 'Active', href: '/primitives/tabs' },
    { key: 'archived', label: 'Archived', href: '/primitives/tabs' },
  ],
};
const TABS_RUNTIME_PILL = {};

const TABS_PROPS_COUNTS: TabsPresentation = {
  type: TABS_CONTRACT_TYPE,
  variant: 'line',
  activeKey: 'overview',
  items: [
    { key: 'overview', label: 'Overview', href: '/primitives/tabs', count: 12 },
    { key: 'activity', label: 'Activity', actionKey: 'open-activity', count: 4 },
    { key: 'billing', label: 'Billing', actionKey: 'open-billing', hiddenWhenUnauthorized: true },
    { key: 'settings', label: 'Settings', href: '/primitives/tabs', disabled: true },
  ],
};
const TABS_RUNTIME_COUNTS = { authorizedActionKeys: ['open-activity'] };

const TABS_PROPS_DENSE: TabsPresentation = {
  type: TABS_CONTRACT_TYPE,
  variant: 'line',
  activeKey: 'open',
  dense: true,
  items: [
    { key: 'open', label: 'Open', href: '/primitives/tabs' },
    { key: 'pending', label: 'Pending', href: '/primitives/tabs' },
    { key: 'closed', label: 'Closed', href: '/primitives/tabs' },
    { key: 'all', label: 'All', href: '/primitives/tabs' },
  ],
};
const TABS_RUNTIME_DENSE = {};

const TABS_PROPS_OVERFLOW: TabsPresentation = {
  type: TABS_CONTRACT_TYPE,
  variant: 'line',
  activeKey: 'tab3',
  overflow: { mode: 'scroll' },
  items: [
    { key: 'tab1', label: 'Summary', href: '/primitives/tabs' },
    { key: 'tab2', label: 'Timeline', href: '/primitives/tabs' },
    { key: 'tab3', label: 'Documents', href: '/primitives/tabs' },
    { key: 'tab4', label: 'Contacts', href: '/primitives/tabs' },
    { key: 'tab5', label: 'Billing', href: '/primitives/tabs' },
    { key: 'tab6', label: 'Tasks', href: '/primitives/tabs' },
    { key: 'tab7', label: 'Notes', href: '/primitives/tabs' },
    { key: 'tab8', label: 'Integrations', href: '/primitives/tabs' },
  ],
};
const TABS_RUNTIME_OVERFLOW = {};

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

export const PRIMITIVE_DEMOS: Record<string, PrimitiveDemoEntry> = {
  'data-grid': {
    primitive: 'data-grid',
    contractType: DATA_GRID_CONTRACT_TYPE,
    scenarios: [{
      label: 'Data Grid',
      description: 'Preview through PrimitiveRenderer using presentation contract props + runtime state',
      props: DATA_GRID_PROPS as unknown as Record<string, unknown>,
      runtime: DATA_GRID_RUNTIME,
    }],
  },

  'card-list': {
    primitive: 'card-list',
    contractType: CARD_LIST_CONTRACT_TYPE,
    scenarios: [{
      label: 'Card List',
      description: 'Preview through PrimitiveRenderer using CardList contract props + runtime state',
      props: CARD_LIST_PROPS as Record<string, unknown>,
      runtime: CARD_LIST_RUNTIME,
    }],
  },

  'metric-card': {
    primitive: 'metric-card',
    contractType: METRIC_CARD_CONTRACT_TYPE,
    scenarios: [{
      label: 'Metric Card',
      description: 'Preview through PrimitiveRenderer using MetricCardPresentation contract props + runtime state',
      props: METRIC_CARD_PROPS as unknown as Record<string, unknown>,
      runtime: METRIC_CARD_RUNTIME,
    }],
  },

  'activity-feed': {
    primitive: 'activity-feed',
    contractType: ACTIVITY_FEED_CONTRACT_TYPE,
    scenarios: [{
      label: 'Activity Feed',
      description: 'Preview through PrimitiveRenderer using ActivityFeedPresentation contract props + runtime state',
      props: ACTIVITY_FEED_PROPS as unknown as Record<string, unknown>,
      runtime: ACTIVITY_FEED_RUNTIME,
    }],
  },

  pagination: {
    primitive: 'pagination',
    contractType: PAGINATION_CONTRACT_TYPE,
    scenarios: [
      {
        label: 'Middle page',
        description: 'Page 2 of 6 — range, page size, and full nav controls visible',
        props: PAGINATION_PROPS as unknown as Record<string, unknown>,
        runtime: PAGINATION_RUNTIME,
      },
      {
        label: 'First page',
        description: 'Page 1 — First and Previous buttons disabled',
        props: PAGINATION_PROPS as unknown as Record<string, unknown>,
        runtime: { page: 1, pageSize: 25, totalItems: 132, totalPages: 6 },
      },
      {
        label: 'Last page',
        description: 'Page 6 — Next and Last buttons disabled',
        props: PAGINATION_PROPS as unknown as Record<string, unknown>,
        runtime: { page: 6, pageSize: 25, totalItems: 132, totalPages: 6 },
      },
      {
        label: 'Single page (hidden)',
        description: 'hideWhenSinglePage=true with only 1 page — renders nothing',
        props: PAGINATION_PROPS as unknown as Record<string, unknown>,
        runtime: { page: 1, pageSize: 50, totalItems: 12, totalPages: 1 },
      },
    ],
  },

  'page-header': {
    primitive: 'page-header',
    contractType: PAGE_HEADER_CONTRACT_TYPE,
    scenarios: [{
      label: 'Page Header',
      description: 'Preview through PrimitiveRenderer using PageHeaderPresentation contract props + runtime state',
      props: PAGE_HEADER_PROPS as unknown as Record<string, unknown>,
      runtime: PAGE_HEADER_RUNTIME,
    }],
  },

  'detail-page': {
    primitive: 'detail-page',
    contractType: DETAIL_PAGE_CONTRACT_TYPE,
    scenarios: [{
      label: 'Detail Page',
      description: 'Preview through PrimitiveRenderer using DetailPagePresentation contract props + runtime state',
      props: DETAIL_PAGE_PROPS as unknown as Record<string, unknown>,
      runtime: DETAIL_PAGE_RUNTIME,
    }],
  },

  'dashboard-page': {
    primitive: 'dashboard-page',
    contractType: DASHBOARD_PAGE_CONTRACT_TYPE,
    scenarios: [{
      label: 'Dashboard Page',
      description: 'Preview through PrimitiveRenderer using DashboardPagePresentation contract props + runtime state',
      props: DASHBOARD_PAGE_PROPS as unknown as Record<string, unknown>,
      runtime: DASHBOARD_PAGE_RUNTIME,
    }],
  },

  'detail-section': {
    primitive: 'detail-section',
    contractType: DETAIL_SECTION_CONTRACT_TYPE,
    scenarios: [{
      label: 'Detail Section',
      description: 'Preview through PrimitiveRenderer using DetailSectionPresentation contract props + runtime state',
      props: DETAIL_SECTION_PROPS as unknown as Record<string, unknown>,
      runtime: DETAIL_SECTION_RUNTIME,
    }],
  },

  'detail-item': {
    primitive: 'detail-item',
    contractType: DETAIL_ITEM_CONTRACT_TYPE,
    scenarios: [{
      label: 'Detail Item',
      description: 'Preview through PrimitiveRenderer using DetailItemPresentation contract props + runtime state',
      props: DETAIL_ITEM_PROPS as unknown as Record<string, unknown>,
      runtime: DETAIL_ITEM_RUNTIME,
    }],
  },

  'empty-state': {
    primitive: 'empty-state',
    contractType: EMPTY_STATE_CONTRACT_TYPE,
    scenarios: [{
      label: 'Empty State',
      description: 'Preview through PrimitiveRenderer using EmptyStatePresentation contract props + runtime state',
      props: EMPTY_STATE_PROPS as unknown as Record<string, unknown>,
      runtime: EMPTY_STATE_RUNTIME,
    }],
  },

  'error-state': {
    primitive: 'error-state',
    contractType: ERROR_STATE_CONTRACT_TYPE,
    scenarios: [{
      label: 'Error State',
      description: 'Preview through PrimitiveRenderer using ErrorStatePresentation contract props + runtime state',
      props: ERROR_STATE_PROPS as unknown as Record<string, unknown>,
      runtime: ERROR_STATE_RUNTIME,
    }],
  },

  'loading-state': {
    primitive: 'loading-state',
    contractType: LOADING_STATE_CONTRACT_TYPE,
    scenarios: [{
      label: 'Loading State',
      description: 'Preview through PrimitiveRenderer using LoadingStatePresentation contract props + runtime state',
      props: LOADING_STATE_PROPS as unknown as Record<string, unknown>,
      runtime: LOADING_STATE_RUNTIME,
    }],
  },

  'filter-bar': {
    primitive: 'filter-bar',
    contractType: FILTER_BAR_CONTRACT_TYPE,
    scenarios: [{
      label: 'Filter Bar',
      description: 'Preview through PrimitiveRenderer using FilterBarPresentation contract props + runtime state',
      props: FILTER_BAR_PROPS as unknown as Record<string, unknown>,
      runtime: FILTER_BAR_RUNTIME,
    }],
  },

  'bulk-command-bar': {
    primitive: 'bulk-command-bar',
    contractType: BULK_COMMAND_BAR_CONTRACT_TYPE,
    scenarios: [{
      label: 'Bulk Command Bar',
      description: 'Preview through PrimitiveRenderer using BulkCommandBarPresentation contract props + runtime state',
      props: BULK_COMMAND_BAR_PROPS as unknown as Record<string, unknown>,
      runtime: BULK_COMMAND_BAR_RUNTIME,
    }],
  },

  'field-value': {
    primitive: 'field-value',
    contractType: FIELD_VALUE_CONTRACT_TYPE,
    scenarios: [{
      label: 'Field Value',
      description: 'Preview through PrimitiveRenderer using FieldValuePresentation contract props + runtime state',
      props: FIELD_VALUE_PROPS as unknown as Record<string, unknown>,
      runtime: FIELD_VALUE_RUNTIME,
    }],
  },

  input: {
    primitive: 'input',
    contractType: INPUT_CONTRACT_TYPE,
    scenarios: [
      {
        label: 'Text with adornment',
        description: 'Text input with leading "@" adornment and controlled value',
        props: INPUT_PROPS as unknown as Record<string, unknown>,
        runtime: INPUT_RUNTIME,
      },
      {
        label: 'Disabled',
        description: 'Input in disabled state',
        props: { placeholder: 'Cannot edit', disabled: true } as unknown as Record<string, unknown>,
        runtime: {},
      },
      {
        label: 'Invalid',
        description: 'Input with invalid/error styling',
        props: { placeholder: 'Enter email', invalid: true } as unknown as Record<string, unknown>,
        runtime: { value: 'not-an-email' },
      },
      {
        label: 'Loading',
        description: 'Input with inline spinner (async lookup)',
        props: { placeholder: 'Search…', loading: true } as unknown as Record<string, unknown>,
        runtime: { value: 'ikary' },
      },
    ],
  },

  textarea: {
    primitive: 'textarea',
    contractType: TEXTAREA_CONTRACT_TYPE,
    scenarios: [
      {
        label: 'With value',
        description: 'Textarea with preset content',
        props: TEXTAREA_PROPS as unknown as Record<string, unknown>,
        runtime: TEXTAREA_RUNTIME,
      },
      {
        label: 'Disabled',
        description: 'Textarea in disabled state',
        props: { placeholder: 'Cannot edit', disabled: true } as unknown as Record<string, unknown>,
        runtime: {},
      },
      {
        label: 'Readonly',
        description: 'Textarea in readonly mode',
        props: { readonly: true, rows: 3 } as unknown as Record<string, unknown>,
        runtime: { value: 'This content is read-only and cannot be modified.' },
      },
      {
        label: 'Invalid',
        description: 'Textarea with validation error styling',
        props: { placeholder: 'Required field', invalid: true, required: true } as unknown as Record<string, unknown>,
        runtime: {},
      },
    ],
  },

  select: {
    primitive: 'select',
    contractType: SELECT_CONTRACT_TYPE,
    scenarios: [
      {
        label: 'With value',
        description: 'Select with a chosen option',
        props: SELECT_PROPS as unknown as Record<string, unknown>,
        runtime: SELECT_RUNTIME,
      },
      {
        label: 'With placeholder',
        description: 'Select showing placeholder (no selection)',
        props: { ...SELECT_PROPS, placeholder: 'Choose region…' } as unknown as Record<string, unknown>,
        runtime: {},
      },
      {
        label: 'Disabled',
        description: 'Select in disabled state',
        props: { ...SELECT_PROPS, disabled: true } as unknown as Record<string, unknown>,
        runtime: {},
      },
      {
        label: 'Invalid',
        description: 'Select with validation error styling',
        props: { ...SELECT_PROPS, invalid: true, required: true } as unknown as Record<string, unknown>,
        runtime: {},
      },
    ],
  },

  checkbox: {
    primitive: 'checkbox',
    contractType: CHECKBOX_CONTRACT_TYPE,
    scenarios: [
      {
        label: 'Checked',
        description: 'Checkbox in checked state',
        props: CHECKBOX_PROPS as unknown as Record<string, unknown>,
        runtime: CHECKBOX_RUNTIME,
      },
      {
        label: 'Unchecked',
        description: 'Checkbox in unchecked state',
        props: { label: 'Subscribe to updates' } as unknown as Record<string, unknown>,
        runtime: { checked: false },
      },
      {
        label: 'Disabled',
        description: 'Checkbox in disabled state',
        props: { label: 'Managed by admin', disabled: true } as unknown as Record<string, unknown>,
        runtime: { checked: true },
      },
      {
        label: 'Invalid',
        description: 'Checkbox with validation error styling',
        props: { label: 'Accept terms (required)', invalid: true, required: true } as unknown as Record<string, unknown>,
        runtime: { checked: false },
      },
    ],
  },

  'radio-group': {
    primitive: 'radio-group',
    contractType: RADIO_GROUP_CONTRACT_TYPE,
    scenarios: [
      {
        label: 'Vertical',
        description: 'Vertical radio group with descriptions',
        props: RADIO_GROUP_PROPS as unknown as Record<string, unknown>,
        runtime: RADIO_GROUP_RUNTIME,
      },
      {
        label: 'Horizontal',
        description: 'Inline horizontal layout',
        props: { direction: 'horizontal', options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'maybe', label: 'Maybe' },
        ] } as unknown as Record<string, unknown>,
        runtime: { value: 'yes' },
      },
      {
        label: 'With disabled option',
        description: 'One option disabled in the group',
        props: { direction: 'vertical', options: [
          { value: 'starter', label: 'Starter' },
          { value: 'pro', label: 'Pro' },
          { value: 'enterprise', label: 'Enterprise', disabled: true },
        ] } as unknown as Record<string, unknown>,
        runtime: { value: 'pro' },
      },
    ],
  },

  toggle: {
    primitive: 'toggle',
    contractType: TOGGLE_CONTRACT_TYPE,
    scenarios: [
      {
        label: 'On',
        description: 'Toggle in checked/on state',
        props: TOGGLE_PROPS as unknown as Record<string, unknown>,
        runtime: TOGGLE_RUNTIME,
      },
      {
        label: 'Off',
        description: 'Toggle in unchecked/off state',
        props: { label: 'Public mode' } as unknown as Record<string, unknown>,
        runtime: { checked: false },
      },
      {
        label: 'Disabled',
        description: 'Toggle that cannot be interacted with',
        props: { label: 'Managed by SSO', disabled: true } as unknown as Record<string, unknown>,
        runtime: { checked: true },
      },
      {
        label: 'Loading',
        description: 'Toggle with inline spinner (async state save)',
        props: { label: 'Auto-sync', loading: true } as unknown as Record<string, unknown>,
        runtime: { checked: true },
      },
    ],
  },

  'date-input': {
    primitive: 'date-input',
    contractType: DATE_INPUT_CONTRACT_TYPE,
    scenarios: [
      {
        label: 'With value',
        description: 'Popover calendar with a pre-selected date — click to reopen and pick another',
        props: DATE_INPUT_PROPS as unknown as Record<string, unknown>,
        runtime: DATE_INPUT_RUNTIME,
      },
      {
        label: 'Empty',
        description: 'No date selected — click the trigger to open the calendar popover',
        props: {} as unknown as Record<string, unknown>,
        runtime: {},
      },
      {
        label: 'Custom placeholder',
        description: 'Trigger with a custom placeholder text',
        props: { placeholder: 'Select a start date' } as unknown as Record<string, unknown>,
        runtime: {},
      },
      {
        label: 'Disabled',
        description: 'Trigger is disabled; popover cannot be opened',
        props: { disabled: true } as unknown as Record<string, unknown>,
        runtime: { value: '2026-01-01' },
      },
      {
        label: 'Readonly',
        description: 'Trigger renders but popover is blocked from opening',
        props: { readonly: true } as unknown as Record<string, unknown>,
        runtime: { value: '2026-06-15' },
      },
      {
        label: 'Invalid',
        description: 'Trigger styled with destructive border for validation error state',
        props: { invalid: true, required: true } as unknown as Record<string, unknown>,
        runtime: {},
      },
    ],
  },

  'form-field': {
    primitive: 'form-field',
    contractType: FORM_FIELD_CONTRACT_TYPE,
    scenarios: [{
      label: 'Form Field',
      description: 'Preview through PrimitiveRenderer using FormFieldPresentation contract props + runtime state',
      props: FORM_FIELD_PROPS as unknown as Record<string, unknown>,
      runtime: FORM_FIELD_RUNTIME,
    }],
  },

  'form-section': {
    primitive: 'form-section',
    contractType: FORM_SECTION_CONTRACT_TYPE,
    scenarios: [{
      label: 'Form Section',
      description: 'Preview through PrimitiveRenderer using FormSectionPresentation contract props + runtime state',
      props: FORM_SECTION_PROPS as unknown as Record<string, unknown>,
      runtime: FORM_SECTION_RUNTIME,
    }],
  },

  form: {
    primitive: 'form',
    contractType: IKARY_FORM_CONTRACT_TYPE,
    scenarios: [{
      label: 'Ikary Form',
      description: 'Preview through PrimitiveRenderer using IkaryFormPresentation contract props + runtime state',
      props: IKARY_FORM_PROPS as unknown as Record<string, unknown>,
      runtime: IKARY_FORM_RUNTIME,
    }],
  },

  'ikary-form': {
    primitive: 'ikary-form',
    contractType: IKARY_FORM_CONTRACT_TYPE,
    scenarios: [{
      label: 'Ikary Form',
      description: 'Preview through PrimitiveRenderer using IkaryFormPresentation contract props + runtime state',
      props: IKARY_FORM_PROPS as unknown as Record<string, unknown>,
      runtime: IKARY_FORM_RUNTIME,
    }],
  },

  'list-page': {
    primitive: 'list-page',
    contractType: LIST_PAGE_CONTRACT_TYPE,
    scenarios: [{
      label: 'List Page',
      description: 'Preview through PrimitiveRenderer using ListPagePresentation contract props + runtime state',
      props: LIST_PAGE_PROPS as unknown as Record<string, unknown>,
      runtime: LIST_PAGE_RUNTIME,
    }],
  },

  tabs: {
    primitive: 'tabs',
    contractType: TABS_CONTRACT_TYPE,
    scenarios: [
      {
        label: 'Default (line)',
        description: 'Line variant — underline indicator, scroll overflow',
        props: TABS_PROPS_LINE as unknown as Record<string, unknown>,
        runtime: TABS_RUNTIME_LINE,
      },
      {
        label: 'Pill variant',
        description: 'Pill variant — solid background on active tab',
        props: TABS_PROPS_PILL as unknown as Record<string, unknown>,
        runtime: TABS_RUNTIME_PILL,
      },
      {
        label: 'With counts',
        description: 'Count badges, hidden-when-unauthorized, disabled tab',
        props: TABS_PROPS_COUNTS as unknown as Record<string, unknown>,
        runtime: TABS_RUNTIME_COUNTS,
      },
      {
        label: 'Dense',
        description: 'Dense mode for compact layouts',
        props: TABS_PROPS_DENSE as unknown as Record<string, unknown>,
        runtime: TABS_RUNTIME_DENSE,
      },
      {
        label: 'Overflow scroll',
        description: 'Many tabs triggering horizontal scroll',
        props: TABS_PROPS_OVERFLOW as unknown as Record<string, unknown>,
        runtime: TABS_RUNTIME_OVERFLOW,
      },
    ],
  },
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_DEFAULT: BadgePresentation = { label: 'New' };
const BADGE_SECONDARY: BadgePresentation = { label: 'Beta', variant: 'secondary' };
const BADGE_DESTRUCTIVE: BadgePresentation = { label: 'Error', variant: 'destructive' };
const BADGE_OUTLINE: BadgePresentation = { label: 'Draft', variant: 'outline' };

PRIMITIVE_DEMOS['badge'] = {
  primitive: 'badge',
  contractType: BADGE_CONTRACT_TYPE,
  scenarios: [
    { label: 'Default', description: 'Primary badge variant', props: BADGE_DEFAULT as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Secondary', description: 'Secondary / neutral variant', props: BADGE_SECONDARY as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Destructive', description: 'Error / danger variant', props: BADGE_DESTRUCTIVE as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Outline', description: 'Outline / subdued variant', props: BADGE_OUTLINE as unknown as Record<string, unknown>, runtime: {} },
  ],
};

// ─── Separator ────────────────────────────────────────────────────────────────
const SEPARATOR_HORIZONTAL: SeparatorPresentation = { orientation: 'horizontal' };
const SEPARATOR_VERTICAL: SeparatorPresentation = { orientation: 'vertical' };
const SEPARATOR_DECORATIVE: SeparatorPresentation = { orientation: 'horizontal', decorative: true };

PRIMITIVE_DEMOS['separator'] = {
  primitive: 'separator',
  contractType: SEPARATOR_CONTRACT_TYPE,
  scenarios: [
    { label: 'Horizontal', description: 'Full-width horizontal rule', props: SEPARATOR_HORIZONTAL as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Vertical', description: 'Inline vertical divider', props: SEPARATOR_VERTICAL as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Decorative', description: 'Decorative (aria-hidden)', props: SEPARATOR_DECORATIVE as unknown as Record<string, unknown>, runtime: {} },
  ],
};

// ─── Label ────────────────────────────────────────────────────────────────────
const LABEL_BASIC: LabelPresentation = { text: 'Email address' };
const LABEL_WITH_FOR: LabelPresentation = { text: 'Full name', htmlFor: 'full-name' };
const LABEL_REQUIRED: LabelPresentation = { text: 'Password', htmlFor: 'password', required: true };

PRIMITIVE_DEMOS['label'] = {
  primitive: 'label',
  contractType: LABEL_CONTRACT_TYPE,
  scenarios: [
    { label: 'Basic', description: 'Plain label', props: LABEL_BASIC as unknown as Record<string, unknown>, runtime: {} },
    { label: 'With htmlFor', description: 'Associated with a form control id', props: LABEL_WITH_FOR as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Required', description: 'Required marker appended', props: LABEL_REQUIRED as unknown as Record<string, unknown>, runtime: {} },
  ],
};

// ─── Button ───────────────────────────────────────────────────────────────────
const BUTTON_DEFAULT: ButtonPresentation = { label: 'Save changes' };
const BUTTON_DESTRUCTIVE: ButtonPresentation = { label: 'Delete', variant: 'destructive' };
const BUTTON_OUTLINE: ButtonPresentation = { label: 'Cancel', variant: 'outline' };
const BUTTON_SECONDARY: ButtonPresentation = { label: 'Export', variant: 'secondary' };
const BUTTON_GHOST: ButtonPresentation = { label: 'More', variant: 'ghost' };
const BUTTON_LOADING: ButtonPresentation = { label: 'Saving…', loading: true };
const BUTTON_SM: ButtonPresentation = { label: 'Small', size: 'sm' };
const BUTTON_LG: ButtonPresentation = { label: 'Large action', size: 'lg' };

PRIMITIVE_DEMOS['button'] = {
  primitive: 'button',
  contractType: BUTTON_CONTRACT_TYPE,
  scenarios: [
    { label: 'Default', description: 'Primary action button', props: BUTTON_DEFAULT as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Destructive', description: 'Danger / irreversible action', props: BUTTON_DESTRUCTIVE as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Outline', description: 'Secondary border button', props: BUTTON_OUTLINE as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Secondary', description: 'Lower-priority action', props: BUTTON_SECONDARY as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Ghost', description: 'Minimal visual weight', props: BUTTON_GHOST as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Loading', description: 'Shows spinner and disables button', props: BUTTON_LOADING as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Small', description: 'sm size variant', props: BUTTON_SM as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Large', description: 'lg size variant', props: BUTTON_LG as unknown as Record<string, unknown>, runtime: {} },
  ],
};

// ─── Alert ────────────────────────────────────────────────────────────────────
const ALERT_DEFAULT: AlertPresentation = { title: 'Heads up!', description: 'You can change your settings in the preferences page.' };
const ALERT_DESTRUCTIVE: AlertPresentation = { variant: 'destructive', title: 'Error', description: 'Your session has expired. Please log in again.' };
const ALERT_TITLE_ONLY: AlertPresentation = { title: 'Deployment complete' };
const ALERT_DESC_ONLY: AlertPresentation = { description: 'Background sync is running. Changes may take a moment to appear.' };

PRIMITIVE_DEMOS['alert'] = {
  primitive: 'alert',
  contractType: ALERT_CONTRACT_TYPE,
  scenarios: [
    { label: 'Default', description: 'Neutral informational alert', props: ALERT_DEFAULT as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Destructive', description: 'Error / critical warning', props: ALERT_DESTRUCTIVE as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Title only', description: 'Alert without description', props: ALERT_TITLE_ONLY as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Description only', description: 'Alert without title', props: ALERT_DESC_ONLY as unknown as Record<string, unknown>, runtime: {} },
  ],
};

// ─── Progress ─────────────────────────────────────────────────────────────────
const PROGRESS_ZERO: ProgressPresentation = { value: 0, label: 'Starting' };
const PROGRESS_HALF: ProgressPresentation = { value: 35, label: 'Upload progress', showValue: true };
const PROGRESS_MOSTLY: ProgressPresentation = { value: 75, showValue: true };
const PROGRESS_COMPLETE: ProgressPresentation = { value: 100, label: 'Complete', showValue: true };
const PROGRESS_INDETERMINATE: ProgressPresentation = { label: 'Loading…' };

PRIMITIVE_DEMOS['progress'] = {
  primitive: 'progress',
  contractType: PROGRESS_CONTRACT_TYPE,
  scenarios: [
    { label: '0%', description: 'Not yet started', props: PROGRESS_ZERO as unknown as Record<string, unknown>, runtime: {} },
    { label: '35%', description: 'With value display', props: PROGRESS_HALF as unknown as Record<string, unknown>, runtime: {} },
    { label: '75%', description: 'Mostly complete', props: PROGRESS_MOSTLY as unknown as Record<string, unknown>, runtime: {} },
    { label: '100%', description: 'Fully complete', props: PROGRESS_COMPLETE as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Indeterminate', description: 'No value — pulsing animation', props: PROGRESS_INDETERMINATE as unknown as Record<string, unknown>, runtime: {} },
  ],
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SKELETON_SINGLE: SkeletonPresentation = {};
const SKELETON_PARAGRAPH: SkeletonPresentation = { count: 3 };
const SKELETON_NARROW: SkeletonPresentation = { heightClass: 'h-4', widthClass: 'w-3/4' };
const SKELETON_CARD: SkeletonPresentation = { heightClass: 'h-32', widthClass: 'w-full' };

PRIMITIVE_DEMOS['skeleton'] = {
  primitive: 'skeleton',
  contractType: SKELETON_CONTRACT_TYPE,
  scenarios: [
    { label: 'Single line', description: 'One skeleton row', props: SKELETON_SINGLE as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Paragraph', description: 'Three rows simulating text', props: SKELETON_PARAGRAPH as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Narrow line', description: 'Short 75%-width row', props: SKELETON_NARROW as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Card placeholder', description: 'Tall block for image or card', props: SKELETON_CARD as unknown as Record<string, unknown>, runtime: {} },
  ],
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_INITIALS: AvatarPresentation = { fallback: 'JD' };
const AVATAR_SMALL: AvatarPresentation = { fallback: 'AB', size: 'sm' };
const AVATAR_LARGE: AvatarPresentation = { fallback: 'XL', size: 'lg' };
const AVATAR_IMAGE: AvatarPresentation = { src: 'https://github.com/shadcn.png', alt: 'shadcn', fallback: 'CN' };
const AVATAR_BROKEN: AvatarPresentation = { src: 'https://broken.example.com/404.png', fallback: 'FB', alt: 'Fallback test' };

PRIMITIVE_DEMOS['avatar'] = {
  primitive: 'avatar',
  contractType: AVATAR_CONTRACT_TYPE,
  scenarios: [
    { label: 'Initials (md)', description: 'Default size with initials fallback', props: AVATAR_INITIALS as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Small', description: 'sm size — 32px', props: AVATAR_SMALL as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Large', description: 'lg size — 56px', props: AVATAR_LARGE as unknown as Record<string, unknown>, runtime: {} },
    { label: 'With image', description: 'Image loaded from URL', props: AVATAR_IMAGE as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Broken image', description: 'Src 404 — falls back to initials', props: AVATAR_BROKEN as unknown as Record<string, unknown>, runtime: {} },
  ],
};

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const BREADCRUMB_TWO: BreadcrumbPresentation = {
  items: [
    { label: 'Home', href: '/' },
    { label: 'Settings' },
  ],
};
const BREADCRUMB_THREE: BreadcrumbPresentation = {
  items: [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Dashboard' },
  ],
};
const BREADCRUMB_FOUR_CHEVRON: BreadcrumbPresentation = {
  items: [
    { label: 'Home', href: '/' },
    { label: 'Users', href: '/users' },
    { label: 'Alice Smith', href: '/users/alice' },
    { label: 'Edit' },
  ],
  separator: 'chevron',
};

PRIMITIVE_DEMOS['breadcrumb'] = {
  primitive: 'breadcrumb',
  contractType: BREADCRUMB_CONTRACT_TYPE,
  scenarios: [
    { label: '2 levels', description: 'Home → current page', props: BREADCRUMB_TWO as unknown as Record<string, unknown>, runtime: {} },
    { label: '3 levels', description: 'Home → section → page', props: BREADCRUMB_THREE as unknown as Record<string, unknown>, runtime: {} },
    { label: '4 levels (chevron)', description: 'Deep path with chevron separator', props: BREADCRUMB_FOUR_CHEVRON as unknown as Record<string, unknown>, runtime: {} },
  ],
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const CARD_MINIMAL: CardPresentation = { title: 'Project Alpha', description: 'Active · 3 contributors' };
const CARD_FULL: CardPresentation = {
  title: 'Invoice #4821',
  description: 'Due 2026-04-30',
  content: 'Total amount: $1,250.00. Payment method: credit card ending in 4242.',
  footer: 'Pay now or schedule for later.',
};
const CARD_CONTENT_ONLY: CardPresentation = {
  content: 'No configuration needed. Defaults are applied automatically on first run.',
};

PRIMITIVE_DEMOS['card'] = {
  primitive: 'card',
  contractType: CARD_CONTRACT_TYPE,
  scenarios: [
    { label: 'Header only', description: 'Title + description, no content', props: CARD_MINIMAL as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Full card', description: 'Header + content + footer', props: CARD_FULL as unknown as Record<string, unknown>, runtime: {} },
    { label: 'Content only', description: 'Body text without header', props: CARD_CONTENT_ONLY as unknown as Record<string, unknown>, runtime: {} },
  ],
};

export const DEFAULT_DEMO = PRIMITIVE_DEMOS['data-grid'];
