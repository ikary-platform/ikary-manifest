import type { EntityDefinition } from '@ikary/contract';

export interface ApiEntityScenario {
  label: string;
  description?: string;
  category: 'docs' | 'crm' | 'erp' | 'projects' | 'hr' | 'finance';
  entity: EntityDefinition;
}

// ─────────────────────────────────────────────────────────────────────────────
// Documentation
// ─────────────────────────────────────────────────────────────────────────────

const DOC_MINIMAL_ENTITY: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true, searchable: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
    { key: 'phone', type: 'string', name: 'Phone' },
    { key: 'website', type: 'string', name: 'Website' },
    { key: 'industry', type: 'string', name: 'Industry', list: { visible: true } },
    { key: 'street', type: 'string', name: 'Street' },
    { key: 'city', type: 'string', name: 'City' },
    { key: 'postal_code', type: 'string', name: 'Postal Code' },
    { key: 'country', type: 'string', name: 'Country' },
    { key: 'vat_number', type: 'string', name: 'VAT Number' },
    { key: 'payment_terms_days', type: 'number', name: 'Payment Terms (Days)' },
    { key: 'account_owner_id', type: 'string', name: 'Account Owner ID' },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['active', 'inactive', 'suspended'],
      list: { visible: true, filterable: true },
    },
  ],
};

const DOC_NESTED_ENTITY: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true, searchable: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
    { key: 'phone', type: 'string', name: 'Phone' },
    {
      key: 'contact',
      type: 'object',
      name: 'Contact',
      fields: [{ key: 'website', type: 'string', name: 'Website' }],
    },
    {
      key: 'address',
      type: 'object',
      name: 'Address',
      fields: [
        { key: 'street', type: 'string', name: 'Street' },
        { key: 'city', type: 'string', name: 'City' },
        { key: 'postal_code', type: 'string', name: 'Postal Code' },
        { key: 'country', type: 'string', name: 'Country' },
      ],
    },
    {
      key: 'billing',
      type: 'object',
      name: 'Billing',
      fields: [
        { key: 'vat_number', type: 'string', name: 'VAT Number' },
        { key: 'payment_terms_days', type: 'number', name: 'Payment Terms (Days)' },
      ],
    },
    {
      key: 'commercial',
      type: 'object',
      name: 'Commercial',
      fields: [
        { key: 'industry', type: 'string', name: 'Industry' },
        { key: 'account_owner_id', type: 'string', name: 'Account Owner ID' },
      ],
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['active', 'inactive', 'suspended'],
      list: { visible: true, filterable: true },
    },
  ],
};

const DOC_BELONGS_TO_ENTITY: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'sent', 'paid', 'cancelled'],
      list: { visible: true },
    },
    { key: 'due_date', type: 'date', name: 'Due Date' },
  ],
  relations: [{ key: 'customer_id', relation: 'belongs_to', entity: 'customer', required: true }],
};

const DOC_HAS_MANY_ENTITY: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
  ],
  relations: [
    { key: 'invoices', relation: 'has_many', entity: 'invoice', foreignKey: 'customer_id' },
    { key: 'tickets', relation: 'has_many', entity: 'ticket', foreignKey: 'customer_id' },
  ],
};

const DOC_MANY_TO_MANY_ENTITY: EntityDefinition = {
  key: 'user',
  name: 'User',
  pluralName: 'Users',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
  ],
  relations: [
    {
      key: 'workspaces',
      relation: 'many_to_many',
      entity: 'workspace',
      through: 'membership',
      sourceKey: 'user_id',
      targetKey: 'workspace_id',
    },
  ],
};

const DOC_POLYMORPHIC_ENTITY: EntityDefinition = {
  key: 'comment',
  name: 'Comment',
  pluralName: 'Comments',
  fields: [{ key: 'message', type: 'text', name: 'Message', list: { visible: true } }],
  relations: [{ key: 'target', relation: 'polymorphic', typeField: 'target_type', idField: 'target_id' }],
};

const DOC_COMPUTED_EXPRESSION_ENTITY: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'subtotal', type: 'number', name: 'Subtotal', list: { visible: true } },
    { key: 'tax_rate', type: 'number', name: 'Tax Rate' },
    { key: 'due_date', type: 'date', name: 'Due Date', list: { visible: true } },
  ],
  computed: [
    {
      key: 'tax_amount',
      name: 'Tax Amount',
      type: 'number',
      formulaType: 'expression',
      expression: 'subtotal * tax_rate',
    },
    {
      key: 'total_amount',
      name: 'Total Amount',
      type: 'number',
      formulaType: 'expression',
      expression: 'subtotal + tax_amount',
      dependencies: ['subtotal', 'tax_amount'],
    },
  ],
};

const DOC_COMPUTED_AGGREGATION_ENTITY: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
  ],
  computed: [
    {
      key: 'lifetime_value',
      name: 'Lifetime Value',
      type: 'number',
      formulaType: 'aggregation',
      relation: 'invoices',
      operation: 'sum',
      field: 'total_amount',
    },
    {
      key: 'invoice_count',
      name: 'Invoice Count',
      type: 'number',
      formulaType: 'aggregation',
      relation: 'invoices',
      operation: 'count',
    },
    {
      key: 'unpaid_total',
      name: 'Unpaid Total',
      type: 'number',
      formulaType: 'aggregation',
      relation: 'invoices',
      operation: 'sum',
      field: 'total_amount',
      filter: 'status != "paid"',
    },
  ],
};

const DOC_COMPUTED_CONDITION_ENTITY: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'due_date', type: 'date', name: 'Due Date', list: { visible: true } },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'sent', 'paid', 'cancelled'],
      list: { visible: true },
    },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  computed: [
    {
      key: 'overdue',
      name: 'Overdue',
      type: 'boolean',
      formulaType: 'conditional',
      condition: 'due_date < now()',
      then: 'true',
      else: 'false',
    },
    {
      key: 'is_paid',
      name: 'Is Paid',
      type: 'boolean',
      formulaType: 'conditional',
      condition: 'status == "paid"',
      then: 'true',
      else: 'false',
    },
    {
      key: 'is_high_value',
      name: 'Is High Value',
      type: 'boolean',
      formulaType: 'conditional',
      condition: 'total_amount > 10000',
      then: 'true',
      else: 'false',
    },
  ],
};

const DOC_LIFECYCLE_ENTITY: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'rejected', 'paid'],
    transitions: [
      {
        key: 'submit',
        from: 'draft',
        to: 'pending',
        label: 'Submit for Approval',
        guards: ['total_amount > 0'],
        hooks: ['notify_approvers'],
        event: 'invoice.submitted',
      },
      {
        key: 'approve',
        from: 'pending',
        to: 'approved',
        label: 'Approve',
        guards: ['total_amount > 0', 'customer_verified == true'],
        hooks: ['send_invoice_approved_email', 'create_audit_log'],
        event: 'invoice.approved',
      },
      {
        key: 'reject',
        from: 'pending',
        to: 'rejected',
        label: 'Reject',
        hooks: ['notify_sales_team'],
        event: 'invoice.rejected',
      },
      {
        key: 'mark_paid',
        from: 'approved',
        to: 'paid',
        label: 'Mark as Paid',
        guards: ['payment_received == true'],
        hooks: ['update_customer_balance', 'close_invoice'],
        event: 'invoice.paid',
      },
    ],
  },
};

