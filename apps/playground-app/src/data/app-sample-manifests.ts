export interface AppManifestScenario {
  label: string;
  description?: string;
  category: 'docs' | 'crm' | 'erp' | 'projects' | 'hr';
  manifest: object;
}

export const MANIFEST_CATEGORY_LABELS: Record<AppManifestScenario['category'], string> = {
  docs: 'Documentation',
  crm: 'CRM',
  erp: 'ERP',
  projects: 'Project Management',
  hr: 'Human Resources',
};

export const MANIFEST_CATEGORY_ORDER: AppManifestScenario['category'][] = [
  'docs',
  'crm',
  'erp',
  'projects',
  'hr',
];

// ─────────────────────────────────────────────────────────────────────────────
// Documentation
// ─────────────────────────────────────────────────────────────────────────────

const DOC_MINIMAL = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'doc_minimal', name: 'Minimal Cell', version: '1.0.0', description: 'The smallest valid Cell Manifest: one entity, one list page, one detail page, one create page.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'note_list' },
    entities: [
      {
        key: 'note',
        name: 'Note',
        pluralName: 'Notes',
        fields: [
          { key: 'title', name: 'Title', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'Note title' } },
          { key: 'content', name: 'Content', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['draft', 'published', 'archived'], required: true, list: { visible: true }, form: { visible: true } },
        ],
      },
    ],
    pages: [
      { key: 'note_list', type: 'entity-list', title: 'Notes', path: '/notes', entity: 'note' },
      { key: 'note_detail', type: 'entity-detail', title: 'Note', path: '/notes/:id', entity: 'note' },
      { key: 'note_create', type: 'entity-create', title: 'New Note', path: '/notes/new', entity: 'note' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_note_list', pageKey: 'note_list', label: 'All Notes' },
      ],
    },
  },
};

const DOC_ALL_FIELD_TYPES = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'doc_fields', name: 'All Field Types', version: '1.0.0', description: 'One entity that uses every supported field type: string, text, number, boolean, date, datetime, and enum.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'sample_list' },
    entities: [
      {
        key: 'sample',
        name: 'Sample Record',
        pluralName: 'Sample Records',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true, placeholder: 'Record name' } },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'score', name: 'Score', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'is_active', name: 'Active', type: 'boolean', list: { visible: true }, form: { visible: true } },
          { key: 'start_date', name: 'Start Date', type: 'date', list: { visible: true }, form: { visible: true } },
          { key: 'scheduled_at', name: 'Scheduled At', type: 'datetime', list: { visible: false }, form: { visible: true } },
          {
            key: 'category',
            name: 'Category',
            type: 'enum',
            enumValues: ['alpha', 'beta', 'gamma', 'delta'],
            required: true,
            list: { visible: true, filterable: true },
            form: { visible: true },
          },
        ],
      },
    ],
    pages: [
      { key: 'sample_list', type: 'entity-list', title: 'Sample Records', path: '/samples', entity: 'sample' },
      { key: 'sample_detail', type: 'entity-detail', title: 'Record Detail', path: '/samples/:id', entity: 'sample' },
      { key: 'sample_create', type: 'entity-create', title: 'New Record', path: '/samples/new', entity: 'sample' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_samples', pageKey: 'sample_list', label: 'Sample Records' },
      ],
    },
  },
};

const DOC_NAVIGATION_GROUPS = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'doc_nav', name: 'Navigation Groups', version: '1.0.0', description: 'Two entities with navigation grouped under collapsible sidebar sections.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'project',
        name: 'Project',
        pluralName: 'Projects',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['active', 'on_hold', 'completed', 'cancelled'], required: true, list: { visible: true }, form: { visible: true } },
          { key: 'start_date', name: 'Start Date', type: 'date', list: { visible: true }, form: { visible: true } },
        ],
      },
      {
        key: 'task',
        name: 'Task',
        pluralName: 'Tasks',
        fields: [
          { key: 'title', name: 'Title', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'priority', name: 'Priority', type: 'enum', enumValues: ['low', 'medium', 'high', 'critical'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['todo', 'in_progress', 'done'], required: true, list: { visible: true }, form: { visible: true } },
          { key: 'due_date', name: 'Due Date', type: 'date', list: { visible: true }, form: { visible: true } },
        ],
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
      { key: 'project_list', type: 'entity-list', title: 'Projects', path: '/projects', entity: 'project' },
      { key: 'project_detail', type: 'entity-detail', title: 'Project', path: '/projects/:id', entity: 'project' },
      { key: 'project_create', type: 'entity-create', title: 'New Project', path: '/projects/new', entity: 'project' },
      { key: 'task_list', type: 'entity-list', title: 'Tasks', path: '/tasks', entity: 'task' },
      { key: 'task_detail', type: 'entity-detail', title: 'Task', path: '/tasks/:id', entity: 'task' },
      { key: 'task_create', type: 'entity-create', title: 'New Task', path: '/tasks/new', entity: 'task' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        {
          type: 'group', key: 'nav_projects_group', label: 'Projects',
          children: [{ type: 'page', key: 'nav_project_list', pageKey: 'project_list', label: 'All Projects' }],
        },
        {
          type: 'group', key: 'nav_tasks_group', label: 'Tasks',
          children: [{ type: 'page', key: 'nav_task_list', pageKey: 'task_list', label: 'All Tasks' }],
        },
      ],
    },
  },
};

const DOC_LIFECYCLE = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'doc_lifecycle', name: 'Entity Lifecycle', version: '1.0.0', description: 'A task entity with a 4-state lifecycle: todo → in_progress → review → done, with guards and transition events.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'task_list' },
    entities: [
      {
        key: 'task',
        name: 'Task',
        pluralName: 'Tasks',
        fields: [
          { key: 'title', name: 'Title', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['todo', 'in_progress', 'review', 'done'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'assignee', name: 'Assignee', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'due_date', name: 'Due Date', type: 'date', list: { visible: true }, form: { visible: true } },
          { key: 'estimate_hours', name: 'Estimate (h)', type: 'number', form: { visible: true }, list: { visible: false } },
        ],
        lifecycle: {
          field: 'status',
          initial: 'todo',
          states: ['todo', 'in_progress', 'review', 'done'],
          transitions: [
            { key: 'start', from: 'todo', to: 'in_progress', label: 'Start Work', guards: ['assignee != null'] },
            { key: 'submit_review', from: 'in_progress', to: 'review', label: 'Submit for Review' },
            { key: 'request_changes', from: 'review', to: 'in_progress', label: 'Request Changes' },
            { key: 'approve', from: 'review', to: 'done', label: 'Approve', event: 'task.completed' },
            { key: 'reopen', from: 'done', to: 'todo', label: 'Reopen' },
          ],
        },
      },
    ],
    pages: [
      { key: 'task_list', type: 'entity-list', title: 'Tasks', path: '/tasks', entity: 'task' },
      { key: 'task_detail', type: 'entity-detail', title: 'Task Detail', path: '/tasks/:id', entity: 'task' },
      { key: 'task_create', type: 'entity-create', title: 'New Task', path: '/tasks/new', entity: 'task' },
    ],
    navigation: {
      items: [{ type: 'page', key: 'nav_tasks', pageKey: 'task_list', label: 'Tasks' }],
    },
  },
};

