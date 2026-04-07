import type { EntityDefinition } from '@ikary/contract';

export const SAMPLE_ENTITY: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',

  // ── Fields ───────────────────────────────────────────────────────────────────
  fields: [
    {
      key: 'name',
      type: 'string',
      name: 'Full Name',
      helpText: 'The customer display name used across the platform',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Jane Doe' },
      create: { visible: true, order: 1, placeholder: 'Jane Doe' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          {
            ruleId: 'customer.name.required',
            type: 'required',
            field: 'name',
            messageKey: 'customer.name.required',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
        ],
      },
    },
    {
      key: 'email',
      type: 'string',
      name: 'Email Address',
      helpText: 'Primary contact email for this customer',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'name@example.com' },
      create: { visible: true, order: 2, placeholder: 'name@example.com' },
      edit: { visible: true, order: 2 },
      display: { type: 'email' },
      validation: {
        fieldRules: [
          {
            ruleId: 'customer.email.required',
            type: 'required',
            field: 'email',
            messageKey: 'customer.email.required',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
          {
            ruleId: 'customer.email.format',
            type: 'email',
            field: 'email',
            messageKey: 'customer.email.format',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
        ],
      },
    },
    {
      key: 'phone',
      type: 'string',
      name: 'Phone Number',
      smallTip: 'Include country code for international numbers',
      list: { visible: true, sortable: false, searchable: true },
      form: { visible: true, placeholder: '+1 555-0100' },
      create: { visible: true, order: 3, placeholder: '+1 555-0100' },
      edit: { visible: true, order: 3 },
      display: { type: 'phone' },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'active', 'inactive', 'archived'],
      helpText: 'Current lifecycle state of the customer record',
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: {
        type: 'status',
        statusMap: {
          draft: 'neutral',
          active: 'success',
          inactive: 'warning',
          archived: 'danger',
        },
      },
    },
    {
      key: 'tier',
      type: 'enum',
      name: 'Subscription Tier',
      enumValues: ['free', 'pro', 'enterprise'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 4 },
      edit: { visible: true, order: 4 },
      display: {
        type: 'badge',
        badgeToneMap: {
          free: 'neutral',
          pro: 'info',
          enterprise: 'success',
        },
      },
    },
    {
      key: 'revenue',
      type: 'number',
      name: 'Annual Revenue',
      helpText: 'Estimated annual revenue in USD',
      sensitive: 'pii',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '0.00' },
      create: { visible: false },
      edit: { visible: true, order: 5 },
      display: { type: 'currency', currency: 'USD', precision: 2, align: 'right' },
    },
    {
      key: 'notes',
      type: 'text',
      name: 'Internal Notes',
      helpText: 'Free-form notes visible only to internal staff',
      list: { visible: false },
      form: { visible: true, placeholder: 'Internal notes about this customer...' },
      create: { visible: false },
      edit: { visible: true, order: 6 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'joined_at',
      type: 'date',
      name: 'Joined At',
      helpText: 'Date the customer first signed up',
      readonly: true,
      list: { visible: true, sortable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'date' },
    },
  ],

  // ── Relations ────────────────────────────────────────────────────────────────
  relations: [
    {
      key: 'company',
      relation: 'belongs_to',
      entity: 'company',
      foreignKey: 'company_id',
      required: true,
    },
    {
      key: 'invoices',
      relation: 'has_many',
      entity: 'invoice',
      foreignKey: 'customer_id',
    },
  ],

  // ── Computed fields ──────────────────────────────────────────────────────────
  computed: [
    {
      key: 'is_high_value',
      name: 'High-Value Customer',
      type: 'boolean',
      formulaType: 'conditional',
      condition: 'revenue > 100000',
      then: 'true',
      else: 'false',
      dependencies: ['revenue'],
    },
  ],

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'active', 'inactive', 'archived'],
    transitions: [
      {
        key: 'activate',
        from: 'draft',
        to: 'active',
        label: 'Activate',
        guards: ['hasRequiredFields'],
      },
      {
        key: 'deactivate',
        from: 'active',
        to: 'inactive',
        label: 'Deactivate',
        hooks: ['notifyAccountManager'],
      },
      {
        key: 'archive',
        from: 'inactive',
        to: 'archived',
        label: 'Archive',
        guards: ['noOpenInvoices'],
      },
      {
        key: 'reactivate',
        from: 'inactive',
        to: 'active',
        label: 'Reactivate',
      },
    ],
  },

  // ── Events ───────────────────────────────────────────────────────────────────
  events: {
    exclude: ['notes'],
    names: {
      created: 'customer.onboarded',
      updated: 'customer.profile_changed',
      deleted: 'customer.removed',
    },
  },

  // ── Capabilities ─────────────────────────────────────────────────────────────
  capabilities: [
    {
      key: 'approve',
      type: 'transition',
      description: 'Approve and activate a draft customer record',
      icon: 'check-circle',
      scope: 'entity',
      transition: 'activate',
      confirm: true,
    },
    {
      key: 'export_pdf',
      type: 'export',
      description: 'Export customer record as a PDF document',
      icon: 'file-pdf',
      scope: 'entity',
      format: 'pdf',
    },
    {
      key: 'bulk_import',
      type: 'integration',
      description: 'Import customers from an external CSV source',
      icon: 'upload',
      scope: 'global',
      provider: 'csv-importer',
      inputs: [
        { key: 'file_url', type: 'string', label: 'CSV File URL', required: true },
        { key: 'dry_run', type: 'boolean', label: 'Dry Run' },
      ],
    },
  ],

  // ── Policies ─────────────────────────────────────────────────────────────────
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'role', condition: 'finance:create' },
    update: { scope: 'owner' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },

  // ── Field policies ───────────────────────────────────────────────────────────
  fieldPolicies: {
    revenue: {
      view: { scope: 'role', condition: 'finance:view' },
      update: { scope: 'role', condition: 'finance:update' },
    },
  },

  // ── Validation ───────────────────────────────────────────────────────────────
  validation: {
    entityRules: [
      {
        ruleId: 'customer.email_required_when_active',
        type: 'entity_invariant',
        paths: ['email', 'status'],
        messageKey: 'customer.email_required_when_active',
        clientSafe: true,
        blocking: true,
        severity: 'error',
      },
    ],
  },
};

export const SAMPLE_ENTITY_JSON = JSON.stringify(SAMPLE_ENTITY, null, 2);