const DOC_VALIDATION_ENTITY: EntityDefinition = {
  key: 'user',
  name: 'User',
  pluralName: 'Users',
  fields: [
    {
      key: 'full_name',
      type: 'string',
      name: 'Full Name',
      list: { visible: true },
      validation: {
        fieldRules: [
          { ruleId: 'user.full_name.required', type: 'required', field: 'full_name', messageKey: 'user.full_name.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'user.full_name.min_length', type: 'min_length', field: 'full_name', params: { min: 2 }, messageKey: 'user.full_name.min_length', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'user.full_name.max_length', type: 'max_length', field: 'full_name', params: { max: 100 }, messageKey: 'user.full_name.max_length', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'email',
      type: 'string',
      name: 'Email',
      list: { visible: true },
      validation: {
        fieldRules: [
          { ruleId: 'user.email.required', type: 'required', field: 'email', messageKey: 'user.email.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'user.email.email', type: 'email', field: 'email', messageKey: 'user.email.email', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'username',
      type: 'string',
      name: 'Username',
      list: { visible: true },
      validation: {
        fieldRules: [
          { ruleId: 'user.username.required', type: 'required', field: 'username', messageKey: 'user.username.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'user.username.regex', type: 'regex', field: 'username', params: { pattern: '^[a-z0-9_]{3,20}$' }, messageKey: 'user.username.regex', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'age',
      type: 'number',
      name: 'Age',
      validation: {
        fieldRules: [
          { ruleId: 'user.age.min', type: 'number_min', field: 'age', params: { min: 18 }, messageKey: 'user.age.min', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'user.age.max', type: 'number_max', field: 'age', params: { max: 120 }, messageKey: 'user.age.max', clientSafe: true, blocking: false, severity: 'warning' },
        ],
      },
    },
  ],
};

const DOC_EVENTS_ENTITY: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
    { key: 'bank_account', type: 'string', name: 'Bank Account' },
  ],
  events: {
    exclude: ['bank_account'],
    names: {
      created: 'billing.invoice.raised',
      updated: 'billing.invoice.changed',
      deleted: 'billing.invoice.voided',
    },
  },
};

const DOC_CAPABILITIES_ENTITY: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'pending', 'approved', 'paid'],
      list: { visible: true },
    },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'paid'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending' },
      { key: 'approve', from: 'pending', to: 'approved' },
      { key: 'pay', from: 'approved', to: 'paid' },
    ],
  },
  capabilities: [
    { key: 'submit', type: 'transition', transition: 'submit', description: 'Submit for approval' },
    { key: 'approve', type: 'transition', transition: 'approve', description: 'Approve invoice', confirm: true },
    { key: 'export_pdf', type: 'export', format: 'pdf', description: 'Download as PDF' },
    { key: 'reset', type: 'mutation', updates: { status: 'draft' }, description: 'Reset to draft', confirm: true },
  ],
};

const DOC_POLICIES_ENTITY: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'pending', 'approved'],
      list: { visible: true },
    },
    { key: 'owner_id', type: 'string', name: 'Owner ID', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending' },
      { key: 'approve', from: 'pending', to: 'approved' },
    ],
  },
  capabilities: [
    {
      key: 'approve',
      type: 'transition',
      transition: 'approve',
      scope: 'entity',
      confirm: true,
      description: 'Approve invoice',
    },
  ],
  policies: {
    view: { scope: 'role' },
    create: { scope: 'role' },
    update: { scope: 'role' },
    delete: { scope: 'role' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CRM
// ─────────────────────────────────────────────────────────────────────────────

const CONTACT_ENTITY: EntityDefinition = {
  key: 'contact',
  name: 'Contact',
  pluralName: 'Contacts',
  fields: [
    {
      key: 'first_name',
      type: 'string',
      name: 'First Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Jane' },
      create: { visible: true, order: 1, placeholder: 'Jane' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'contact.first_name.required', type: 'required', field: 'first_name', messageKey: 'contact.first_name.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'last_name',
      type: 'string',
      name: 'Last Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Doe' },
      create: { visible: true, order: 2, placeholder: 'Doe' },
      edit: { visible: true, order: 2 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'contact.last_name.required', type: 'required', field: 'last_name', messageKey: 'contact.last_name.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'email',
      type: 'string',
      name: 'Email',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'jane@example.com' },
      create: { visible: true, order: 3, placeholder: 'jane@example.com' },
      edit: { visible: true, order: 3 },
      display: { type: 'email' },
      validation: {
        fieldRules: [
          { ruleId: 'contact.email.required', type: 'required', field: 'email', messageKey: 'contact.email.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'contact.email.format', type: 'email', field: 'email', messageKey: 'contact.email.format', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'phone',
      type: 'string',
      name: 'Phone',
      list: { visible: true, sortable: false, searchable: true },
      form: { visible: true, placeholder: '+1 555-0100' },
      create: { visible: true, order: 4, placeholder: '+1 555-0100' },
      edit: { visible: true, order: 4 },
      display: { type: 'phone' },
    },
    {
      key: 'job_title',
      type: 'string',
      name: 'Job Title',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: 'VP of Engineering' },
      create: { visible: true, order: 5, placeholder: 'VP of Engineering' },
      edit: { visible: true, order: 5 },
      display: { type: 'text' },
    },
    {
      key: 'source',
      type: 'enum',
      name: 'Lead Source',
      enumValues: ['web', 'referral', 'event', 'linkedin', 'outbound', 'inbound'],
      list: { visible: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 6 },
      edit: { visible: true, order: 6 },
      display: { type: 'badge', badgeToneMap: { web: 'info', referral: 'success', event: 'neutral', linkedin: 'info', outbound: 'warning', inbound: 'success' } },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['lead', 'prospect', 'qualified', 'customer', 'churned'],
      helpText: 'Managed by lifecycle transitions',
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { lead: 'neutral', prospect: 'info', qualified: 'warning', customer: 'success', churned: 'danger' } },
    },
    {
      key: 'notes',
      type: 'text',
      name: 'Notes',
      list: { visible: false },
      form: { visible: true, placeholder: 'Internal notes...' },
      create: { visible: false },
      edit: { visible: true, order: 7 },
      display: { type: 'multiline-text', truncate: true },
    },
  ],
  relations: [
    { key: 'company', relation: 'belongs_to', entity: 'company', foreignKey: 'company_id' },
    { key: 'deals', relation: 'has_many', entity: 'deal', foreignKey: 'contact_id' },
  ],
  computed: [
    { key: 'full_name', name: 'Full Name', type: 'string', formulaType: 'expression', expression: "first_name + ' ' + last_name", dependencies: ['first_name', 'last_name'] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'lead',
    states: ['lead', 'prospect', 'qualified', 'customer', 'churned'],
    transitions: [
      { key: 'qualify', from: 'lead', to: 'prospect', label: 'Mark as Prospect' },
      { key: 'advance', from: 'prospect', to: 'qualified', label: 'Qualify', guards: ['hasEmailVerified'] },
      { key: 'convert', from: 'qualified', to: 'customer', label: 'Convert to Customer', hooks: ['createAccount'] },
      { key: 'churn', from: 'customer', to: 'churned', label: 'Mark Churned', hooks: ['notifyAccountManager'] },
      { key: 'reactivate', from: 'churned', to: 'prospect', label: 'Reactivate' },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'workspace' },
    update: { scope: 'owner' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

const COMPANY_ENTITY: EntityDefinition = {
  key: 'company',
  name: 'Company',
  pluralName: 'Companies',
  fields: [
    {
      key: 'name',
      type: 'string',
      name: 'Company Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Acme Corp' },
      create: { visible: true, order: 1, placeholder: 'Acme Corp' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'company.name.required', type: 'required', field: 'name', messageKey: 'company.name.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'company.name.min_length', type: 'min_length', field: 'name', messageKey: 'company.name.min_length', params: { min: 2 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'domain',
      type: 'string',
      name: 'Website Domain',
      helpText: 'e.g. acme.com',
      list: { visible: true, searchable: true },
      form: { visible: true, placeholder: 'acme.com' },
      create: { visible: true, order: 2, placeholder: 'acme.com' },
      edit: { visible: true, order: 2 },
      display: { type: 'text' },
    },
    {
      key: 'industry',
      type: 'enum',
      name: 'Industry',
      enumValues: ['technology', 'finance', 'healthcare', 'retail', 'manufacturing', 'real_estate', 'education', 'other'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 3 },
      edit: { visible: true, order: 3 },
      display: { type: 'badge', badgeToneMap: { technology: 'info', finance: 'success', healthcare: 'neutral', retail: 'warning', manufacturing: 'neutral', real_estate: 'neutral', education: 'info', other: 'neutral' } },
    },
    {
      key: 'tier',
      type: 'enum',
      name: 'Account Tier',
      enumValues: ['enterprise', 'mid-market', 'smb', 'startup'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 4 },
      edit: { visible: true, order: 4 },
      display: { type: 'badge', badgeToneMap: { enterprise: 'success', 'mid-market': 'info', smb: 'neutral', startup: 'warning' } },
    },
    {
      key: 'employee_count',
      type: 'number',
      name: 'Employee Count',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '100' },
      create: { visible: true, order: 5, placeholder: '100' },
      edit: { visible: true, order: 5 },
      display: { type: 'number' },
      validation: {
        fieldRules: [
          { ruleId: 'company.employee_count.min', type: 'number_min', field: 'employee_count', messageKey: 'company.employee_count.min', params: { min: 1 }, defaultMessage: 'Must be at least 1', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'annual_revenue',
      type: 'number',
      name: 'Annual Revenue (USD)',
      sensitive: 'pii',
      list: { visible: false },
      form: { visible: true, placeholder: '0' },
      create: { visible: false },
      edit: { visible: true, order: 6 },
      display: { type: 'currency', currency: 'USD', precision: 0, align: 'right' },
      validation: {
        fieldRules: [
          { ruleId: 'company.annual_revenue.min', type: 'number_min', field: 'annual_revenue', messageKey: 'company.annual_revenue.min', params: { min: 0 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'country',
      type: 'string',
      name: 'Country',
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true, placeholder: 'United States' },
      create: { visible: true, order: 6, placeholder: 'United States' },
      edit: { visible: true, order: 7 },
      display: { type: 'text' },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['prospect', 'active', 'churned', 'partner'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { prospect: 'neutral', active: 'success', churned: 'danger', partner: 'info' } },
    },
  ],
  relations: [
    { key: 'contacts', relation: 'has_many', entity: 'contact', foreignKey: 'company_id' },
    { key: 'deals', relation: 'has_many', entity: 'deal', foreignKey: 'company_id' },
    { key: 'invoices', relation: 'has_many', entity: 'invoice', foreignKey: 'company_id' },
  ],
  computed: [
    { key: 'open_deal_count', name: 'Open Deals', type: 'number', formulaType: 'aggregation', relation: 'deals', operation: 'count', filter: "status != 'closed_won' AND status != 'closed_lost'", dependencies: [] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'prospect',
    states: ['prospect', 'active', 'churned', 'partner'],
    transitions: [
      { key: 'activate', from: 'prospect', to: 'active', label: 'Activate' },
      { key: 'churn', from: 'active', to: 'churned', label: 'Mark Churned', hooks: ['notifyCSM'] },
      { key: 'partner', from: 'active', to: 'partner', label: 'Upgrade to Partner' },
      { key: 'reactivate', from: 'churned', to: 'prospect', label: 'Reactivate' },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'role', condition: 'sales:create' },
    update: { scope: 'workspace' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
  fieldPolicies: {
    annual_revenue: {
      view: { scope: 'role', condition: 'finance:view' },
      update: { scope: 'role', condition: 'finance:update' },
    },
  },
};

const DEAL_ENTITY: EntityDefinition = {
  key: 'deal',
  name: 'Deal',
  pluralName: 'Deals',
  fields: [
    {
      key: 'name',
      type: 'string',
      name: 'Deal Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Acme Corp — Enterprise Plan' },
      create: { visible: true, order: 1, placeholder: 'Acme Corp — Enterprise Plan' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'deal.name.required', type: 'required', field: 'name', messageKey: 'deal.name.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'stage',
      type: 'enum',
      name: 'Stage',
      enumValues: ['discovery', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
      helpText: 'Managed by lifecycle transitions',
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { discovery: 'neutral', qualified: 'info', proposal: 'info', negotiation: 'warning', closed_won: 'success', closed_lost: 'danger' } },
    },
    {
      key: 'value',
      type: 'number',
      name: 'Deal Value (USD)',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '0' },
      create: { visible: true, order: 2, placeholder: '0' },
      edit: { visible: true, order: 2 },
      display: { type: 'currency', currency: 'USD', precision: 0, align: 'right' },
      validation: {
        fieldRules: [
          { ruleId: 'deal.value.required', type: 'required', field: 'value', messageKey: 'deal.value.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'deal.value.min', type: 'number_min', field: 'value', messageKey: 'deal.value.min', params: { min: 0 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'probability',
      type: 'number',
      name: 'Win Probability (%)',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '50' },
      create: { visible: false },
      edit: { visible: true, order: 3 },
      display: { type: 'number' },
      validation: {
        fieldRules: [
          { ruleId: 'deal.probability.min', type: 'number_min', field: 'probability', messageKey: 'deal.probability.min', params: { min: 0 }, clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'deal.probability.max', type: 'number_max', field: 'probability', messageKey: 'deal.probability.max', params: { max: 100 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'expected_close_date',
      type: 'date',
      name: 'Expected Close Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 3 },
      edit: { visible: true, order: 4 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'deal.expected_close_date.required', type: 'required', field: 'expected_close_date', messageKey: 'deal.expected_close_date.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'deal.expected_close_date.future', type: 'future_date', field: 'expected_close_date', messageKey: 'deal.expected_close_date.future', defaultMessage: 'Close date must be today or later', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'lost_reason',
      type: 'enum',
      name: 'Lost Reason',
      enumValues: ['price', 'competition', 'timing', 'no_budget', 'no_decision'],
      helpText: 'Required when the deal is marked as lost',
      list: { visible: false },
      form: { visible: true },
      create: { visible: false },
      edit: { visible: true, order: 5 },
      display: { type: 'badge', badgeToneMap: { price: 'danger', competition: 'warning', timing: 'neutral', no_budget: 'danger', no_decision: 'neutral' } },
    },
    {
      key: 'description',
      type: 'text',
      name: 'Description',
      list: { visible: false },
      form: { visible: true, placeholder: 'Deal context and background...' },
      create: { visible: true, order: 4 },
      edit: { visible: true, order: 6 },
      display: { type: 'multiline-text', truncate: true },
    },
  ],
  relations: [
    { key: 'company', relation: 'belongs_to', entity: 'company', foreignKey: 'company_id', required: true },
    { key: 'contact', relation: 'belongs_to', entity: 'contact', foreignKey: 'contact_id' },
  ],
  lifecycle: {
    field: 'stage',
    initial: 'discovery',
    states: ['discovery', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    transitions: [
      { key: 'qualify', from: 'discovery', to: 'qualified', label: 'Qualify', guards: ['hasCompany'] },
      { key: 'propose', from: 'qualified', to: 'proposal', label: 'Send Proposal' },
      { key: 'negotiate', from: 'proposal', to: 'negotiation', label: 'Enter Negotiation' },
      { key: 'win', from: 'negotiation', to: 'closed_won', label: 'Mark Won', hooks: ['createInvoice', 'notifyFinance'] },
      { key: 'lose', from: 'negotiation', to: 'closed_lost', label: 'Mark Lost', guards: ['hasLostReason'] },
      { key: 'reopen', from: 'closed_lost', to: 'discovery', label: 'Reopen' },
    ],
  },
  validation: {
    entityRules: [
      { ruleId: 'deal.lost_reason_required', type: 'entity_invariant', paths: ['stage', 'lost_reason'], messageKey: 'deal.lost_reason_required', clientSafe: true, blocking: true, severity: 'error' },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'workspace' },
    update: { scope: 'owner' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

const LEAD_ENTITY: EntityDefinition = {
  key: 'lead',
  name: 'Lead',
  pluralName: 'Leads',
  fields: [
    {
      key: 'first_name',
      type: 'string',
      name: 'First Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Jane' },
      create: { visible: true, order: 1, placeholder: 'Jane' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'lead.first_name.required', type: 'required', field: 'first_name', messageKey: 'lead.first_name.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'last_name',
      type: 'string',
      name: 'Last Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Doe' },
      create: { visible: true, order: 2, placeholder: 'Doe' },
      edit: { visible: true, order: 2 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'lead.last_name.required', type: 'required', field: 'last_name', messageKey: 'lead.last_name.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'email',
      type: 'string',
      name: 'Email',
      list: { visible: true, searchable: true },
      form: { visible: true, placeholder: 'jane@example.com' },
      create: { visible: true, order: 3, placeholder: 'jane@example.com' },
      edit: { visible: true, order: 3 },
      display: { type: 'email' },
      validation: {
        fieldRules: [
          { ruleId: 'lead.email.required', type: 'required', field: 'email', messageKey: 'lead.email.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'lead.email.format', type: 'email', field: 'email', messageKey: 'lead.email.format', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'phone',
      type: 'string',
      name: 'Phone',
      list: { visible: true },
      form: { visible: true, placeholder: '+1 555-0100' },
      create: { visible: true, order: 4, placeholder: '+1 555-0100' },
      edit: { visible: true, order: 4 },
      display: { type: 'phone' },
    },
    {
      key: 'company_name',
      type: 'string',
      name: 'Company',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Acme Corp' },
      create: { visible: true, order: 5, placeholder: 'Acme Corp' },
      edit: { visible: true, order: 5 },
      display: { type: 'text' },
    },
    {
      key: 'job_title',
      type: 'string',
      name: 'Job Title',
      list: { visible: true },
      form: { visible: true, placeholder: 'VP of Sales' },
      create: { visible: true, order: 6, placeholder: 'VP of Sales' },
      edit: { visible: true, order: 6 },
      display: { type: 'text' },
    },
    {
      key: 'source',
      type: 'enum',
      name: 'Source',
      enumValues: ['web', 'referral', 'event', 'linkedin', 'outbound', 'inbound', 'paid_ads'],
      list: { visible: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 7 },
      edit: { visible: true, order: 7 },
      display: { type: 'badge', badgeToneMap: { web: 'info', referral: 'success', event: 'neutral', linkedin: 'info', outbound: 'warning', inbound: 'success', paid_ads: 'warning' } },
      validation: {
        fieldRules: [
          { ruleId: 'lead.source.required', type: 'required', field: 'source', messageKey: 'lead.source.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['new', 'contacted', 'qualified', 'converted', 'disqualified'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { new: 'neutral', contacted: 'info', qualified: 'warning', converted: 'success', disqualified: 'danger' } },
    },
    {
      key: 'score',
      type: 'number',
      name: 'Lead Score',
      helpText: '0–100, higher is warmer',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '0' },
      create: { visible: false },
      edit: { visible: true, order: 8 },
      display: { type: 'number' },
      validation: {
        fieldRules: [
          { ruleId: 'lead.score.min', type: 'number_min', field: 'score', messageKey: 'lead.score.min', params: { min: 0 }, clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'lead.score.max', type: 'number_max', field: 'score', messageKey: 'lead.score.max', params: { max: 100 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
  ],
  computed: [
    { key: 'full_name', name: 'Full Name', type: 'string', formulaType: 'expression', expression: "first_name + ' ' + last_name", dependencies: ['first_name', 'last_name'] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'new',
    states: ['new', 'contacted', 'qualified', 'converted', 'disqualified'],
    transitions: [
      { key: 'contact', from: 'new', to: 'contacted', label: 'Mark Contacted' },
      { key: 'qualify', from: 'contacted', to: 'qualified', label: 'Qualify' },
      { key: 'convert', from: 'qualified', to: 'converted', label: 'Convert to Contact', hooks: ['createContact', 'createDeal'] },
      { key: 'disqualify', from: 'contacted', to: 'disqualified', label: 'Disqualify' },
      { key: 'reopen', from: 'disqualified', to: 'new', label: 'Reopen' },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'workspace' },
    update: { scope: 'owner' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ERP
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT_ENTITY: EntityDefinition = {
  key: 'product',
  name: 'Product',
  pluralName: 'Products',
  fields: [
    {
      key: 'sku',
      type: 'string',
      name: 'SKU',
      helpText: 'Format: 2–4 uppercase letters, hyphen, 4–8 digits. e.g. PRD-00042',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'PRD-00001' },
      create: { visible: true, order: 1, placeholder: 'PRD-00001' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'product.sku.required', type: 'required', field: 'sku', messageKey: 'product.sku.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'product.sku.format', type: 'regex', field: 'sku', messageKey: 'product.sku.format', params: { pattern: '^[A-Z]{2,4}-[0-9]{4,8}$' }, defaultMessage: 'SKU must follow the format ABC-00000', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'name',
      type: 'string',
      name: 'Product Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Enterprise License' },
      create: { visible: true, order: 2, placeholder: 'Enterprise License' },
      edit: { visible: true, order: 2 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'product.name.required', type: 'required', field: 'name', messageKey: 'product.name.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'category',
      type: 'enum',
      name: 'Category',
      enumValues: ['hardware', 'software', 'service', 'subscription', 'consumable'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 3 },
      edit: { visible: true, order: 3 },
      display: { type: 'badge', badgeToneMap: { hardware: 'neutral', software: 'info', service: 'warning', subscription: 'success', consumable: 'neutral' } },
      validation: {
        fieldRules: [
          { ruleId: 'product.category.required', type: 'required', field: 'category', messageKey: 'product.category.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'unit_price',
      type: 'number',
      name: 'Unit Price (USD)',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '0.00' },
      create: { visible: true, order: 4, placeholder: '0.00' },
      edit: { visible: true, order: 4 },
      display: { type: 'currency', currency: 'USD', precision: 2, align: 'right' },
      validation: {
        fieldRules: [
          { ruleId: 'product.unit_price.required', type: 'required', field: 'unit_price', messageKey: 'product.unit_price.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'product.unit_price.min', type: 'number_min', field: 'unit_price', messageKey: 'product.unit_price.min', params: { min: 0 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'cost_price',
      type: 'number',
      name: 'Cost Price (USD)',
      sensitive: 'pii',
      helpText: 'Internal cost — not visible to customers',
      list: { visible: false },
      form: { visible: true, placeholder: '0.00' },
      create: { visible: false },
      edit: { visible: true, order: 5 },
      display: { type: 'currency', currency: 'USD', precision: 2, align: 'right' },
      validation: {
        fieldRules: [
          { ruleId: 'product.cost_price.min', type: 'number_min', field: 'cost_price', messageKey: 'product.cost_price.min', params: { min: 0 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'unit_of_measure',
      type: 'enum',
      name: 'Unit of Measure',
      enumValues: ['unit', 'hour', 'day', 'kg', 'liter', 'meter'],
      list: { visible: true },
      form: { visible: true },
      create: { visible: true, order: 5 },
      edit: { visible: true, order: 6 },
      display: { type: 'badge', badgeToneMap: { unit: 'neutral', hour: 'info', day: 'info', kg: 'neutral', liter: 'neutral', meter: 'neutral' } },
    },
    {
      key: 'taxable',
      type: 'boolean',
      name: 'Taxable',
      list: { visible: true },
      form: { visible: true },
      create: { visible: true, order: 6 },
      edit: { visible: true, order: 7 },
      display: { type: 'text' },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'active', 'discontinued', 'out_of_stock'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { draft: 'neutral', active: 'success', discontinued: 'danger', out_of_stock: 'warning' } },
    },
    {
      key: 'description',
      type: 'text',
      name: 'Description',
      list: { visible: false },
      form: { visible: true, placeholder: 'Product description...' },
      create: { visible: true, order: 7 },
      edit: { visible: true, order: 8 },
      display: { type: 'multiline-text', truncate: true },
    },
  ],
  computed: [
    { key: 'margin_pct', name: 'Margin %', type: 'number', formulaType: 'conditional', condition: 'cost_price > 0', then: '(unit_price - cost_price) / unit_price * 100', else: '0', dependencies: ['unit_price', 'cost_price'] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'active', 'discontinued', 'out_of_stock'],
    transitions: [
      { key: 'activate', from: 'draft', to: 'active', label: 'Activate', guards: ['hasPriceSet'] },
      { key: 'discontinue', from: 'active', to: 'discontinued', label: 'Discontinue', hooks: ['notifyPurchasing'] },
      { key: 'reactivate', from: 'discontinued', to: 'active', label: 'Reactivate' },
      { key: 'stock_out', from: 'active', to: 'out_of_stock', label: 'Mark Out of Stock' },
      { key: 'restock', from: 'out_of_stock', to: 'active', label: 'Restock' },
    ],
  },
  validation: {
    entityRules: [
      { ruleId: 'product.price_exceeds_cost', type: 'entity_invariant', paths: ['unit_price', 'cost_price'], messageKey: 'product.price_exceeds_cost', clientSafe: true, blocking: false, severity: 'warning' },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'role', condition: 'catalog:create' },
    update: { scope: 'role', condition: 'catalog:update' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
  fieldPolicies: {
    cost_price: {
      view: { scope: 'role', condition: 'finance:view' },
      update: { scope: 'role', condition: 'finance:update' },
    },
  },
};

const PURCHASE_ORDER_ENTITY: EntityDefinition = {
  key: 'purchase_order',
  name: 'Purchase Order',
  pluralName: 'Purchase Orders',
  fields: [
    {
      key: 'po_number',
      type: 'string',
      name: 'PO Number',
      helpText: 'Format: PO- followed by 4–8 digits',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'PO-00001' },
      create: { visible: true, order: 1, placeholder: 'PO-00001' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'po.po_number.required', type: 'required', field: 'po_number', messageKey: 'po.po_number.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'po.po_number.format', type: 'regex', field: 'po_number', messageKey: 'po.po_number.format', params: { pattern: '^PO-[0-9]{4,8}$' }, defaultMessage: 'Must follow the format PO-00000', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'order_date',
      type: 'date',
      name: 'Order Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 2 },
      edit: { visible: true, order: 2 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'po.order_date.required', type: 'required', field: 'order_date', messageKey: 'po.order_date.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'expected_delivery_date',
      type: 'date',
      name: 'Expected Delivery',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 3 },
      edit: { visible: true, order: 3 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'po.expected_delivery_date.required', type: 'required', field: 'expected_delivery_date', messageKey: 'po.expected_delivery_date.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'po.expected_delivery_date.future', type: 'future_date', field: 'expected_delivery_date', messageKey: 'po.expected_delivery_date.future', defaultMessage: 'Delivery date must be today or later', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'shipping_address',
      type: 'text',
      name: 'Shipping Address',
      list: { visible: false },
      form: { visible: true, placeholder: '123 Main St, City, State 00000' },
      create: { visible: true, order: 4, placeholder: '123 Main St, City, State 00000' },
      edit: { visible: true, order: 4 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'notes',
      type: 'text',
      name: 'Notes',
      list: { visible: false },
      form: { visible: true, placeholder: 'Special delivery instructions...' },
      create: { visible: true, order: 5 },
      edit: { visible: true, order: 5 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'pending_approval', 'approved', 'partially_received', 'received', 'cancelled'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { draft: 'neutral', pending_approval: 'warning', approved: 'info', partially_received: 'info', received: 'success', cancelled: 'danger' } },
    },
  ],
  relations: [
    { key: 'supplier', relation: 'belongs_to', entity: 'supplier', foreignKey: 'supplier_id', required: true },
    { key: 'line_items', relation: 'has_many', entity: 'po_line_item', foreignKey: 'po_id' },
  ],
  computed: [
    { key: 'total_amount', name: 'Total Amount', type: 'number', formulaType: 'aggregation', relation: 'line_items', operation: 'sum', field: 'line_total', dependencies: [] },
    { key: 'line_item_count', name: 'Line Items', type: 'number', formulaType: 'aggregation', relation: 'line_items', operation: 'count', dependencies: [] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending_approval', 'approved', 'partially_received', 'received', 'cancelled'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending_approval', label: 'Submit for Approval', guards: ['hasLineItems'] },
      { key: 'approve', from: 'pending_approval', to: 'approved', label: 'Approve', guards: ['hasAuthority'] },
      { key: 'reject', from: 'pending_approval', to: 'draft', label: 'Reject', hooks: ['notifyRequester'] },
      { key: 'receive_partial', from: 'approved', to: 'partially_received', label: 'Mark Partially Received' },
      { key: 'receive', from: 'approved', to: 'received', label: 'Mark Fully Received', hooks: ['updateInventory'] },
      { key: 'receive_complete', from: 'partially_received', to: 'received', label: 'Mark Fully Received', hooks: ['updateInventory'] },
      { key: 'cancel', from: 'draft', to: 'cancelled', label: 'Cancel' },
      { key: 'cancel_pending', from: 'pending_approval', to: 'cancelled', label: 'Cancel' },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'role', condition: 'procurement:create' },
    update: { scope: 'role', condition: 'procurement:update' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

const SUPPLIER_ENTITY: EntityDefinition = {
  key: 'supplier',
  name: 'Supplier',
  pluralName: 'Suppliers',
  fields: [
    {
      key: 'name',
      type: 'string',
      name: 'Supplier Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Global Parts Ltd' },
      create: { visible: true, order: 1, placeholder: 'Global Parts Ltd' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'supplier.name.required', type: 'required', field: 'name', messageKey: 'supplier.name.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'email',
      type: 'string',
      name: 'Contact Email',
      list: { visible: true, searchable: true },
      form: { visible: true, placeholder: 'orders@supplier.com' },
      create: { visible: true, order: 2, placeholder: 'orders@supplier.com' },
      edit: { visible: true, order: 2 },
      display: { type: 'email' },
      validation: {
        fieldRules: [
          { ruleId: 'supplier.email.required', type: 'required', field: 'email', messageKey: 'supplier.email.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'supplier.email.format', type: 'email', field: 'email', messageKey: 'supplier.email.format', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'phone',
      type: 'string',
      name: 'Phone',
      list: { visible: true },
      form: { visible: true, placeholder: '+1 555-0100' },
      create: { visible: true, order: 3, placeholder: '+1 555-0100' },
      edit: { visible: true, order: 3 },
      display: { type: 'phone' },
    },
    {
      key: 'country',
      type: 'string',
      name: 'Country',
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true, placeholder: 'Germany' },
      create: { visible: true, order: 4, placeholder: 'Germany' },
      edit: { visible: true, order: 4 },
      display: { type: 'text' },
    },
    {
      key: 'payment_terms',
      type: 'enum',
      name: 'Payment Terms',
      enumValues: ['net15', 'net30', 'net45', 'net60', 'cod', 'prepaid'],
      list: { visible: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 5 },
      edit: { visible: true, order: 5 },
      display: { type: 'badge', badgeToneMap: { net15: 'success', net30: 'success', net45: 'info', net60: 'warning', cod: 'neutral', prepaid: 'neutral' } },
    },
    {
      key: 'currency',
      type: 'enum',
      name: 'Currency',
      enumValues: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
      list: { visible: true },
      form: { visible: true },
      create: { visible: true, order: 6 },
      edit: { visible: true, order: 6 },
      display: { type: 'badge', badgeToneMap: { USD: 'neutral', EUR: 'neutral', GBP: 'neutral', JPY: 'neutral', CAD: 'neutral', AUD: 'neutral' } },
    },
    {
      key: 'tax_id',
      type: 'string',
      name: 'Tax ID',
      sensitive: 'pii',
      list: { visible: false },
      form: { visible: true, placeholder: 'DE123456789' },
      create: { visible: true, order: 7, placeholder: 'DE123456789' },
      edit: { visible: true, order: 7 },
      display: { type: 'text' },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['pending_review', 'active', 'inactive', 'blacklisted'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { pending_review: 'warning', active: 'success', inactive: 'neutral', blacklisted: 'danger' } },
    },
  ],
  relations: [
    { key: 'purchase_orders', relation: 'has_many', entity: 'purchase_order', foreignKey: 'supplier_id' },
  ],
  lifecycle: {
    field: 'status',
    initial: 'pending_review',
    states: ['pending_review', 'active', 'inactive', 'blacklisted'],
    transitions: [
      { key: 'approve', from: 'pending_review', to: 'active', label: 'Approve Supplier', guards: ['hasVerifiedTaxId'] },
      { key: 'deactivate', from: 'active', to: 'inactive', label: 'Deactivate' },
      { key: 'blacklist', from: 'active', to: 'blacklisted', label: 'Blacklist', guards: ['noOpenPOs'], hooks: ['notifyProcurement'] },
      { key: 'blacklist_inactive', from: 'inactive', to: 'blacklisted', label: 'Blacklist' },
      { key: 'reactivate', from: 'inactive', to: 'active', label: 'Reactivate' },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'role', condition: 'procurement:create' },
    update: { scope: 'role', condition: 'procurement:update' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

const INVOICE_ENTITY: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    {
      key: 'invoice_number',
      type: 'string',
      name: 'Invoice Number',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'INV-00001' },
      create: { visible: true, order: 1, placeholder: 'INV-00001' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'invoice.invoice_number.required', type: 'required', field: 'invoice_number', messageKey: 'invoice.invoice_number.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'invoice.invoice_number.format', type: 'regex', field: 'invoice_number', messageKey: 'invoice.invoice_number.format', params: { pattern: '^INV-[0-9]{4,8}$' }, defaultMessage: 'Must follow the format INV-00000', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'issue_date',
      type: 'date',
      name: 'Issue Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 2 },
      edit: { visible: true, order: 2 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'invoice.issue_date.required', type: 'required', field: 'issue_date', messageKey: 'invoice.issue_date.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'due_date',
      type: 'date',
      name: 'Due Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 3 },
      edit: { visible: true, order: 3 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'invoice.due_date.required', type: 'required', field: 'due_date', messageKey: 'invoice.due_date.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'invoice.due_date.future', type: 'future_date', field: 'due_date', messageKey: 'invoice.due_date.future', defaultMessage: 'Due date must be today or later', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'tax_rate',
      type: 'number',
      name: 'Tax Rate (%)',
      list: { visible: false },
      form: { visible: true, placeholder: '20' },
      create: { visible: true, order: 4, placeholder: '20' },
      edit: { visible: true, order: 4 },
      display: { type: 'number' },
      validation: {
        fieldRules: [
          { ruleId: 'invoice.tax_rate.min', type: 'number_min', field: 'tax_rate', messageKey: 'invoice.tax_rate.min', params: { min: 0 }, clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'invoice.tax_rate.max', type: 'number_max', field: 'tax_rate', messageKey: 'invoice.tax_rate.max', params: { max: 100 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'notes',
      type: 'text',
      name: 'Notes',
      helpText: 'Payment terms, bank details, or client instructions',
      list: { visible: false },
      form: { visible: true, placeholder: 'Net 30 — bank transfer to account IBAN XX00...' },
      create: { visible: true, order: 5 },
      edit: { visible: true, order: 5 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'voided'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { draft: 'neutral', sent: 'info', partially_paid: 'warning', paid: 'success', overdue: 'danger', voided: 'neutral' } },
    },
  ],
  relations: [
    { key: 'company', relation: 'belongs_to', entity: 'company', foreignKey: 'company_id', required: true },
    { key: 'line_items', relation: 'has_many', entity: 'invoice_line_item', foreignKey: 'invoice_id' },
  ],
  computed: [
    { key: 'subtotal', name: 'Subtotal', type: 'number', formulaType: 'aggregation', relation: 'line_items', operation: 'sum', field: 'line_total', dependencies: [] },
    { key: 'total_amount', name: 'Total (incl. tax)', type: 'number', formulaType: 'expression', expression: 'subtotal * (1 + tax_rate / 100)', dependencies: ['subtotal', 'tax_rate'] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'voided'],
    transitions: [
      { key: 'send', from: 'draft', to: 'sent', label: 'Send to Client', guards: ['hasLineItems'], hooks: ['sendEmail'] },
      { key: 'record_partial', from: 'sent', to: 'partially_paid', label: 'Record Partial Payment' },
      { key: 'record_payment', from: 'sent', to: 'paid', label: 'Mark Paid', hooks: ['notifyFinance'] },
      { key: 'record_payment_full', from: 'partially_paid', to: 'paid', label: 'Mark Fully Paid', hooks: ['notifyFinance'] },
      { key: 'mark_overdue', from: 'sent', to: 'overdue', label: 'Mark Overdue', hooks: ['sendReminder'] },
      { key: 'void', from: 'draft', to: 'voided', label: 'Void' },
      { key: 'void_sent', from: 'sent', to: 'voided', label: 'Void', guards: ['noPaymentRecorded'] },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'role', condition: 'finance:create' },
    update: { scope: 'role', condition: 'finance:update' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_ENTITY: EntityDefinition = {
  key: 'project',
  name: 'Project',
  pluralName: 'Projects',
  fields: [
    {
      key: 'name',
      type: 'string',
      name: 'Project Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Customer Portal Redesign' },
      create: { visible: true, order: 1, placeholder: 'Customer Portal Redesign' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'project.name.required', type: 'required', field: 'name', messageKey: 'project.name.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'project.name.min_length', type: 'min_length', field: 'name', messageKey: 'project.name.min_length', params: { min: 3 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'code',
      type: 'string',
      name: 'Project Code',
      helpText: '2–5 uppercase letters used as a prefix for task IDs, e.g. CPR',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'CPR' },
      create: { visible: true, order: 2, placeholder: 'CPR' },
      edit: { visible: true, order: 2 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'project.code.required', type: 'required', field: 'code', messageKey: 'project.code.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'project.code.format', type: 'regex', field: 'code', messageKey: 'project.code.format', params: { pattern: '^[A-Z]{2,5}$' }, defaultMessage: 'Code must be 2–5 uppercase letters', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'priority',
      type: 'enum',
      name: 'Priority',
      enumValues: ['low', 'medium', 'high', 'critical'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 3 },
      edit: { visible: true, order: 3 },
      display: { type: 'badge', badgeToneMap: { low: 'neutral', medium: 'info', high: 'warning', critical: 'danger' } },
      validation: {
        fieldRules: [
          { ruleId: 'project.priority.required', type: 'required', field: 'priority', messageKey: 'project.priority.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'start_date',
      type: 'date',
      name: 'Start Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 4 },
      edit: { visible: true, order: 4 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'project.start_date.required', type: 'required', field: 'start_date', messageKey: 'project.start_date.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'end_date',
      type: 'date',
      name: 'Target End Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 5 },
      edit: { visible: true, order: 5 },
      display: { type: 'date' },
    },
    {
      key: 'budget',
      type: 'number',
      name: 'Budget (USD)',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '0' },
      create: { visible: true, order: 6, placeholder: '0' },
      edit: { visible: true, order: 6 },
      display: { type: 'currency', currency: 'USD', precision: 0, align: 'right' },
      validation: {
        fieldRules: [
          { ruleId: 'project.budget.min', type: 'number_min', field: 'budget', messageKey: 'project.budget.min', params: { min: 0 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'description',
      type: 'text',
      name: 'Description',
      list: { visible: false },
      form: { visible: true, placeholder: 'Project goals and scope...' },
      create: { visible: true, order: 7 },
      edit: { visible: true, order: 7 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { planning: 'neutral', active: 'success', on_hold: 'warning', completed: 'info', cancelled: 'danger' } },
    },
  ],
  relations: [
    { key: 'tasks', relation: 'has_many', entity: 'task', foreignKey: 'project_id' },
    { key: 'sprints', relation: 'has_many', entity: 'sprint', foreignKey: 'project_id' },
    { key: 'time_entries', relation: 'has_many', entity: 'time_entry', foreignKey: 'project_id' },
  ],
  computed: [
    { key: 'open_task_count', name: 'Open Tasks', type: 'number', formulaType: 'aggregation', relation: 'tasks', operation: 'count', filter: "status != 'done' AND status != 'cancelled'", dependencies: [] },
    { key: 'completion_pct', name: 'Completion %', type: 'number', formulaType: 'aggregation', relation: 'tasks', operation: 'count', filter: "status = 'done'", dependencies: [] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'planning',
    states: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    transitions: [
      { key: 'start', from: 'planning', to: 'active', label: 'Start Project', guards: ['hasStartDate'] },
      { key: 'hold', from: 'active', to: 'on_hold', label: 'Put on Hold', hooks: ['notifyTeam'] },
      { key: 'resume', from: 'on_hold', to: 'active', label: 'Resume', hooks: ['notifyTeam'] },
      { key: 'complete', from: 'active', to: 'completed', label: 'Mark Complete', guards: ['noOpenTasks'], hooks: ['notifyStakeholders'] },
      { key: 'cancel', from: 'planning', to: 'cancelled', label: 'Cancel' },
      { key: 'cancel_active', from: 'active', to: 'cancelled', label: 'Cancel', hooks: ['notifyTeam'] },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'role', condition: 'pm:create' },
    update: { scope: 'workspace' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

const TASK_ENTITY: EntityDefinition = {
  key: 'task',
  name: 'Task',
  pluralName: 'Tasks',
  fields: [
    {
      key: 'title',
      type: 'string',
      name: 'Title',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Implement login page' },
      create: { visible: true, order: 1, placeholder: 'Implement login page' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'task.title.required', type: 'required', field: 'title', messageKey: 'task.title.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'task.title.min_length', type: 'min_length', field: 'title', messageKey: 'task.title.min_length', params: { min: 3 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'priority',
      type: 'enum',
      name: 'Priority',
      enumValues: ['low', 'medium', 'high', 'critical'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 2 },
      edit: { visible: true, order: 2 },
      display: { type: 'badge', badgeToneMap: { low: 'neutral', medium: 'info', high: 'warning', critical: 'danger' } },
      validation: {
        fieldRules: [
          { ruleId: 'task.priority.required', type: 'required', field: 'priority', messageKey: 'task.priority.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'due_date',
      type: 'date',
      name: 'Due Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 3 },
      edit: { visible: true, order: 3 },
      display: { type: 'date' },
    },
    {
      key: 'estimated_hours',
      type: 'number',
      name: 'Estimated Hours',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '4' },
      create: { visible: true, order: 4, placeholder: '4' },
      edit: { visible: true, order: 4 },
      display: { type: 'number' },
      validation: {
        fieldRules: [
          { ruleId: 'task.estimated_hours.min', type: 'number_min', field: 'estimated_hours', messageKey: 'task.estimated_hours.min', params: { min: 0.25 }, defaultMessage: 'Minimum 0.25 hours', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'task.estimated_hours.max', type: 'number_max', field: 'estimated_hours', messageKey: 'task.estimated_hours.max', params: { max: 999 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'is_blocked',
      type: 'boolean',
      name: 'Blocked',
      list: { visible: true },
      form: { visible: true },
      create: { visible: true, order: 5 },
      edit: { visible: true, order: 5 },
      display: { type: 'text' },
    },
    {
      key: 'blocking_reason',
      type: 'text',
      name: 'Blocking Reason',
      helpText: 'Required when the task is marked as blocked',
      list: { visible: false },
      form: { visible: true, placeholder: 'Waiting for API spec from backend team...' },
      create: { visible: false },
      edit: { visible: true, order: 6 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'description',
      type: 'text',
      name: 'Description',
      list: { visible: false },
      form: { visible: true, placeholder: 'Acceptance criteria and implementation notes...' },
      create: { visible: true, order: 6 },
      edit: { visible: true, order: 7 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['todo', 'in_progress', 'in_review', 'done', 'cancelled'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { todo: 'neutral', in_progress: 'info', in_review: 'warning', done: 'success', cancelled: 'danger' } },
    },
  ],
  relations: [
    { key: 'project', relation: 'belongs_to', entity: 'project', foreignKey: 'project_id', required: true },
    { key: 'parent_task', relation: 'belongs_to', entity: 'task', foreignKey: 'parent_task_id' },
    { key: 'sub_tasks', relation: 'has_many', entity: 'task', foreignKey: 'parent_task_id' },
    { key: 'time_entries', relation: 'has_many', entity: 'time_entry', foreignKey: 'task_id' },
  ],
  computed: [
    { key: 'logged_hours', name: 'Logged Hours', type: 'number', formulaType: 'aggregation', relation: 'time_entries', operation: 'sum', field: 'hours', dependencies: [] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'todo',
    states: ['todo', 'in_progress', 'in_review', 'done', 'cancelled'],
    transitions: [
      { key: 'start', from: 'todo', to: 'in_progress', label: 'Start' },
      { key: 'submit_review', from: 'in_progress', to: 'in_review', label: 'Submit for Review' },
      { key: 'approve', from: 'in_review', to: 'done', label: 'Approve & Close' },
      { key: 'request_changes', from: 'in_review', to: 'in_progress', label: 'Request Changes', hooks: ['notifyAssignee'] },
      { key: 'reopen', from: 'done', to: 'todo', label: 'Reopen' },
      { key: 'cancel', from: 'todo', to: 'cancelled', label: 'Cancel' },
      { key: 'cancel_active', from: 'in_progress', to: 'cancelled', label: 'Cancel' },
    ],
  },
  validation: {
    entityRules: [
      { ruleId: 'task.blocking_reason_required', type: 'entity_invariant', paths: ['is_blocked', 'blocking_reason'], messageKey: 'task.blocking_reason_required', clientSafe: true, blocking: true, severity: 'error' },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'workspace' },
    update: { scope: 'owner' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

const SPRINT_ENTITY: EntityDefinition = {
  key: 'sprint',
  name: 'Sprint',
  pluralName: 'Sprints',
  fields: [
    {
      key: 'name',
      type: 'string',
      name: 'Sprint Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Sprint 12 — Auth & Onboarding' },
      create: { visible: true, order: 1, placeholder: 'Sprint 12' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'sprint.name.required', type: 'required', field: 'name', messageKey: 'sprint.name.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'sprint.name.min_length', type: 'min_length', field: 'name', messageKey: 'sprint.name.min_length', params: { min: 3 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'start_date',
      type: 'date',
      name: 'Start Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 2 },
      edit: { visible: true, order: 2 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'sprint.start_date.required', type: 'required', field: 'start_date', messageKey: 'sprint.start_date.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'end_date',
      type: 'date',
      name: 'End Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 3 },
      edit: { visible: true, order: 3 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'sprint.end_date.required', type: 'required', field: 'end_date', messageKey: 'sprint.end_date.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'capacity_points',
      type: 'number',
      name: 'Capacity (Story Points)',
      helpText: 'Total story points the team can deliver this sprint',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '40' },
      create: { visible: true, order: 4, placeholder: '40' },
      edit: { visible: true, order: 4 },
      display: { type: 'number' },
      validation: {
        fieldRules: [
          { ruleId: 'sprint.capacity_points.min', type: 'number_min', field: 'capacity_points', messageKey: 'sprint.capacity_points.min', params: { min: 0 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'goal',
      type: 'text',
      name: 'Sprint Goal',
      list: { visible: false },
      form: { visible: true, placeholder: 'Complete user authentication flow and onboarding screens' },
      create: { visible: true, order: 5 },
      edit: { visible: true, order: 5 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['planning', 'active', 'completed', 'cancelled'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { planning: 'neutral', active: 'success', completed: 'info', cancelled: 'danger' } },
    },
  ],
  relations: [
    { key: 'project', relation: 'belongs_to', entity: 'project', foreignKey: 'project_id', required: true },
    { key: 'tasks', relation: 'many_to_many', entity: 'task', through: 'sprint_task', sourceKey: 'sprint_id', targetKey: 'task_id' },
  ],
  computed: [
    { key: 'velocity', name: 'Velocity (Points)', type: 'number', formulaType: 'aggregation', relation: 'tasks', operation: 'sum', field: 'story_points', filter: "status = 'done'", dependencies: [] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'planning',
    states: ['planning', 'active', 'completed', 'cancelled'],
    transitions: [
      { key: 'start', from: 'planning', to: 'active', label: 'Start Sprint', guards: ['hasStartDate', 'hasEndDate'], hooks: ['notifyTeam'] },
      { key: 'complete', from: 'active', to: 'completed', label: 'Complete Sprint', hooks: ['moveUnfinishedTasks', 'generateVelocityReport'] },
      { key: 'cancel', from: 'planning', to: 'cancelled', label: 'Cancel' },
    ],
  },
  validation: {
    entityRules: [
      { ruleId: 'sprint.end_after_start', type: 'entity_invariant', paths: ['start_date', 'end_date'], messageKey: 'sprint.end_after_start', clientSafe: true, blocking: true, severity: 'error' },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'role', condition: 'pm:create' },
    update: { scope: 'role', condition: 'pm:update' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

const TIME_ENTRY_ENTITY: EntityDefinition = {
  key: 'time_entry',
  name: 'Time Entry',
  pluralName: 'Time Entries',
  fields: [
    {
      key: 'date',
      type: 'date',
      name: 'Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 1 },
      edit: { visible: true, order: 1 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'time_entry.date.required', type: 'required', field: 'date', messageKey: 'time_entry.date.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'hours',
      type: 'number',
      name: 'Hours',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '2.5' },
      create: { visible: true, order: 2, placeholder: '2.5' },
      edit: { visible: true, order: 2 },
      display: { type: 'number' },
      validation: {
        fieldRules: [
          { ruleId: 'time_entry.hours.required', type: 'required', field: 'hours', messageKey: 'time_entry.hours.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'time_entry.hours.min', type: 'number_min', field: 'hours', messageKey: 'time_entry.hours.min', params: { min: 0.25 }, defaultMessage: 'Minimum 0.25 hours (15 minutes)', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'time_entry.hours.max', type: 'number_max', field: 'hours', messageKey: 'time_entry.hours.max', params: { max: 24 }, defaultMessage: 'Cannot exceed 24 hours in a day', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'description',
      type: 'text',
      name: 'Description',
      list: { visible: true },
      form: { visible: true, placeholder: 'Implemented JWT auth middleware and unit tests' },
      create: { visible: true, order: 3, placeholder: 'What did you work on?' },
      edit: { visible: true, order: 3 },
      display: { type: 'multiline-text', truncate: true },
      validation: {
        fieldRules: [
          { ruleId: 'time_entry.description.required', type: 'required', field: 'description', messageKey: 'time_entry.description.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'time_entry.description.min_length', type: 'min_length', field: 'description', messageKey: 'time_entry.description.min_length', params: { min: 10 }, defaultMessage: 'Please provide at least 10 characters', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'billable',
      type: 'boolean',
      name: 'Billable',
      list: { visible: true },
      form: { visible: true },
      create: { visible: true, order: 4 },
      edit: { visible: true, order: 4 },
      display: { type: 'text' },
    },
    {
      key: 'hourly_rate',
      type: 'number',
      name: 'Hourly Rate (USD)',
      sensitive: 'pii',
      list: { visible: false },
      form: { visible: true, placeholder: '150' },
      create: { visible: false },
      edit: { visible: true, order: 5 },
      display: { type: 'currency', currency: 'USD', precision: 2, align: 'right' },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'submitted', 'approved', 'rejected'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { draft: 'neutral', submitted: 'info', approved: 'success', rejected: 'danger' } },
    },
  ],
  relations: [
    { key: 'project', relation: 'belongs_to', entity: 'project', foreignKey: 'project_id', required: true },
    { key: 'task', relation: 'belongs_to', entity: 'task', foreignKey: 'task_id' },
  ],
  computed: [
    { key: 'billable_amount', name: 'Billable Amount', type: 'number', formulaType: 'conditional', condition: 'billable', then: 'hours * hourly_rate', else: '0', dependencies: ['billable', 'hours', 'hourly_rate'] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'submitted', 'approved', 'rejected'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'submitted', label: 'Submit for Approval' },
      { key: 'approve', from: 'submitted', to: 'approved', label: 'Approve', hooks: ['updateBilling'] },
      { key: 'reject', from: 'submitted', to: 'rejected', label: 'Reject', hooks: ['notifyEmployee'] },
      { key: 'reopen', from: 'rejected', to: 'draft', label: 'Reopen' },
    ],
  },
  policies: {
    view: { scope: 'owner' },
    create: { scope: 'workspace' },
    update: { scope: 'owner' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
  fieldPolicies: {
    hourly_rate: {
      view: { scope: 'role', condition: 'finance:view' },
      update: { scope: 'role', condition: 'finance:update' },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDER — relations showcase (belongs_to + has_many + many_to_many + self)
// ─────────────────────────────────────────────────────────────────────────────

const ORDER_ENTITY: EntityDefinition = {
  key: 'order',
  name: 'Order',
  pluralName: 'Orders',
  fields: [
    {
      key: 'order_number',
      type: 'string',
      name: 'Order Number',
      helpText: 'Format: ORD- followed by 4–8 digits',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'ORD-00001' },
      create: { visible: true, order: 1, placeholder: 'ORD-00001' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'order.order_number.required', type: 'required', field: 'order_number', messageKey: 'order.order_number.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'order.order_number.format', type: 'regex', field: 'order_number', messageKey: 'order.order_number.format', params: { pattern: '^ORD-[0-9]{4,8}$' }, defaultMessage: 'Must follow the format ORD-00000', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'order_date',
      type: 'date',
      name: 'Order Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 2 },
      edit: { visible: true, order: 2 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'order.order_date.required', type: 'required', field: 'order_date', messageKey: 'order.order_date.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: {
        type: 'status',
        statusMap: {
          draft: 'neutral',
          confirmed: 'info',
          processing: 'info',
          shipped: 'warning',
          delivered: 'success',
          cancelled: 'danger',
          refunded: 'neutral',
        },
      },
    },
    {
      key: 'shipping_address',
      type: 'text',
      name: 'Shipping Address',
      list: { visible: false },
      form: { visible: true, placeholder: '123 Main St, New York, NY 10001' },
      create: { visible: true, order: 3, placeholder: '123 Main St, New York, NY 10001' },
      edit: { visible: true, order: 3 },
      display: { type: 'multiline-text', truncate: true },
      validation: {
        fieldRules: [
          { ruleId: 'order.shipping_address.required', type: 'required', field: 'shipping_address', messageKey: 'order.shipping_address.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'notes',
      type: 'text',
      name: 'Notes',
      list: { visible: false },
      form: { visible: true, placeholder: 'Gift wrapping, delivery instructions...' },
      create: { visible: true, order: 4 },
      edit: { visible: true, order: 4 },
      display: { type: 'multiline-text', truncate: true },
    },
    // The FK fields for belongs_to relations — visible in the entity fields list
    {
      key: 'customer_id',
      type: 'string',
      name: 'Customer ID',
      helpText: 'Foreign key → customer.id',
      list: { visible: false },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'text' },
    },
    {
      key: 'shipping_profile_id',
      type: 'string',
      name: 'Shipping Profile ID',
      helpText: 'Foreign key → shipping_profile.id',
      list: { visible: false },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'text' },
    },
  ],

  // ── Relations ─────────────────────────────────────────────────────────────
  // This entity is designed to demonstrate all three primary relation types
  // in a single, realistic context.
  relations: [
    // belongs_to — this entity holds the FK
    {
      key: 'customer',
      relation: 'belongs_to',
      entity: 'customer',
      foreignKey: 'customer_id',
      required: true,
    },
    // belongs_to — one-to-one from this side (a single shipping profile per order)
    {
      key: 'shipping_profile',
      relation: 'belongs_to',
      entity: 'shipping_profile',
      foreignKey: 'shipping_profile_id',
    },
    // has_many — child collection owned by this entity
    {
      key: 'order_items',
      relation: 'has_many',
      entity: 'order_item',
      foreignKey: 'order_id',
    },
    // many_to_many — via a join table, no extra data on the join
    {
      key: 'promotions',
      relation: 'many_to_many',
      entity: 'promotion',
      through: 'order_promotion',
      sourceKey: 'order_id',
      targetKey: 'promotion_id',
    },
    // self — an order can reference a parent order (re-order / replacement)
    {
      key: 'parent_order',
      relation: 'self',
      kind: 'belongs_to',
    },
  ],

  computed: [
    {
      key: 'item_count',
      name: 'Item Count',
      type: 'number',
      formulaType: 'aggregation',
      relation: 'order_items',
      operation: 'count',
      dependencies: [],
    },
    {
      key: 'subtotal',
      name: 'Subtotal',
      type: 'number',
      formulaType: 'aggregation',
      relation: 'order_items',
      operation: 'sum',
      field: 'line_total',
      dependencies: [],
    },
    {
      key: 'promotion_count',
      name: 'Applied Promotions',
      type: 'number',
      formulaType: 'aggregation',
      relation: 'promotions',
      operation: 'count',
      dependencies: [],
    },
  ],

  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    transitions: [
      { key: 'confirm', from: 'draft', to: 'confirmed', label: 'Confirm Order', guards: ['hasOrderItems', 'hasShippingAddress'] },
      { key: 'process', from: 'confirmed', to: 'processing', label: 'Start Processing', hooks: ['reserveInventory'] },
      { key: 'ship', from: 'processing', to: 'shipped', label: 'Mark Shipped', hooks: ['sendTrackingEmail'] },
      { key: 'deliver', from: 'shipped', to: 'delivered', label: 'Mark Delivered', hooks: ['triggerReviewRequest'] },
      { key: 'cancel', from: 'draft', to: 'cancelled', label: 'Cancel' },
      { key: 'cancel_confirmed', from: 'confirmed', to: 'cancelled', label: 'Cancel', hooks: ['releaseInventory', 'sendCancellationEmail'] },
      { key: 'refund', from: 'delivered', to: 'refunded', label: 'Issue Refund', hooks: ['triggerRefundPayment'] },
    ],
  },

  events: {
    names: {
      created: 'order.placed',
      updated: 'order.updated',
      deleted: 'order.removed',
    },
  },

  policies: {
    view: { scope: 'owner' },
    create: { scope: 'workspace' },
    update: { scope: 'role', condition: 'operations:update' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HR
// ─────────────────────────────────────────────────────────────────────────────

const EMPLOYEE_ENTITY: EntityDefinition = {
  key: 'employee',
  name: 'Employee',
  pluralName: 'Employees',
  fields: [
    {
      key: 'employee_id',
      type: 'string',
      name: 'Employee ID',
      helpText: 'Format: EMP- followed by 4–6 digits',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'EMP-001042' },
      create: { visible: true, order: 1, placeholder: 'EMP-001042' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'employee.employee_id.required', type: 'required', field: 'employee_id', messageKey: 'employee.employee_id.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'employee.employee_id.format', type: 'regex', field: 'employee_id', messageKey: 'employee.employee_id.format', params: { pattern: '^EMP-[0-9]{4,6}$' }, defaultMessage: 'Must follow the format EMP-0000', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'first_name',
      type: 'string',
      name: 'First Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Jane' },
      create: { visible: true, order: 2, placeholder: 'Jane' },
      edit: { visible: true, order: 2 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'employee.first_name.required', type: 'required', field: 'first_name', messageKey: 'employee.first_name.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'last_name',
      type: 'string',
      name: 'Last Name',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Doe' },
      create: { visible: true, order: 3, placeholder: 'Doe' },
      edit: { visible: true, order: 3 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'employee.last_name.required', type: 'required', field: 'last_name', messageKey: 'employee.last_name.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'email',
      type: 'string',
      name: 'Work Email',
      list: { visible: true, searchable: true },
      form: { visible: true, placeholder: 'jane.doe@company.com' },
      create: { visible: true, order: 4, placeholder: 'jane.doe@company.com' },
      edit: { visible: true, order: 4 },
      display: { type: 'email' },
      validation: {
        fieldRules: [
          { ruleId: 'employee.email.required', type: 'required', field: 'email', messageKey: 'employee.email.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'employee.email.format', type: 'email', field: 'email', messageKey: 'employee.email.format', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'job_title',
      type: 'string',
      name: 'Job Title',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: 'Senior Software Engineer' },
      create: { visible: true, order: 5, placeholder: 'Senior Software Engineer' },
      edit: { visible: true, order: 5 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'employee.job_title.required', type: 'required', field: 'job_title', messageKey: 'employee.job_title.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'department',
      type: 'enum',
      name: 'Department',
      enumValues: ['engineering', 'product', 'design', 'sales', 'marketing', 'finance', 'hr', 'operations', 'legal'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 6 },
      edit: { visible: true, order: 6 },
      display: { type: 'badge', badgeToneMap: { engineering: 'info', product: 'info', design: 'warning', sales: 'success', marketing: 'success', finance: 'neutral', hr: 'neutral', operations: 'neutral', legal: 'neutral' } },
      validation: {
        fieldRules: [
          { ruleId: 'employee.department.required', type: 'required', field: 'department', messageKey: 'employee.department.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'employment_type',
      type: 'enum',
      name: 'Employment Type',
      enumValues: ['full_time', 'part_time', 'contractor', 'intern'],
      list: { visible: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 7 },
      edit: { visible: true, order: 7 },
      display: { type: 'badge', badgeToneMap: { full_time: 'success', part_time: 'info', contractor: 'warning', intern: 'neutral' } },
    },
    {
      key: 'start_date',
      type: 'date',
      name: 'Start Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 8 },
      edit: { visible: true, order: 8 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'employee.start_date.required', type: 'required', field: 'start_date', messageKey: 'employee.start_date.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'salary',
      type: 'number',
      name: 'Annual Salary (USD)',
      sensitive: 'pii',
      list: { visible: false },
      form: { visible: true, placeholder: '0' },
      create: { visible: false },
      edit: { visible: true, order: 9 },
      display: { type: 'currency', currency: 'USD', precision: 0, align: 'right' },
      validation: {
        fieldRules: [
          { ruleId: 'employee.salary.min', type: 'number_min', field: 'salary', messageKey: 'employee.salary.min', params: { min: 0 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['active', 'on_leave', 'terminated'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { active: 'success', on_leave: 'warning', terminated: 'danger' } },
    },
  ],
  relations: [
    { key: 'manager', relation: 'belongs_to', entity: 'employee', foreignKey: 'manager_id' },
    { key: 'direct_reports', relation: 'has_many', entity: 'employee', foreignKey: 'manager_id' },
    { key: 'leave_requests', relation: 'has_many', entity: 'leave_request', foreignKey: 'employee_id' },
  ],
  computed: [
    { key: 'full_name', name: 'Full Name', type: 'string', formulaType: 'expression', expression: "first_name + ' ' + last_name", dependencies: ['first_name', 'last_name'] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'active',
    states: ['active', 'on_leave', 'terminated'],
    transitions: [
      { key: 'place_on_leave', from: 'active', to: 'on_leave', label: 'Place on Leave' },
      { key: 'return_from_leave', from: 'on_leave', to: 'active', label: 'Return from Leave' },
      { key: 'terminate', from: 'active', to: 'terminated', label: 'Terminate', guards: ['hasEndDate'], hooks: ['revokeSystemAccess', 'notifyPayroll'] },
      { key: 'terminate_leave', from: 'on_leave', to: 'terminated', label: 'Terminate', hooks: ['revokeSystemAccess', 'notifyPayroll'] },
    ],
  },
  policies: {
    view: { scope: 'workspace' },
    create: { scope: 'role', condition: 'hr:create' },
    update: { scope: 'role', condition: 'hr:update' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
  fieldPolicies: {
    salary: {
      view: { scope: 'role', condition: 'hr:view' },
      update: { scope: 'role', condition: 'hr:update' },
    },
  },
};

const LEAVE_REQUEST_ENTITY: EntityDefinition = {
  key: 'leave_request',
  name: 'Leave Request',
  pluralName: 'Leave Requests',
  fields: [
    {
      key: 'type',
      type: 'enum',
      name: 'Leave Type',
      enumValues: ['vacation', 'sick', 'personal', 'parental', 'bereavement', 'unpaid'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 1 },
      edit: { visible: true, order: 1 },
      display: { type: 'badge', badgeToneMap: { vacation: 'success', sick: 'warning', personal: 'info', parental: 'info', bereavement: 'neutral', unpaid: 'neutral' } },
      validation: {
        fieldRules: [
          { ruleId: 'leave.type.required', type: 'required', field: 'type', messageKey: 'leave.type.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'start_date',
      type: 'date',
      name: 'Start Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 2 },
      edit: { visible: true, order: 2 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'leave.start_date.required', type: 'required', field: 'start_date', messageKey: 'leave.start_date.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'leave.start_date.future', type: 'future_date', field: 'start_date', messageKey: 'leave.start_date.future', defaultMessage: 'Start date must be today or later', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'end_date',
      type: 'date',
      name: 'End Date',
      list: { visible: true, sortable: true },
      form: { visible: true },
      create: { visible: true, order: 3 },
      edit: { visible: true, order: 3 },
      display: { type: 'date' },
      validation: {
        fieldRules: [
          { ruleId: 'leave.end_date.required', type: 'required', field: 'end_date', messageKey: 'leave.end_date.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'leave.end_date.future', type: 'future_date', field: 'end_date', messageKey: 'leave.end_date.future', defaultMessage: 'End date must be today or later', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'reason',
      type: 'text',
      name: 'Reason',
      list: { visible: false },
      form: { visible: true, placeholder: 'Annual leave — family holiday' },
      create: { visible: true, order: 4 },
      edit: { visible: true, order: 4 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'review_notes',
      type: 'text',
      name: 'Review Notes',
      helpText: 'Added by the approver — not editable by the requester',
      list: { visible: false },
      form: { visible: true, placeholder: 'Approved. Cover arranged with team.' },
      create: { visible: false },
      edit: { visible: true, order: 5 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'pending', 'approved', 'rejected', 'cancelled'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { draft: 'neutral', pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'neutral' } },
    },
  ],
  relations: [
    { key: 'employee', relation: 'belongs_to', entity: 'employee', foreignKey: 'employee_id', required: true },
  ],
  computed: [
    { key: 'days_requested', name: 'Days Requested', type: 'number', formulaType: 'expression', expression: 'end_date - start_date + 1', dependencies: ['start_date', 'end_date'] },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'rejected', 'cancelled'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending', label: 'Submit Request', hooks: ['notifyManager'] },
      { key: 'approve', from: 'pending', to: 'approved', label: 'Approve', guards: ['hasLeaveBalance'], hooks: ['updateLeaveBalance', 'notifyEmployee'] },
      { key: 'reject', from: 'pending', to: 'rejected', label: 'Reject', hooks: ['notifyEmployee'] },
      { key: 'cancel', from: 'draft', to: 'cancelled', label: 'Cancel' },
      { key: 'cancel_pending', from: 'pending', to: 'cancelled', label: 'Cancel', hooks: ['notifyManager'] },
    ],
  },
  validation: {
    entityRules: [
      { ruleId: 'leave.end_after_start', type: 'entity_invariant', paths: ['start_date', 'end_date'], messageKey: 'leave.end_after_start', clientSafe: true, blocking: true, severity: 'error' },
    ],
  },
  policies: {
    view: { scope: 'owner' },
    create: { scope: 'workspace' },
    update: { scope: 'owner' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE
// ─────────────────────────────────────────────────────────────────────────────

const EXPENSE_REPORT_ENTITY: EntityDefinition = {
  key: 'expense_report',
  name: 'Expense Report',
  pluralName: 'Expense Reports',
  fields: [
    {
      key: 'title',
      type: 'string',
      name: 'Title',
      list: { visible: true, sortable: true, searchable: true },
      form: { visible: true, placeholder: 'Q1 2025 — Sales Conference Travel' },
      create: { visible: true, order: 1, placeholder: 'Q1 2025 — Sales Conference Travel' },
      edit: { visible: true, order: 1 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'expense.title.required', type: 'required', field: 'title', messageKey: 'expense.title.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'expense.title.min_length', type: 'min_length', field: 'title', messageKey: 'expense.title.min_length', params: { min: 5 }, clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'category',
      type: 'enum',
      name: 'Category',
      enumValues: ['travel', 'meals', 'software', 'hardware', 'training', 'office_supplies', 'other'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: true },
      create: { visible: true, order: 2 },
      edit: { visible: true, order: 2 },
      display: { type: 'badge', badgeToneMap: { travel: 'info', meals: 'neutral', software: 'info', hardware: 'neutral', training: 'success', office_supplies: 'neutral', other: 'neutral' } },
      validation: {
        fieldRules: [
          { ruleId: 'expense.category.required', type: 'required', field: 'category', messageKey: 'expense.category.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'period',
      type: 'string',
      name: 'Period',
      helpText: 'Reporting period, e.g. 2025-Q1 or 2025-03',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '2025-Q1' },
      create: { visible: true, order: 3, placeholder: '2025-Q1' },
      edit: { visible: true, order: 3 },
      display: { type: 'text' },
      validation: {
        fieldRules: [
          { ruleId: 'expense.period.required', type: 'required', field: 'period', messageKey: 'expense.period.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'currency',
      type: 'enum',
      name: 'Currency',
      enumValues: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
      list: { visible: true },
      form: { visible: true },
      create: { visible: true, order: 4 },
      edit: { visible: true, order: 4 },
      display: { type: 'badge', badgeToneMap: { USD: 'neutral', EUR: 'neutral', GBP: 'neutral', JPY: 'neutral', CAD: 'neutral', AUD: 'neutral' } },
      validation: {
        fieldRules: [
          { ruleId: 'expense.currency.required', type: 'required', field: 'currency', messageKey: 'expense.currency.required', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'total_amount',
      type: 'number',
      name: 'Total Amount',
      list: { visible: true, sortable: true },
      form: { visible: true, placeholder: '0.00' },
      create: { visible: true, order: 5, placeholder: '0.00' },
      edit: { visible: true, order: 5 },
      display: { type: 'currency', currency: 'USD', precision: 2, align: 'right' },
      validation: {
        fieldRules: [
          { ruleId: 'expense.total_amount.required', type: 'required', field: 'total_amount', messageKey: 'expense.total_amount.required', clientSafe: true, blocking: true, severity: 'error' },
          { ruleId: 'expense.total_amount.min', type: 'number_min', field: 'total_amount', messageKey: 'expense.total_amount.min', params: { min: 0.01 }, defaultMessage: 'Amount must be greater than 0', clientSafe: true, blocking: true, severity: 'error' },
        ],
      },
    },
    {
      key: 'reimbursable',
      type: 'boolean',
      name: 'Reimbursable',
      list: { visible: true },
      form: { visible: true },
      create: { visible: true, order: 6 },
      edit: { visible: true, order: 6 },
      display: { type: 'text' },
    },
    {
      key: 'rejection_reason',
      type: 'text',
      name: 'Rejection Reason',
      helpText: 'Added by finance when rejecting the report',
      list: { visible: false },
      form: { visible: true, placeholder: 'Missing receipts for line items over $75' },
      create: { visible: false },
      edit: { visible: true, order: 7 },
      display: { type: 'multiline-text', truncate: true },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'reimbursed'],
      list: { visible: true, sortable: true, filterable: true },
      form: { visible: false },
      create: { visible: false },
      edit: { visible: false },
      display: { type: 'status', statusMap: { draft: 'neutral', submitted: 'info', under_review: 'warning', approved: 'success', rejected: 'danger', reimbursed: 'success' } },
    },
  ],
  relations: [
    { key: 'employee', relation: 'belongs_to', entity: 'employee', foreignKey: 'employee_id', required: true },
    { key: 'line_items', relation: 'has_many', entity: 'expense_line_item', foreignKey: 'expense_report_id' },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'reimbursed'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'submitted', label: 'Submit for Approval', hooks: ['notifyFinance'] },
      { key: 'start_review', from: 'submitted', to: 'under_review', label: 'Start Review' },
      { key: 'approve', from: 'under_review', to: 'approved', label: 'Approve', guards: ['hasAllReceipts'], hooks: ['notifyEmployee', 'triggerPayment'] },
      { key: 'reject', from: 'under_review', to: 'rejected', label: 'Reject', guards: ['hasRejectionReason'], hooks: ['notifyEmployee'] },
      { key: 'reimburse', from: 'approved', to: 'reimbursed', label: 'Mark Reimbursed', hooks: ['updatePayroll'] },
      { key: 'reopen', from: 'rejected', to: 'draft', label: 'Reopen for Editing' },
    ],
  },
  validation: {
    entityRules: [
      { ruleId: 'expense.rejection_reason_required', type: 'entity_invariant', paths: ['status', 'rejection_reason'], messageKey: 'expense.rejection_reason_required', clientSafe: true, blocking: true, severity: 'error' },
    ],
  },
  policies: {
    view: { scope: 'owner' },
    create: { scope: 'workspace' },
    update: { scope: 'owner' },
    delete: { scope: 'role', condition: 'admin:delete' },
  },
  fieldPolicies: {
    rejection_reason: {
      view: { scope: 'workspace' },
      update: { scope: 'role', condition: 'finance:update' },
    },
    total_amount: {
      view: { scope: 'workspace' },
      update: { scope: 'role', condition: 'finance:update' },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scenarios
// ─────────────────────────────────────────────────────────────────────────────

export const API_ENTITY_SCENARIOS: ApiEntityScenario[] = [
  // Documentation
  { label: 'Minimal Entity', description: 'Plain entity with flat string/number/enum fields — the simplest possible entity definition', category: 'docs', entity: DOC_MINIMAL_ENTITY },
  { label: 'Nested Entity', description: 'Entity with object fields grouping related properties into logical sub-objects', category: 'docs', entity: DOC_NESTED_ENTITY },
  { label: 'Belongs To Entity', description: 'Entity with a belongs_to relation pointing to a parent entity', category: 'docs', entity: DOC_BELONGS_TO_ENTITY },
  { label: 'One to Many Entity', description: 'Entity with has_many relations to multiple child entities via foreign keys', category: 'docs', entity: DOC_HAS_MANY_ENTITY },
  { label: 'Many to Many Entity', description: 'Entity linked to another through a join table using many_to_many relation', category: 'docs', entity: DOC_MANY_TO_MANY_ENTITY },
  { label: 'Polymorphic Entity', description: 'Entity with a polymorphic relation using typeField/idField to reference multiple entity types', category: 'docs', entity: DOC_POLYMORPHIC_ENTITY },
  { label: 'Computed Expression', description: 'Computed fields using arithmetic expressions over other field values', category: 'docs', entity: DOC_COMPUTED_EXPRESSION_ENTITY },
  { label: 'Aggregation Expression', description: 'Computed fields using aggregation operations (sum, count) over related entity collections', category: 'docs', entity: DOC_COMPUTED_AGGREGATION_ENTITY },
  { label: 'Condition Expression', description: 'Computed boolean fields using conditional expressions with now() and field comparisons', category: 'docs', entity: DOC_COMPUTED_CONDITION_ENTITY },
  { label: 'Lifecycle Entity', description: 'Full lifecycle with states, transitions, labels, guards, hooks, and events per transition', category: 'docs', entity: DOC_LIFECYCLE_ENTITY },
  { label: 'Validation Entity', description: 'Entity demonstrating required, email, min_length, max_length, regex, min, and max field rules', category: 'docs', entity: DOC_VALIDATION_ENTITY },
  { label: 'Events Entity', description: 'Custom domain event names for CRUD operations and excluded fields from event payloads', category: 'docs', entity: DOC_EVENTS_ENTITY },
  { label: 'Capabilities Entity', description: 'Action buttons on an entity: transition, export, mutation capabilities with confirm dialogs', category: 'docs', entity: DOC_CAPABILITIES_ENTITY },
  { label: 'Policies Entity', description: 'Role-based access control policies for view, create, update, and delete operations', category: 'docs', entity: DOC_POLICIES_ENTITY },
  // CRM
  { label: 'Contact', description: 'Person record with lifecycle from lead to customer, relations to company and deals', category: 'crm', entity: CONTACT_ENTITY },
  { label: 'Company', description: 'Organization/account with industry, tier, computed deal count, and field-level policies', category: 'crm', entity: COMPANY_ENTITY },
  { label: 'Deal', description: 'Sales opportunity with 6-stage lifecycle, value, probability, and lost-reason validation', category: 'crm', entity: DEAL_ENTITY },
  { label: 'Lead', description: 'Inbound prospect with source tracking, lead scoring, and conversion lifecycle', category: 'crm', entity: LEAD_ENTITY },
  // ERP
  { label: 'Product', description: 'Catalog item with SKU regex, margin computed field, and cost-price field policies', category: 'erp', entity: PRODUCT_ENTITY },
  { label: 'Order', description: 'Sales order demonstrating all relation types: belongs_to, has_many, many_to_many via join table, and self (parent order)', category: 'erp', entity: ORDER_ENTITY },
  { label: 'Purchase Order', description: 'Procurement order with approval workflow, line-item aggregation, and supplier relation', category: 'erp', entity: PURCHASE_ORDER_ENTITY },
  { label: 'Supplier', description: 'Vendor record with payment terms, approval lifecycle, and blacklist transition', category: 'erp', entity: SUPPLIER_ENTITY },
  { label: 'Invoice', description: 'Billing document with regex number, tax rate, lifecycle from draft to paid or voided', category: 'erp', entity: INVOICE_ENTITY },
  // Projects
  { label: 'Project', description: 'Project container with code regex, budget, lifecycle, and computed open-task count', category: 'projects', entity: PROJECT_ENTITY },
  { label: 'Task', description: 'Work item with priority, estimation, blocking flag, review lifecycle, and subtask relation', category: 'projects', entity: TASK_ENTITY },
  { label: 'Sprint', description: 'Time-boxed iteration with capacity points, velocity aggregation, and date invariant', category: 'projects', entity: SPRINT_ENTITY },
  { label: 'Time Entry', description: 'Work log with hour min/max rules, billable flag, billable-amount computed field', category: 'projects', entity: TIME_ENTRY_ENTITY },
  // HR
  { label: 'Employee', description: 'Staff record with employee ID regex, department, salary field policy, and termination lifecycle', category: 'hr', entity: EMPLOYEE_ENTITY },
  { label: 'Leave Request', description: 'PTO request with type, future-date rules, days-requested computed field, and approval lifecycle', category: 'hr', entity: LEAVE_REQUEST_ENTITY },
  // Finance
  { label: 'Expense Report', description: 'Reimbursement request with category, period, rejection-reason invariant, and finance field policies', category: 'finance', entity: EXPENSE_REPORT_ENTITY },
];

export const CATEGORY_LABELS: Record<ApiEntityScenario['category'], string> = {
  docs: 'Documentation',
  crm: 'CRM',
  erp: 'ERP',
  projects: 'Project Management',
  hr: 'Human Resources',
  finance: 'Finance',
};