const DOC_COMPUTED = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'doc_computed', name: 'Computed Fields', version: '1.0.0', description: 'An invoice entity with expression (total), aggregation (line item count), and conditional (overdue) computed fields.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'invoice_list' },
    entities: [
      {
        key: 'invoice',
        name: 'Invoice',
        pluralName: 'Invoices',
        fields: [
          { key: 'number', name: 'Number', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true, placeholder: 'INV-0001' } },
          { key: 'customer_name', name: 'Customer', type: 'string', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'subtotal', name: 'Subtotal', type: 'number', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'tax_rate', name: 'Tax Rate', type: 'number', form: { visible: true }, list: { visible: false }, helpText: 'Decimal, e.g. 0.2 for 20%' },
          { key: 'due_date', name: 'Due Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['draft', 'sent', 'paid', 'cancelled'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
        ],
        computed: [
          { key: 'total_amount', name: 'Total', type: 'number', formulaType: 'expression', expression: 'subtotal * (1 + tax_rate)' },
          { key: 'overdue', name: 'Overdue', type: 'boolean', formulaType: 'conditional', condition: 'due_date < now() and status != "paid"', then: 'true', else: 'false' },
        ],
        lifecycle: {
          field: 'status',
          initial: 'draft',
          states: ['draft', 'sent', 'paid', 'cancelled'],
          transitions: [
            { key: 'send', from: 'draft', to: 'sent', label: 'Send' },
            { key: 'mark_paid', from: 'sent', to: 'paid', label: 'Mark as Paid' },
            { key: 'cancel', from: ['draft', 'sent'], to: 'cancelled', label: 'Cancel' },
          ],
        },
      },
    ],
    pages: [
      { key: 'invoice_list', type: 'entity-list', title: 'Invoices', path: '/invoices', entity: 'invoice' },
      { key: 'invoice_detail', type: 'entity-detail', title: 'Invoice Detail', path: '/invoices/:id', entity: 'invoice' },
      { key: 'invoice_create', type: 'entity-create', title: 'New Invoice', path: '/invoices/new', entity: 'invoice' },
    ],
    navigation: {
      items: [{ type: 'page', key: 'nav_invoices', pageKey: 'invoice_list', label: 'Invoices' }],
    },
  },
};

const DOC_RELATIONS = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'doc_relations', name: 'Entity Relations', version: '1.0.0', description: 'Customer (has_many orders) and Order (belongs_to customer) — demonstrates belongs_to and has_many relation types.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'customer_list' },
    entities: [
      {
        key: 'customer',
        name: 'Customer',
        pluralName: 'Customers',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'email', name: 'Email', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'name@example.com' } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['active', 'inactive'], required: true, list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'orders', relation: 'has_many', entity: 'order', foreignKey: 'customer_id' },
        ],
      },
      {
        key: 'order',
        name: 'Order',
        pluralName: 'Orders',
        fields: [
          { key: 'reference', name: 'Reference', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true, placeholder: 'ORD-0001' } },
          { key: 'amount', name: 'Amount', type: 'number', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['pending', 'confirmed', 'fulfilled', 'cancelled'], required: true, list: { visible: true }, form: { visible: true } },
          { key: 'order_date', name: 'Order Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'customer_id', relation: 'belongs_to', entity: 'customer', required: true },
        ],
      },
    ],
    pages: [
      { key: 'customer_list', type: 'entity-list', title: 'Customers', path: '/customers', entity: 'customer' },
      { key: 'customer_detail', type: 'entity-detail', title: 'Customer', path: '/customers/:id', entity: 'customer' },
      { key: 'customer_create', type: 'entity-create', title: 'New Customer', path: '/customers/new', entity: 'customer' },
      { key: 'order_list', type: 'entity-list', title: 'Orders', path: '/orders', entity: 'order' },
      { key: 'order_detail', type: 'entity-detail', title: 'Order', path: '/orders/:id', entity: 'order' },
      { key: 'order_create', type: 'entity-create', title: 'New Order', path: '/orders/new', entity: 'order' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_customers', pageKey: 'customer_list', label: 'Customers' },
        { type: 'page', key: 'nav_orders', pageKey: 'order_list', label: 'Orders' },
      ],
    },
  },
};

const DOC_ROLES = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'doc_roles', name: 'Roles & Scopes', version: '1.0.0', description: 'Three roles (admin, editor, viewer) with different scope sets on a single Document entity.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'document_list' },
    entities: [
      {
        key: 'document',
        name: 'Document',
        pluralName: 'Documents',
        fields: [
          { key: 'title', name: 'Title', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'content', name: 'Content', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'category', name: 'Category', type: 'enum', enumValues: ['policy', 'procedure', 'template', 'report'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'author', name: 'Author', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['draft', 'review', 'approved', 'archived'], required: true, list: { visible: true }, form: { visible: true } },
          { key: 'published_at', name: 'Published', type: 'date', list: { visible: true }, form: { visible: true } },
        ],
      },
    ],
    pages: [
      { key: 'document_list', type: 'entity-list', title: 'Documents', path: '/documents', entity: 'document' },
      { key: 'document_detail', type: 'entity-detail', title: 'Document', path: '/documents/:id', entity: 'document' },
      { key: 'document_create', type: 'entity-create', title: 'New Document', path: '/documents/new', entity: 'document' },
    ],
    navigation: {
      items: [{ type: 'page', key: 'nav_documents', pageKey: 'document_list', label: 'Documents' }],
    },
    roles: [
      { key: 'admin', name: 'Administrator', description: 'Full access to all resources', scopes: ['*'] },
      {
        key: 'editor',
        name: 'Editor',
        description: 'Can view, create, and edit documents but not delete',
        scopes: ['document.list', 'document.view', 'document.create', 'document.update'],
      },
      {
        key: 'viewer',
        name: 'Viewer',
        description: 'Read-only access to approved documents',
        scopes: ['document.list', 'document.view'],
      },
    ],
  },
};

