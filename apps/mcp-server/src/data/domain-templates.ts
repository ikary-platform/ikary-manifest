export interface DomainTemplate {
  keywords: string[];
  entities: Array<{ key: string; name: string; pluralName: string; reason: string; suggestedFields: string[] }>;
  relations: Array<{ source: string; kind: string; target: string; reason: string }>;
}

export const DOMAIN_TEMPLATES: DomainTemplate[] = [
  {
    keywords: ['crm', 'customer', 'sales', 'account', 'contact', 'deal', 'opportunity', 'pipeline'],
    entities: [
      { key: 'account', name: 'Account', pluralName: 'Accounts', reason: 'Core business account/company', suggestedFields: ['name', 'industry', 'website', 'phone', 'status'] },
      { key: 'contact', name: 'Contact', pluralName: 'Contacts', reason: 'People linked to accounts', suggestedFields: ['first_name', 'last_name', 'email', 'phone', 'title'] },
      { key: 'deal', name: 'Deal', pluralName: 'Deals', reason: 'Sales pipeline opportunities', suggestedFields: ['title', 'amount', 'stage', 'close_date', 'probability'] },
    ],
    relations: [
      { source: 'contact', kind: 'belongs_to', target: 'account', reason: 'Contacts belong to accounts' },
      { source: 'deal', kind: 'belongs_to', target: 'account', reason: 'Deals are tied to accounts' },
    ],
  },
  {
    keywords: ['ticket', 'support', 'helpdesk', 'issue', 'bug', 'incident'],
    entities: [
      { key: 'ticket', name: 'Ticket', pluralName: 'Tickets', reason: 'Support tickets or issues', suggestedFields: ['title', 'description', 'priority', 'status', 'assigned_to'] },
      { key: 'customer', name: 'Customer', pluralName: 'Customers', reason: 'Customers submitting tickets', suggestedFields: ['name', 'email', 'company', 'phone'] },
      { key: 'comment', name: 'Comment', pluralName: 'Comments', reason: 'Ticket comments/replies', suggestedFields: ['body', 'author', 'is_internal'] },
    ],
    relations: [
      { source: 'ticket', kind: 'belongs_to', target: 'customer', reason: 'Tickets are submitted by customers' },
      { source: 'comment', kind: 'belongs_to', target: 'ticket', reason: 'Comments belong to tickets' },
    ],
  },
  {
    keywords: ['inventory', 'product', 'warehouse', 'stock', 'asset', 'catalog'],
    entities: [
      { key: 'product', name: 'Product', pluralName: 'Products', reason: 'Items in the catalog', suggestedFields: ['name', 'sku', 'price', 'category', 'description'] },
      { key: 'warehouse', name: 'Warehouse', pluralName: 'Warehouses', reason: 'Storage locations', suggestedFields: ['name', 'address', 'capacity'] },
      { key: 'stock_level', name: 'Stock Level', pluralName: 'Stock Levels', reason: 'Quantity per product per warehouse', suggestedFields: ['quantity', 'min_threshold', 'max_threshold'] },
    ],
    relations: [
      { source: 'stock_level', kind: 'belongs_to', target: 'product', reason: 'Stock tracked per product' },
      { source: 'stock_level', kind: 'belongs_to', target: 'warehouse', reason: 'Stock tracked per warehouse' },
    ],
  },
  {
    keywords: ['project', 'task', 'team', 'sprint', 'kanban', 'agile', 'roadmap'],
    entities: [
      { key: 'project', name: 'Project', pluralName: 'Projects', reason: 'Top-level project container', suggestedFields: ['name', 'description', 'status', 'start_date', 'end_date'] },
      { key: 'task', name: 'Task', pluralName: 'Tasks', reason: 'Work items within projects', suggestedFields: ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date'] },
      { key: 'team_member', name: 'Team Member', pluralName: 'Team Members', reason: 'People working on projects', suggestedFields: ['name', 'email', 'role'] },
    ],
    relations: [
      { source: 'task', kind: 'belongs_to', target: 'project', reason: 'Tasks belong to projects' },
    ],
  },
  {
    keywords: ['hr', 'employee', 'department', 'leave', 'payroll', 'attendance'],
    entities: [
      { key: 'employee', name: 'Employee', pluralName: 'Employees', reason: 'Staff records', suggestedFields: ['first_name', 'last_name', 'email', 'department', 'position', 'hire_date'] },
      { key: 'department', name: 'Department', pluralName: 'Departments', reason: 'Organizational units', suggestedFields: ['name', 'code', 'head'] },
      { key: 'leave_request', name: 'Leave Request', pluralName: 'Leave Requests', reason: 'Time-off requests', suggestedFields: ['type', 'start_date', 'end_date', 'status', 'reason'] },
    ],
    relations: [
      { source: 'employee', kind: 'belongs_to', target: 'department', reason: 'Employees belong to departments' },
      { source: 'leave_request', kind: 'belongs_to', target: 'employee', reason: 'Leave requests belong to employees' },
    ],
  },
  {
    keywords: ['order', 'ecommerce', 'shop', 'cart', 'invoice', 'payment'],
    entities: [
      { key: 'customer', name: 'Customer', pluralName: 'Customers', reason: 'Buyers', suggestedFields: ['name', 'email', 'phone', 'address'] },
      { key: 'order', name: 'Order', pluralName: 'Orders', reason: 'Purchase orders', suggestedFields: ['order_number', 'total', 'status', 'order_date', 'shipping_address'] },
      { key: 'order_item', name: 'Order Item', pluralName: 'Order Items', reason: 'Line items in an order', suggestedFields: ['product_name', 'quantity', 'unit_price', 'subtotal'] },
    ],
    relations: [
      { source: 'order', kind: 'belongs_to', target: 'customer', reason: 'Orders placed by customers' },
      { source: 'order_item', kind: 'belongs_to', target: 'order', reason: 'Items belong to orders' },
    ],
  },
];