const DOC_CAPABILITIES = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'doc_capabilities', name: 'Capabilities', version: '1.0.0', description: 'A ticket entity with capability definitions: transition actions, mutation (reset), and PDF export.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'ticket_list' },
    entities: [
      {
        key: 'ticket',
        name: 'Ticket',
        pluralName: 'Tickets',
        fields: [
          { key: 'subject', name: 'Subject', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'priority', name: 'Priority', type: 'enum', enumValues: ['low', 'medium', 'high', 'critical'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['open', 'in_progress', 'resolved', 'closed'], required: true, list: { visible: true }, form: { visible: true } },
          { key: 'assignee', name: 'Assignee', type: 'string', list: { visible: true }, form: { visible: true } },
        ],
        lifecycle: {
          field: 'status',
          initial: 'open',
          states: ['open', 'in_progress', 'resolved', 'closed'],
          transitions: [
            { key: 'assign', from: 'open', to: 'in_progress', label: 'Assign & Start' },
            { key: 'resolve', from: 'in_progress', to: 'resolved', label: 'Resolve', event: 'ticket.resolved' },
            { key: 'close', from: 'resolved', to: 'closed', label: 'Close' },
            { key: 'reopen', from: ['resolved', 'closed'], to: 'open', label: 'Reopen' },
          ],
        },
        capabilities: [
          { key: 'assign', type: 'transition', transition: 'assign', description: 'Assign ticket to a team member' },
          { key: 'resolve', type: 'transition', transition: 'resolve', description: 'Mark ticket as resolved', confirm: true },
          { key: 'export_pdf', type: 'export', format: 'pdf', description: 'Export ticket as PDF' },
          { key: 'reset', type: 'mutation', updates: { status: 'open', assignee: null }, description: 'Reset ticket to open', confirm: true },
        ],
      },
    ],
    pages: [
      { key: 'ticket_list', type: 'entity-list', title: 'Tickets', path: '/tickets', entity: 'ticket' },
      { key: 'ticket_detail', type: 'entity-detail', title: 'Ticket Detail', path: '/tickets/:id', entity: 'ticket' },
      { key: 'ticket_create', type: 'entity-create', title: 'New Ticket', path: '/tickets/new', entity: 'ticket' },
    ],
    navigation: {
      items: [{ type: 'page', key: 'nav_tickets', pageKey: 'ticket_list', label: 'Tickets' }],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CRM
// ─────────────────────────────────────────────────────────────────────────────

const CRM_CONTACTS = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'crm_contacts', name: 'Contact Manager', version: '1.0.0', description: 'Full CRM contact manager: Contacts with company relation and lead→customer lifecycle, Companies, and Activity log.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'company',
        name: 'Company',
        pluralName: 'Companies',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'domain', name: 'Domain', type: 'string', list: { visible: true }, form: { visible: true, placeholder: 'acme.com' } },
          { key: 'industry', name: 'Industry', type: 'enum', enumValues: ['technology', 'finance', 'healthcare', 'manufacturing', 'retail', 'other'], list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'employee_count', name: 'Employees', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'website', name: 'Website', type: 'string', form: { visible: true }, list: { visible: false } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['prospect', 'customer', 'partner', 'churned'], required: true, list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'contacts', relation: 'has_many', entity: 'contact', foreignKey: 'company_id' },
        ],
      },
      {
        key: 'contact',
        name: 'Contact',
        pluralName: 'Contacts',
        fields: [
          { key: 'first_name', name: 'First Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'last_name', name: 'Last Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'email', name: 'Email', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'name@example.com' } },
          { key: 'phone', name: 'Phone', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'job_title', name: 'Job Title', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['lead', 'qualified', 'customer', 'inactive'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'notes', name: 'Notes', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
        relations: [
          { key: 'company_id', relation: 'belongs_to', entity: 'company', required: false },
        ],
        lifecycle: {
          field: 'status',
          initial: 'lead',
          states: ['lead', 'qualified', 'customer', 'inactive'],
          transitions: [
            { key: 'qualify', from: 'lead', to: 'qualified', label: 'Qualify', event: 'contact.qualified' },
            { key: 'convert', from: 'qualified', to: 'customer', label: 'Convert to Customer', event: 'contact.converted' },
            { key: 'deactivate', from: ['lead', 'qualified', 'customer'], to: 'inactive', label: 'Deactivate' },
            { key: 'reactivate', from: 'inactive', to: 'lead', label: 'Reactivate' },
          ],
        },
      },
      {
        key: 'activity',
        name: 'Activity',
        pluralName: 'Activities',
        fields: [
          { key: 'subject', name: 'Subject', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'type', name: 'Type', type: 'enum', enumValues: ['call', 'email', 'meeting', 'note', 'task'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['planned', 'completed', 'cancelled'], required: true, list: { visible: true }, form: { visible: true } },
          { key: 'activity_date', name: 'Date', type: 'datetime', list: { visible: true }, form: { visible: true } },
          { key: 'notes', name: 'Notes', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
      { key: 'company_list', type: 'entity-list', title: 'Companies', path: '/companies', entity: 'company' },
      { key: 'company_detail', type: 'entity-detail', title: 'Company', path: '/companies/:id', entity: 'company' },
      { key: 'company_create', type: 'entity-create', title: 'New Company', path: '/companies/new', entity: 'company' },
      { key: 'contact_list', type: 'entity-list', title: 'Contacts', path: '/contacts', entity: 'contact' },
      { key: 'contact_detail', type: 'entity-detail', title: 'Contact', path: '/contacts/:id', entity: 'contact' },
      { key: 'contact_create', type: 'entity-create', title: 'New Contact', path: '/contacts/new', entity: 'contact' },
      { key: 'activity_list', type: 'entity-list', title: 'Activities', path: '/activities', entity: 'activity' },
      { key: 'activity_detail', type: 'entity-detail', title: 'Activity', path: '/activities/:id', entity: 'activity' },
      { key: 'activity_create', type: 'entity-create', title: 'New Activity', path: '/activities/new', entity: 'activity' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'group', key: 'nav_crm', label: 'CRM', children: [
          { type: 'page', key: 'nav_contacts', pageKey: 'contact_list', label: 'Contacts' },
          { type: 'page', key: 'nav_companies', pageKey: 'company_list', label: 'Companies' },
          { type: 'page', key: 'nav_activities', pageKey: 'activity_list', label: 'Activities' },
        ]},
      ],
    },
    roles: [
      { key: 'sales_rep', name: 'Sales Rep', scopes: ['contact.*', 'company.*', 'activity.*'] },
      { key: 'viewer', name: 'Viewer', scopes: ['contact.list', 'contact.view', 'company.list', 'company.view', 'activity.list', 'activity.view'] },
    ],
  },
};

const CRM_SALES_PIPELINE = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'crm_pipeline', name: 'Sales Pipeline', version: '1.0.0', description: 'Sales pipeline with Leads qualifying into Opportunities through stages: prospect → qualified → proposal → negotiation → closed.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'lead',
        name: 'Lead',
        pluralName: 'Leads',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'email', name: 'Email', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'name@company.com' } },
          { key: 'company', name: 'Company', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'source', name: 'Source', type: 'enum', enumValues: ['website', 'referral', 'event', 'cold_outreach', 'social', 'partner'], list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['new', 'contacted', 'qualified', 'unqualified'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'score', name: 'Lead Score', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'notes', name: 'Notes', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
        lifecycle: {
          field: 'status',
          initial: 'new',
          states: ['new', 'contacted', 'qualified', 'unqualified'],
          transitions: [
            { key: 'contact', from: 'new', to: 'contacted', label: 'Mark Contacted' },
            { key: 'qualify', from: 'contacted', to: 'qualified', label: 'Qualify', event: 'lead.qualified' },
            { key: 'disqualify', from: ['new', 'contacted'], to: 'unqualified', label: 'Disqualify' },
          ],
        },
      },
      {
        key: 'opportunity',
        name: 'Opportunity',
        pluralName: 'Opportunities',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'account_name', name: 'Account', type: 'string', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'stage', name: 'Stage', type: 'enum', enumValues: ['prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'amount', name: 'Value', type: 'number', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'close_date', name: 'Expected Close', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'probability', name: 'Probability %', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'owner', name: 'Owner', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
        lifecycle: {
          field: 'stage',
          initial: 'prospect',
          states: ['prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
          transitions: [
            { key: 'advance_to_qualified', from: 'prospect', to: 'qualified', label: 'Qualify' },
            { key: 'advance_to_proposal', from: 'qualified', to: 'proposal', label: 'Send Proposal' },
            { key: 'advance_to_negotiation', from: 'proposal', to: 'negotiation', label: 'Enter Negotiation' },
            { key: 'close_won', from: 'negotiation', to: 'closed_won', label: 'Close Won', event: 'opportunity.won' },
            { key: 'close_lost', from: ['prospect', 'qualified', 'proposal', 'negotiation'], to: 'closed_lost', label: 'Close Lost', event: 'opportunity.lost' },
          ],
        },
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Pipeline Dashboard', path: '/dashboard' },
      { key: 'lead_list', type: 'entity-list', title: 'Leads', path: '/leads', entity: 'lead' },
      { key: 'lead_detail', type: 'entity-detail', title: 'Lead', path: '/leads/:id', entity: 'lead' },
      { key: 'lead_create', type: 'entity-create', title: 'New Lead', path: '/leads/new', entity: 'lead' },
      { key: 'opportunity_list', type: 'entity-list', title: 'Opportunities', path: '/opportunities', entity: 'opportunity' },
      { key: 'opportunity_detail', type: 'entity-detail', title: 'Opportunity', path: '/opportunities/:id', entity: 'opportunity' },
      { key: 'opportunity_create', type: 'entity-create', title: 'New Opportunity', path: '/opportunities/new', entity: 'opportunity' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'page', key: 'nav_leads', pageKey: 'lead_list', label: 'Leads' },
        { type: 'page', key: 'nav_opportunities', pageKey: 'opportunity_list', label: 'Opportunities' },
      ],
    },
  },
};

const CRM_SUPPORT = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'crm_support', name: 'Customer Support', version: '1.0.0', description: 'Support desk with Customers and Tickets. Tickets have a full resolution lifecycle and priority classification.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'customer',
        name: 'Customer',
        pluralName: 'Customers',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'email', name: 'Email', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'name@company.com' } },
          { key: 'plan', name: 'Plan', type: 'enum', enumValues: ['free', 'starter', 'pro', 'enterprise'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'contract_start', name: 'Contract Start', type: 'date', list: { visible: false }, form: { visible: true } },
        ],
        relations: [
          { key: 'tickets', relation: 'has_many', entity: 'ticket', foreignKey: 'customer_id' },
        ],
      },
      {
        key: 'ticket',
        name: 'Ticket',
        pluralName: 'Tickets',
        fields: [
          { key: 'subject', name: 'Subject', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'description', name: 'Description', type: 'text', required: true, form: { visible: true }, list: { visible: false } },
          { key: 'priority', name: 'Priority', type: 'enum', enumValues: ['low', 'medium', 'high', 'critical'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'category', name: 'Category', type: 'enum', enumValues: ['billing', 'technical', 'feature_request', 'bug', 'account'], list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['open', 'in_progress', 'on_hold', 'resolved', 'closed'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'assignee', name: 'Assignee', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'sla_deadline', name: 'SLA Deadline', type: 'datetime', list: { visible: true }, form: { visible: true } },
          { key: 'resolution_notes', name: 'Resolution Notes', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
        relations: [
          { key: 'customer_id', relation: 'belongs_to', entity: 'customer', required: true },
        ],
        lifecycle: {
          field: 'status',
          initial: 'open',
          states: ['open', 'in_progress', 'on_hold', 'resolved', 'closed'],
          transitions: [
            { key: 'assign', from: 'open', to: 'in_progress', label: 'Assign' },
            { key: 'hold', from: 'in_progress', to: 'on_hold', label: 'Put on Hold' },
            { key: 'resume', from: 'on_hold', to: 'in_progress', label: 'Resume' },
            { key: 'resolve', from: ['in_progress', 'on_hold'], to: 'resolved', label: 'Resolve', guards: ['resolution_notes != null'], event: 'ticket.resolved' },
            { key: 'close', from: 'resolved', to: 'closed', label: 'Close' },
            { key: 'reopen', from: ['resolved', 'closed'], to: 'open', label: 'Reopen' },
          ],
        },
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Support Dashboard', path: '/dashboard' },
      { key: 'ticket_list', type: 'entity-list', title: 'Tickets', path: '/tickets', entity: 'ticket' },
      { key: 'ticket_detail', type: 'entity-detail', title: 'Ticket', path: '/tickets/:id', entity: 'ticket' },
      { key: 'ticket_create', type: 'entity-create', title: 'New Ticket', path: '/tickets/new', entity: 'ticket' },
      { key: 'customer_list', type: 'entity-list', title: 'Customers', path: '/customers', entity: 'customer' },
      { key: 'customer_detail', type: 'entity-detail', title: 'Customer', path: '/customers/:id', entity: 'customer' },
      { key: 'customer_create', type: 'entity-create', title: 'New Customer', path: '/customers/new', entity: 'customer' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'page', key: 'nav_tickets', pageKey: 'ticket_list', label: 'Tickets' },
        { type: 'page', key: 'nav_customers', pageKey: 'customer_list', label: 'Customers' },
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ERP
// ─────────────────────────────────────────────────────────────────────────────

const ERP_PROCUREMENT = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'erp_procurement', name: 'Procurement', version: '1.0.0', description: 'Procurement module: Suppliers and Purchase Orders with a full approval lifecycle from draft to completed.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'supplier',
        name: 'Supplier',
        pluralName: 'Suppliers',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'code', name: 'Code', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'SUP-001' } },
          { key: 'category', name: 'Category', type: 'enum', enumValues: ['goods', 'services', 'it', 'facilities', 'logistics'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'contact_email', name: 'Contact Email', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'payment_terms', name: 'Payment Terms (days)', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['active', 'inactive', 'blacklisted'], required: true, list: { visible: true }, form: { visible: true } },
          { key: 'rating', name: 'Rating', type: 'enum', enumValues: ['preferred', 'approved', 'restricted'], list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'purchase_orders', relation: 'has_many', entity: 'purchase_order', foreignKey: 'supplier_id' },
        ],
      },
      {
        key: 'purchase_order',
        name: 'Purchase Order',
        pluralName: 'Purchase Orders',
        fields: [
          { key: 'po_number', name: 'PO Number', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true, placeholder: 'PO-2024-001' } },
          { key: 'description', name: 'Description', type: 'text', required: true, form: { visible: true }, list: { visible: false } },
          { key: 'total_amount', name: 'Total Amount', type: 'number', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'currency', name: 'Currency', type: 'enum', enumValues: ['USD', 'EUR', 'GBP', 'JPY'], required: true, list: { visible: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['draft', 'submitted', 'approved', 'rejected', 'received', 'completed'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'required_by', name: 'Required By', type: 'date', list: { visible: true }, form: { visible: true } },
          { key: 'approved_by', name: 'Approved By', type: 'string', list: { visible: false }, form: { visible: true } },
          { key: 'rejection_reason', name: 'Rejection Reason', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
        relations: [
          { key: 'supplier_id', relation: 'belongs_to', entity: 'supplier', required: true },
        ],
        lifecycle: {
          field: 'status',
          initial: 'draft',
          states: ['draft', 'submitted', 'approved', 'rejected', 'received', 'completed'],
          transitions: [
            { key: 'submit', from: 'draft', to: 'submitted', label: 'Submit for Approval', guards: ['total_amount > 0'] },
            { key: 'approve', from: 'submitted', to: 'approved', label: 'Approve', event: 'purchase_order.approved' },
            { key: 'reject', from: 'submitted', to: 'rejected', label: 'Reject', event: 'purchase_order.rejected' },
            { key: 'redraft', from: 'rejected', to: 'draft', label: 'Revise & Redraft' },
            { key: 'receive', from: 'approved', to: 'received', label: 'Mark Received' },
            { key: 'complete', from: 'received', to: 'completed', label: 'Complete', event: 'purchase_order.completed' },
          ],
        },
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Procurement Dashboard', path: '/dashboard' },
      { key: 'po_list', type: 'entity-list', title: 'Purchase Orders', path: '/purchase-orders', entity: 'purchase_order' },
      { key: 'po_detail', type: 'entity-detail', title: 'Purchase Order', path: '/purchase-orders/:id', entity: 'purchase_order' },
      { key: 'po_create', type: 'entity-create', title: 'New Purchase Order', path: '/purchase-orders/new', entity: 'purchase_order' },
      { key: 'supplier_list', type: 'entity-list', title: 'Suppliers', path: '/suppliers', entity: 'supplier' },
      { key: 'supplier_detail', type: 'entity-detail', title: 'Supplier', path: '/suppliers/:id', entity: 'supplier' },
      { key: 'supplier_create', type: 'entity-create', title: 'New Supplier', path: '/suppliers/new', entity: 'supplier' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'group', key: 'nav_procurement', label: 'Procurement', children: [
          { type: 'page', key: 'nav_pos', pageKey: 'po_list', label: 'Purchase Orders' },
          { type: 'page', key: 'nav_suppliers', pageKey: 'supplier_list', label: 'Suppliers' },
        ]},
      ],
    },
  },
};

const ERP_INVENTORY = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'erp_inventory', name: 'Inventory', version: '1.0.0', description: 'Product catalog with categories and real-time stock tracking. Includes a computed margin expression field.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'category',
        name: 'Category',
        pluralName: 'Categories',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'code', name: 'Code', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'CAT-001' } },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'is_active', name: 'Active', type: 'boolean', list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'products', relation: 'has_many', entity: 'product', foreignKey: 'category_id' },
        ],
      },
      {
        key: 'product',
        name: 'Product',
        pluralName: 'Products',
        fields: [
          { key: 'sku', name: 'SKU', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true, placeholder: 'SKU-0001' } },
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'cost_price', name: 'Cost Price', type: 'number', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'sell_price', name: 'Sell Price', type: 'number', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'stock_qty', name: 'Stock Qty', type: 'number', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'reorder_point', name: 'Reorder Point', type: 'number', list: { visible: false }, form: { visible: true } },
          { key: 'unit', name: 'Unit', type: 'enum', enumValues: ['each', 'kg', 'litre', 'm', 'box', 'pack'], list: { visible: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['active', 'discontinued', 'draft'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'category_id', relation: 'belongs_to', entity: 'category', required: true },
        ],
        computed: [
          {
            key: 'margin_pct',
            name: 'Margin %',
            type: 'number',
            formulaType: 'expression',
            expression: '((sell_price - cost_price) / sell_price) * 100',
          },
          {
            key: 'low_stock',
            name: 'Low Stock',
            type: 'boolean',
            formulaType: 'conditional',
            condition: 'stock_qty <= reorder_point',
            then: 'true',
            else: 'false',
          },
        ],
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Inventory Dashboard', path: '/dashboard' },
      { key: 'product_list', type: 'entity-list', title: 'Products', path: '/products', entity: 'product' },
      { key: 'product_detail', type: 'entity-detail', title: 'Product', path: '/products/:id', entity: 'product' },
      { key: 'product_create', type: 'entity-create', title: 'New Product', path: '/products/new', entity: 'product' },
      { key: 'category_list', type: 'entity-list', title: 'Categories', path: '/categories', entity: 'category' },
      { key: 'category_detail', type: 'entity-detail', title: 'Category', path: '/categories/:id', entity: 'category' },
      { key: 'category_create', type: 'entity-create', title: 'New Category', path: '/categories/new', entity: 'category' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'group', key: 'nav_catalog', label: 'Catalog', children: [
          { type: 'page', key: 'nav_products', pageKey: 'product_list', label: 'Products' },
          { type: 'page', key: 'nav_categories', pageKey: 'category_list', label: 'Categories' },
        ]},
      ],
    },
  },
};

const ERP_BILLING = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'erp_billing', name: 'Finance & Billing', version: '1.0.0', description: 'Billing module: Customers and Invoices with draft→sent→paid lifecycle, due dates, and an overdue computed field.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'customer',
        name: 'Customer',
        pluralName: 'Customers',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'email', name: 'Billing Email', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'billing@company.com' } },
          { key: 'vat_number', name: 'VAT Number', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'payment_terms', name: 'Payment Terms (days)', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'currency', name: 'Currency', type: 'enum', enumValues: ['USD', 'EUR', 'GBP', 'JPY', 'CAD'], required: true, list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'invoices', relation: 'has_many', entity: 'invoice', foreignKey: 'customer_id' },
        ],
        computed: [
          { key: 'outstanding_balance', name: 'Outstanding Balance', type: 'number', formulaType: 'aggregation', relation: 'invoices', operation: 'sum', field: 'total_amount', filter: 'status != "paid"' },
          { key: 'invoice_count', name: 'Invoice Count', type: 'number', formulaType: 'aggregation', relation: 'invoices', operation: 'count' },
        ],
      },
      {
        key: 'invoice',
        name: 'Invoice',
        pluralName: 'Invoices',
        fields: [
          { key: 'number', name: 'Invoice #', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true, placeholder: 'INV-2024-001' } },
          { key: 'subtotal', name: 'Subtotal', type: 'number', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'tax_rate', name: 'Tax Rate', type: 'number', form: { visible: true }, list: { visible: false }, helpText: 'Decimal e.g. 0.20 for 20%' },
          { key: 'due_date', name: 'Due Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['draft', 'sent', 'paid', 'cancelled'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'paid_at', name: 'Paid At', type: 'date', list: { visible: false }, form: { visible: true } },
          { key: 'notes', name: 'Notes', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
        relations: [
          { key: 'customer_id', relation: 'belongs_to', entity: 'customer', required: true },
        ],
        computed: [
          { key: 'total_amount', name: 'Total', type: 'number', formulaType: 'expression', expression: 'subtotal * (1 + tax_rate)' },
          { key: 'overdue', name: 'Overdue', type: 'boolean', formulaType: 'conditional', condition: 'due_date < now() and status == "sent"', then: 'true', else: 'false' },
        ],
        lifecycle: {
          field: 'status',
          initial: 'draft',
          states: ['draft', 'sent', 'paid', 'cancelled'],
          transitions: [
            { key: 'send', from: 'draft', to: 'sent', label: 'Send to Customer', event: 'invoice.sent' },
            { key: 'mark_paid', from: 'sent', to: 'paid', label: 'Mark as Paid', event: 'invoice.paid' },
            { key: 'cancel', from: ['draft', 'sent'], to: 'cancelled', label: 'Cancel' },
          ],
        },
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Finance Dashboard', path: '/dashboard' },
      { key: 'invoice_list', type: 'entity-list', title: 'Invoices', path: '/invoices', entity: 'invoice' },
      { key: 'invoice_detail', type: 'entity-detail', title: 'Invoice', path: '/invoices/:id', entity: 'invoice' },
      { key: 'invoice_create', type: 'entity-create', title: 'New Invoice', path: '/invoices/new', entity: 'invoice' },
      { key: 'customer_list', type: 'entity-list', title: 'Customers', path: '/customers', entity: 'customer' },
      { key: 'customer_detail', type: 'entity-detail', title: 'Customer', path: '/customers/:id', entity: 'customer' },
      { key: 'customer_create', type: 'entity-create', title: 'New Customer', path: '/customers/new', entity: 'customer' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'page', key: 'nav_invoices', pageKey: 'invoice_list', label: 'Invoices' },
        { type: 'page', key: 'nav_customers', pageKey: 'customer_list', label: 'Customers' },
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Project Management
// ─────────────────────────────────────────────────────────────────────────────

const PROJ_TASK_TRACKER = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'proj_tasks', name: 'Task Tracker', version: '1.0.0', description: 'Project management tool: Projects contain Sprints and Tasks. Tasks have a full development lifecycle with review step.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'project',
        name: 'Project',
        pluralName: 'Projects',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'key', name: 'Key', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'PROJ' }, helpText: 'Short uppercase identifier, e.g. PROJ' },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['planning', 'active', 'on_hold', 'completed', 'cancelled'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'start_date', name: 'Start Date', type: 'date', list: { visible: true }, form: { visible: true } },
          { key: 'target_date', name: 'Target Date', type: 'date', list: { visible: true }, form: { visible: true } },
          { key: 'owner', name: 'Owner', type: 'string', list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'sprints', relation: 'has_many', entity: 'sprint', foreignKey: 'project_id' },
          { key: 'tasks', relation: 'has_many', entity: 'task', foreignKey: 'project_id' },
        ],
      },
      {
        key: 'sprint',
        name: 'Sprint',
        pluralName: 'Sprints',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true, placeholder: 'Sprint 1' } },
          { key: 'goal', name: 'Goal', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['planned', 'active', 'completed'], required: true, list: { visible: true }, form: { visible: true } },
          { key: 'start_date', name: 'Start Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'end_date', name: 'End Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'capacity_points', name: 'Capacity (pts)', type: 'number', list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'project_id', relation: 'belongs_to', entity: 'project', required: true },
          { key: 'tasks', relation: 'has_many', entity: 'task', foreignKey: 'sprint_id' },
        ],
      },
      {
        key: 'task',
        name: 'Task',
        pluralName: 'Tasks',
        fields: [
          { key: 'title', name: 'Title', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'type', name: 'Type', type: 'enum', enumValues: ['feature', 'bug', 'chore', 'spike'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'priority', name: 'Priority', type: 'enum', enumValues: ['low', 'medium', 'high', 'critical'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['todo', 'in_progress', 'review', 'done'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'assignee', name: 'Assignee', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'story_points', name: 'Story Points', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'due_date', name: 'Due Date', type: 'date', list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'project_id', relation: 'belongs_to', entity: 'project', required: true },
          { key: 'sprint_id', relation: 'belongs_to', entity: 'sprint', required: false },
        ],
        lifecycle: {
          field: 'status',
          initial: 'todo',
          states: ['todo', 'in_progress', 'review', 'done'],
          transitions: [
            { key: 'start', from: 'todo', to: 'in_progress', label: 'Start', guards: ['assignee != null'] },
            { key: 'submit_review', from: 'in_progress', to: 'review', label: 'Submit for Review' },
            { key: 'request_changes', from: 'review', to: 'in_progress', label: 'Request Changes' },
            { key: 'approve', from: 'review', to: 'done', label: 'Approve & Close', event: 'task.completed' },
            { key: 'reopen', from: 'done', to: 'todo', label: 'Reopen' },
          ],
        },
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
      { key: 'project_list', type: 'entity-list', title: 'Projects', path: '/projects', entity: 'project' },
      { key: 'project_detail', type: 'entity-detail', title: 'Project', path: '/projects/:id', entity: 'project' },
      { key: 'project_create', type: 'entity-create', title: 'New Project', path: '/projects/new', entity: 'project' },
      { key: 'sprint_list', type: 'entity-list', title: 'Sprints', path: '/sprints', entity: 'sprint' },
      { key: 'sprint_detail', type: 'entity-detail', title: 'Sprint', path: '/sprints/:id', entity: 'sprint' },
      { key: 'sprint_create', type: 'entity-create', title: 'New Sprint', path: '/sprints/new', entity: 'sprint' },
      { key: 'task_list', type: 'entity-list', title: 'Tasks', path: '/tasks', entity: 'task' },
      { key: 'task_detail', type: 'entity-detail', title: 'Task', path: '/tasks/:id', entity: 'task' },
      { key: 'task_create', type: 'entity-create', title: 'New Task', path: '/tasks/new', entity: 'task' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'group', key: 'nav_planning', label: 'Planning', children: [
          { type: 'page', key: 'nav_projects', pageKey: 'project_list', label: 'Projects' },
          { type: 'page', key: 'nav_sprints', pageKey: 'sprint_list', label: 'Sprints' },
        ]},
        { type: 'page', key: 'nav_tasks', pageKey: 'task_list', label: 'Tasks' },
      ],
    },
  },
};

const PROJ_BUG_TRACKER = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'proj_bugs', name: 'Bug Tracker', version: '1.0.0', description: 'Issue tracker for software teams. Issues are typed (bug/feature/improvement) with severity and a triage→resolve lifecycle.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'issue_list' },
    entities: [
      {
        key: 'issue',
        name: 'Issue',
        pluralName: 'Issues',
        fields: [
          { key: 'title', name: 'Title', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'description', name: 'Description', type: 'text', required: true, form: { visible: true }, list: { visible: false } },
          { key: 'type', name: 'Type', type: 'enum', enumValues: ['bug', 'feature', 'improvement', 'question', 'task'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'severity', name: 'Severity', type: 'enum', enumValues: ['critical', 'high', 'medium', 'low'], list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['open', 'triaged', 'in_progress', 'resolved', 'closed', 'wont_fix'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'component', name: 'Component', type: 'string', list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'assignee', name: 'Assignee', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'reporter', name: 'Reporter', type: 'string', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'version_found', name: 'Version Found', type: 'string', list: { visible: false }, form: { visible: true } },
          { key: 'version_fixed', name: 'Version Fixed', type: 'string', list: { visible: false }, form: { visible: true } },
          { key: 'steps_to_reproduce', name: 'Steps to Reproduce', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
        lifecycle: {
          field: 'status',
          initial: 'open',
          states: ['open', 'triaged', 'in_progress', 'resolved', 'closed', 'wont_fix'],
          transitions: [
            { key: 'triage', from: 'open', to: 'triaged', label: 'Triage' },
            { key: 'assign', from: 'triaged', to: 'in_progress', label: 'Assign', guards: ['assignee != null'] },
            { key: 'resolve', from: 'in_progress', to: 'resolved', label: 'Resolve', event: 'issue.resolved' },
            { key: 'close', from: 'resolved', to: 'closed', label: 'Close' },
            { key: 'wont_fix', from: ['open', 'triaged'], to: 'wont_fix', label: "Won't Fix" },
            { key: 'reopen', from: ['resolved', 'closed'], to: 'open', label: 'Reopen', event: 'issue.reopened' },
          ],
        },
      },
    ],
    pages: [
      { key: 'issue_list', type: 'entity-list', title: 'Issues', path: '/issues', entity: 'issue' },
      { key: 'issue_detail', type: 'entity-detail', title: 'Issue', path: '/issues/:id', entity: 'issue' },
      { key: 'issue_create', type: 'entity-create', title: 'New Issue', path: '/issues/new', entity: 'issue' },
    ],
    navigation: {
      items: [{ type: 'page', key: 'nav_issues', pageKey: 'issue_list', label: 'Issues' }],
    },
  },
};

const PROJ_RESOURCE_PLANNING = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'proj_resources', name: 'Resource Planning', version: '1.0.0', description: 'Resource planning: Teams, Projects, and Assignments (with allocated hours and role). Shows cross-entity linking.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'team',
        name: 'Team',
        pluralName: 'Teams',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'department', name: 'Department', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'capacity_hours', name: 'Capacity (hrs/wk)', type: 'number', list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'assignments', relation: 'has_many', entity: 'assignment', foreignKey: 'team_id' },
        ],
      },
      {
        key: 'resource_project',
        name: 'Project',
        pluralName: 'Projects',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'code', name: 'Code', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'PROJ-001' } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['active', 'planned', 'completed', 'cancelled'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'start_date', name: 'Start Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'end_date', name: 'End Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'budget_hours', name: 'Budget (hrs)', type: 'number', list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'assignments', relation: 'has_many', entity: 'assignment', foreignKey: 'project_id' },
        ],
      },
      {
        key: 'assignment',
        name: 'Assignment',
        pluralName: 'Assignments',
        fields: [
          { key: 'role', name: 'Role', type: 'enum', enumValues: ['lead', 'developer', 'designer', 'analyst', 'tester', 'support'], required: true, list: { visible: true }, form: { visible: true } },
          { key: 'allocated_hours', name: 'Allocated (hrs/wk)', type: 'number', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'start_date', name: 'Start Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'end_date', name: 'End Date', type: 'date', list: { visible: true }, form: { visible: true } },
          { key: 'notes', name: 'Notes', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
        relations: [
          { key: 'team_id', relation: 'belongs_to', entity: 'team', required: true },
          { key: 'project_id', relation: 'belongs_to', entity: 'resource_project', required: true },
        ],
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Resource Dashboard', path: '/dashboard' },
      { key: 'team_list', type: 'entity-list', title: 'Teams', path: '/teams', entity: 'team' },
      { key: 'team_detail', type: 'entity-detail', title: 'Team', path: '/teams/:id', entity: 'team' },
      { key: 'team_create', type: 'entity-create', title: 'New Team', path: '/teams/new', entity: 'team' },
      { key: 'project_list', type: 'entity-list', title: 'Projects', path: '/projects', entity: 'resource_project' },
      { key: 'project_detail', type: 'entity-detail', title: 'Project', path: '/projects/:id', entity: 'resource_project' },
      { key: 'project_create', type: 'entity-create', title: 'New Project', path: '/projects/new', entity: 'resource_project' },
      { key: 'assignment_list', type: 'entity-list', title: 'Assignments', path: '/assignments', entity: 'assignment' },
      { key: 'assignment_detail', type: 'entity-detail', title: 'Assignment', path: '/assignments/:id', entity: 'assignment' },
      { key: 'assignment_create', type: 'entity-create', title: 'New Assignment', path: '/assignments/new', entity: 'assignment' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'page', key: 'nav_teams', pageKey: 'team_list', label: 'Teams' },
        { type: 'page', key: 'nav_projects', pageKey: 'project_list', label: 'Projects' },
        { type: 'page', key: 'nav_assignments', pageKey: 'assignment_list', label: 'Assignments' },
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Human Resources
// ─────────────────────────────────────────────────────────────────────────────

const HR_EMPLOYEE_DIRECTORY = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'hr_employees', name: 'Employee Directory', version: '1.0.0', description: 'HR directory: Departments and Employees with position, hire date, salary (sensitive), and an employment status lifecycle.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'department',
        name: 'Department',
        pluralName: 'Departments',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'code', name: 'Code', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'DEPT-001' } },
          { key: 'manager_name', name: 'Manager', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'location', name: 'Location', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'budget', name: 'Budget', type: 'number', sensitive: 'pii', list: { visible: false }, form: { visible: true } },
        ],
        relations: [
          { key: 'employees', relation: 'has_many', entity: 'employee', foreignKey: 'department_id' },
        ],
      },
      {
        key: 'employee',
        name: 'Employee',
        pluralName: 'Employees',
        fields: [
          { key: 'employee_id', name: 'Employee ID', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true, placeholder: 'EMP-0001' } },
          { key: 'first_name', name: 'First Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'last_name', name: 'Last Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'email', name: 'Work Email', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'firstname.lastname@company.com' } },
          { key: 'position', name: 'Position', type: 'string', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'employment_type', name: 'Type', type: 'enum', enumValues: ['full_time', 'part_time', 'contractor', 'intern'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'hire_date', name: 'Hire Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['active', 'on_leave', 'terminated'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'salary', name: 'Salary', type: 'number', sensitive: 'pii', list: { visible: false }, form: { visible: true } },
          { key: 'phone', name: 'Phone', type: 'string', list: { visible: false }, form: { visible: true } },
        ],
        relations: [
          { key: 'department_id', relation: 'belongs_to', entity: 'department', required: true },
        ],
        lifecycle: {
          field: 'status',
          initial: 'active',
          states: ['active', 'on_leave', 'terminated'],
          transitions: [
            { key: 'go_on_leave', from: 'active', to: 'on_leave', label: 'Place on Leave' },
            { key: 'return_from_leave', from: 'on_leave', to: 'active', label: 'Return from Leave' },
            { key: 'terminate', from: ['active', 'on_leave'], to: 'terminated', label: 'Terminate', event: 'employee.terminated' },
          ],
        },
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'HR Dashboard', path: '/dashboard' },
      { key: 'employee_list', type: 'entity-list', title: 'Employees', path: '/employees', entity: 'employee' },
      { key: 'employee_detail', type: 'entity-detail', title: 'Employee', path: '/employees/:id', entity: 'employee' },
      { key: 'employee_create', type: 'entity-create', title: 'New Employee', path: '/employees/new', entity: 'employee' },
      { key: 'department_list', type: 'entity-list', title: 'Departments', path: '/departments', entity: 'department' },
      { key: 'department_detail', type: 'entity-detail', title: 'Department', path: '/departments/:id', entity: 'department' },
      { key: 'department_create', type: 'entity-create', title: 'New Department', path: '/departments/new', entity: 'department' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'page', key: 'nav_employees', pageKey: 'employee_list', label: 'Employees' },
        { type: 'page', key: 'nav_departments', pageKey: 'department_list', label: 'Departments' },
      ],
    },
    roles: [
      { key: 'hr_admin', name: 'HR Admin', scopes: ['*'] },
      { key: 'manager', name: 'Manager', scopes: ['employee.list', 'employee.view', 'employee.update', 'department.list', 'department.view'] },
      { key: 'employee', name: 'Employee', scopes: ['employee.list', 'employee.view', 'department.list', 'department.view'] },
    ],
  },
};

const HR_RECRUITMENT = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'hr_recruitment', name: 'Recruitment', version: '1.0.0', description: 'Full recruitment pipeline: Job Openings, Candidates, and Applications with a screening→hire/reject lifecycle.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'job_opening',
        name: 'Job Opening',
        pluralName: 'Job Openings',
        fields: [
          { key: 'title', name: 'Title', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'department', name: 'Department', type: 'string', required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'type', name: 'Type', type: 'enum', enumValues: ['full_time', 'part_time', 'contract', 'internship'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'location', name: 'Location', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['draft', 'open', 'on_hold', 'filled', 'cancelled'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'headcount', name: 'Headcount', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'target_start', name: 'Target Start', type: 'date', list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'applications', relation: 'has_many', entity: 'application', foreignKey: 'job_opening_id' },
        ],
      },
      {
        key: 'candidate',
        name: 'Candidate',
        pluralName: 'Candidates',
        fields: [
          { key: 'first_name', name: 'First Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'last_name', name: 'Last Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'email', name: 'Email', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'name@example.com' } },
          { key: 'phone', name: 'Phone', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'source', name: 'Source', type: 'enum', enumValues: ['linkedin', 'referral', 'job_board', 'direct', 'agency'], list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'current_title', name: 'Current Title', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'years_experience', name: 'Experience (yrs)', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'notes', name: 'Notes', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
        relations: [
          { key: 'applications', relation: 'has_many', entity: 'application', foreignKey: 'candidate_id' },
        ],
      },
      {
        key: 'application',
        name: 'Application',
        pluralName: 'Applications',
        fields: [
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'applied_date', name: 'Applied Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'interview_date', name: 'Interview Date', type: 'datetime', list: { visible: true }, form: { visible: true } },
          { key: 'offer_amount', name: 'Offer Amount', type: 'number', sensitive: 'pii', list: { visible: false }, form: { visible: true } },
          { key: 'recruiter', name: 'Recruiter', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'notes', name: 'Notes', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'rejection_reason', name: 'Rejection Reason', type: 'enum', enumValues: ['not_qualified', 'overqualified', 'culture_fit', 'compensation', 'withdrew', 'position_cancelled'], list: { visible: false }, form: { visible: true } },
        ],
        relations: [
          { key: 'job_opening_id', relation: 'belongs_to', entity: 'job_opening', required: true },
          { key: 'candidate_id', relation: 'belongs_to', entity: 'candidate', required: true },
        ],
        lifecycle: {
          field: 'status',
          initial: 'applied',
          states: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'],
          transitions: [
            { key: 'screen', from: 'applied', to: 'screening', label: 'Start Screening' },
            { key: 'invite_interview', from: 'screening', to: 'interview', label: 'Invite to Interview' },
            { key: 'make_offer', from: 'interview', to: 'offer', label: 'Make Offer' },
            { key: 'hire', from: 'offer', to: 'hired', label: 'Hire', event: 'application.hired' },
            { key: 'reject', from: ['screening', 'interview', 'offer'], to: 'rejected', label: 'Reject', event: 'application.rejected' },
            { key: 'withdraw', from: ['applied', 'screening', 'interview', 'offer'], to: 'withdrawn', label: 'Mark Withdrawn' },
          ],
        },
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Recruitment Dashboard', path: '/dashboard' },
      { key: 'job_list', type: 'entity-list', title: 'Job Openings', path: '/jobs', entity: 'job_opening' },
      { key: 'job_detail', type: 'entity-detail', title: 'Job Opening', path: '/jobs/:id', entity: 'job_opening' },
      { key: 'job_create', type: 'entity-create', title: 'New Job Opening', path: '/jobs/new', entity: 'job_opening' },
      { key: 'candidate_list', type: 'entity-list', title: 'Candidates', path: '/candidates', entity: 'candidate' },
      { key: 'candidate_detail', type: 'entity-detail', title: 'Candidate', path: '/candidates/:id', entity: 'candidate' },
      { key: 'candidate_create', type: 'entity-create', title: 'New Candidate', path: '/candidates/new', entity: 'candidate' },
      { key: 'application_list', type: 'entity-list', title: 'Applications', path: '/applications', entity: 'application' },
      { key: 'application_detail', type: 'entity-detail', title: 'Application', path: '/applications/:id', entity: 'application' },
      { key: 'application_create', type: 'entity-create', title: 'New Application', path: '/applications/new', entity: 'application' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'group', key: 'nav_pipeline', label: 'Pipeline', children: [
          { type: 'page', key: 'nav_applications', pageKey: 'application_list', label: 'Applications' },
          { type: 'page', key: 'nav_candidates', pageKey: 'candidate_list', label: 'Candidates' },
        ]},
        { type: 'page', key: 'nav_jobs', pageKey: 'job_list', label: 'Job Openings' },
      ],
    },
  },
};

const HR_LEAVE = {
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'hr_leave', name: 'Leave Management', version: '1.0.0', description: 'Leave management: Employees, Leave Types (annual/sick/unpaid), and Leave Requests with manager approval workflow.' },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'hr_employee',
        name: 'Employee',
        pluralName: 'Employees',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true } },
          { key: 'email', name: 'Email', type: 'string', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'department', name: 'Department', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'manager_name', name: 'Manager', type: 'string', list: { visible: true }, form: { visible: true } },
          { key: 'annual_leave_balance', name: 'Annual Leave Balance (days)', type: 'number', list: { visible: true }, form: { visible: true } },
        ],
        relations: [
          { key: 'leave_requests', relation: 'has_many', entity: 'leave_request', foreignKey: 'employee_id' },
        ],
      },
      {
        key: 'leave_type',
        name: 'Leave Type',
        pluralName: 'Leave Types',
        fields: [
          { key: 'name', name: 'Name', type: 'string', required: true, list: { visible: true, searchable: true }, form: { visible: true, placeholder: 'Annual Leave' } },
          { key: 'code', name: 'Code', type: 'string', required: true, list: { visible: true }, form: { visible: true, placeholder: 'AL' } },
          { key: 'is_paid', name: 'Paid', type: 'boolean', list: { visible: true }, form: { visible: true } },
          { key: 'max_days_per_year', name: 'Max Days/Year', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'requires_approval', name: 'Requires Approval', type: 'boolean', list: { visible: true }, form: { visible: true } },
          { key: 'description', name: 'Description', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
      },
      {
        key: 'leave_request',
        name: 'Leave Request',
        pluralName: 'Leave Requests',
        fields: [
          { key: 'start_date', name: 'Start Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'end_date', name: 'End Date', type: 'date', required: true, list: { visible: true }, form: { visible: true } },
          { key: 'days_requested', name: 'Days', type: 'number', list: { visible: true }, form: { visible: true } },
          { key: 'reason', name: 'Reason', type: 'text', form: { visible: true }, list: { visible: false } },
          { key: 'status', name: 'Status', type: 'enum', enumValues: ['pending', 'approved', 'rejected', 'cancelled'], required: true, list: { visible: true, filterable: true }, form: { visible: true } },
          { key: 'approved_by', name: 'Approved By', type: 'string', list: { visible: false }, form: { visible: true } },
          { key: 'rejection_reason', name: 'Rejection Reason', type: 'text', form: { visible: true }, list: { visible: false } },
        ],
        relations: [
          { key: 'employee_id', relation: 'belongs_to', entity: 'hr_employee', required: true },
          { key: 'leave_type_id', relation: 'belongs_to', entity: 'leave_type', required: true },
        ],
        lifecycle: {
          field: 'status',
          initial: 'pending',
          states: ['pending', 'approved', 'rejected', 'cancelled'],
          transitions: [
            { key: 'approve', from: 'pending', to: 'approved', label: 'Approve', guards: ['approved_by != null'], event: 'leave_request.approved' },
            { key: 'reject', from: 'pending', to: 'rejected', label: 'Reject', event: 'leave_request.rejected' },
            { key: 'cancel', from: ['pending', 'approved'], to: 'cancelled', label: 'Cancel' },
            { key: 'resubmit', from: 'rejected', to: 'pending', label: 'Resubmit' },
          ],
        },
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Leave Dashboard', path: '/dashboard' },
      { key: 'leave_request_list', type: 'entity-list', title: 'Leave Requests', path: '/leave-requests', entity: 'leave_request' },
      { key: 'leave_request_detail', type: 'entity-detail', title: 'Leave Request', path: '/leave-requests/:id', entity: 'leave_request' },
      { key: 'leave_request_create', type: 'entity-create', title: 'New Request', path: '/leave-requests/new', entity: 'leave_request' },
      { key: 'employee_list', type: 'entity-list', title: 'Employees', path: '/employees', entity: 'hr_employee' },
      { key: 'employee_detail', type: 'entity-detail', title: 'Employee', path: '/employees/:id', entity: 'hr_employee' },
      { key: 'employee_create', type: 'entity-create', title: 'New Employee', path: '/employees/new', entity: 'hr_employee' },
      { key: 'leave_type_list', type: 'entity-list', title: 'Leave Types', path: '/leave-types', entity: 'leave_type' },
      { key: 'leave_type_detail', type: 'entity-detail', title: 'Leave Type', path: '/leave-types/:id', entity: 'leave_type' },
      { key: 'leave_type_create', type: 'entity-create', title: 'New Leave Type', path: '/leave-types/new', entity: 'leave_type' },
    ],
    navigation: {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        { type: 'page', key: 'nav_leave_requests', pageKey: 'leave_request_list', label: 'Leave Requests' },
        { type: 'group', key: 'nav_settings', label: 'Settings', children: [
          { type: 'page', key: 'nav_employees', pageKey: 'employee_list', label: 'Employees' },
          { type: 'page', key: 'nav_leave_types', pageKey: 'leave_type_list', label: 'Leave Types' },
        ]},
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const APP_MANIFEST_SCENARIOS: AppManifestScenario[] = [
  // Documentation
  { label: 'Minimal Cell', description: 'Simplest valid manifest: one entity, one list page, one detail page, one create page', category: 'docs', manifest: DOC_MINIMAL },
  { label: 'All Field Types', description: 'One entity using every field type: string, text, number, boolean, date, datetime, and enum', category: 'docs', manifest: DOC_ALL_FIELD_TYPES },
  { label: 'Navigation Groups', description: 'Two entities with sidebar navigation structured into collapsible group sections', category: 'docs', manifest: DOC_NAVIGATION_GROUPS },
  { label: 'Entity Lifecycle', description: 'Task entity with a 4-state lifecycle: todo → in_progress → review → done', category: 'docs', manifest: DOC_LIFECYCLE },
  { label: 'Computed Fields', description: 'Invoice with expression (total), and conditional (overdue) computed fields', category: 'docs', manifest: DOC_COMPUTED },
  { label: 'Entity Relations', description: 'Customer (has_many orders) and Order (belongs_to customer)', category: 'docs', manifest: DOC_RELATIONS },
  { label: 'Roles & Scopes', description: 'Three roles (admin, editor, viewer) with different permission scope sets', category: 'docs', manifest: DOC_ROLES },
  { label: 'Capabilities', description: 'Ticket entity with transition, export, and mutation capability definitions', category: 'docs', manifest: DOC_CAPABILITIES },
  // CRM
  { label: 'Contact Manager', description: 'Contacts with company relation and lead→customer lifecycle, Companies, and Activity log', category: 'crm', manifest: CRM_CONTACTS },
  { label: 'Sales Pipeline', description: 'Leads qualifying into Opportunities across 6 pipeline stages with lifecycle transitions', category: 'crm', manifest: CRM_SALES_PIPELINE },
  { label: 'Customer Support', description: 'Support desk with Tickets (priority, SLA deadline, resolution lifecycle) linked to Customers', category: 'crm', manifest: CRM_SUPPORT },
  // ERP
  { label: 'Procurement', description: 'Suppliers and Purchase Orders with a 6-step approval lifecycle from draft to completed', category: 'erp', manifest: ERP_PROCUREMENT },
  { label: 'Inventory', description: 'Product catalog with categories, stock quantities, and a computed margin percentage field', category: 'erp', manifest: ERP_INVENTORY },
  { label: 'Finance & Billing', description: 'Customers and Invoices with send→pay lifecycle, computed totals, and overdue detection', category: 'erp', manifest: ERP_BILLING },
  // Project Management
  { label: 'Task Tracker', description: 'Projects, Sprints, and Tasks with a full development lifecycle including a review step', category: 'projects', manifest: PROJ_TASK_TRACKER },
  { label: 'Bug Tracker', description: 'Issue tracker with type, severity, component fields and a triage→in_progress→resolve lifecycle', category: 'projects', manifest: PROJ_BUG_TRACKER },
  { label: 'Resource Planning', description: 'Teams, Projects, and Assignments with allocated hours and role per assignment', category: 'projects', manifest: PROJ_RESOURCE_PLANNING },
  // Human Resources
  { label: 'Employee Directory', description: 'Departments and Employees with position, hire date, salary (sensitive), and status lifecycle', category: 'hr', manifest: HR_EMPLOYEE_DIRECTORY },
  { label: 'Recruitment', description: 'Job Openings, Candidates, and Applications with a screening→interview→offer→hire/reject pipeline', category: 'hr', manifest: HR_RECRUITMENT },
  { label: 'Leave Management', description: 'Employees, Leave Types, and Leave Requests with manager approval workflow', category: 'hr', manifest: HR_LEAVE },
];
