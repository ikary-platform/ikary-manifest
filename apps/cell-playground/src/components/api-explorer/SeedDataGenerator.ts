import type { EntityDefinition, FieldDefinition } from '@ikary/cell-contract';

// ── People ────────────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'James', 'Maria', 'David', 'Sarah', 'Michael',
  'Emma', 'Robert', 'Olivia', 'Daniel', 'Sophia',
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Martinez', 'Anderson',
];

// ── Organizations ─────────────────────────────────────────────────────────────
const COMPANY_NAMES = [
  'Meridian Solutions', 'Atlas Group', 'Vantage Technologies', 'Crestview Holdings',
  'Pinnacle Partners', 'Summit Consulting', 'Nexus Industries', 'Horizon Capital',
  'Apex Systems', 'Sterling Global',
];
const COMPANY_DOMAINS = [
  'meridian.com', 'atlasgroup.com', 'vantagetech.io', 'crestview.co',
  'pinnacle-partners.com', 'summit-consulting.com', 'nexus.io', 'horizoncap.com',
  'apexsys.com', 'sterling-global.com',
];
const SUPPLIER_NAMES = [
  'Vertex Materials', 'Clearwater Supplies', 'Pacific Distribution Co.', 'Mountain Peak Logistics',
  'Coastal Sourcing Ltd.', 'Allied Components Inc.', 'Eastern Wholesale Group', 'Premier Suppliers Corp.',
  'National Trade Partners', 'Metro Industrial Supply',
];

// ── Departments & Teams ───────────────────────────────────────────────────────
const DEPARTMENT_NAMES = [
  'Engineering', 'Finance', 'Marketing', 'Human Resources', 'Sales',
  'Operations', 'Legal', 'Product Management', 'Customer Success', 'Research & Development',
];
const DEPARTMENT_CODES = ['ENG', 'FIN', 'MKT', 'HR', 'SLS', 'OPS', 'LGL', 'PM', 'CS', 'RND'];
const TEAM_NAMES = [
  'Platform Team', 'Frontend Team', 'Backend Team', 'Data Engineering', 'Security',
  'DevOps', 'Mobile Team', 'Design', 'QA & Testing', 'Analytics',
];

// ── Jobs & Roles ──────────────────────────────────────────────────────────────
const JOB_TITLES = [
  'Senior Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst',
  'Engineering Manager', 'Marketing Specialist', 'Account Executive',
  'Customer Success Manager', 'DevOps Engineer', 'Financial Analyst',
];

// ── Products & Categories ─────────────────────────────────────────────────────
const PRODUCT_NAMES = [
  'Pro Widget X1', 'Standard Connector Kit', 'Bulk Storage Module', 'Precision Sensor Array',
  'Industrial Cable Harness', 'Filter Assembly Unit', 'Power Supply Board',
  'Mounting Bracket Set', 'Control Panel Interface', 'Cooling Fan System',
];
const PRODUCT_CATEGORY_NAMES = [
  'Electronics', 'Raw Materials', 'Office Supplies', 'Hardware Components',
  'Consumables', 'Packaging', 'Maintenance Parts', 'Safety Equipment',
  'IT & Networking', 'Facilities',
];
const PRODUCT_CATEGORY_CODES = ['ELEC', 'RAW', 'OFF', 'HWD', 'CONS', 'PKG', 'MAINT', 'SAFE', 'IT', 'FAC'];

// ── Projects ──────────────────────────────────────────────────────────────────
const PROJECT_NAMES = [
  'Platform Modernisation', 'Customer Portal Redesign', 'Data Warehouse Migration',
  'Mobile App v2.0', 'ERP Integration', 'Security Hardening',
  'Analytics Dashboard', 'API Gateway Rollout', 'DevOps Pipeline Overhaul', 'Compliance Framework',
];

// ── Leave Types ───────────────────────────────────────────────────────────────
const LEAVE_TYPE_NAMES = [
  'Annual Leave', 'Sick Leave', 'Unpaid Leave', 'Maternity Leave',
  'Paternity Leave', 'Compassionate Leave', 'Study Leave', 'Public Holiday',
  'Compensatory Leave', 'Medical Leave',
];
const LEAVE_TYPE_CODES = ['AL', 'SL', 'UL', 'MAT', 'PAT', 'CMP', 'STU', 'PH', 'COMP', 'MED'];

// ── Geo ───────────────────────────────────────────────────────────────────────
const CITIES = [
  'New York', 'London', 'Tokyo', 'Paris', 'Sydney',
  'Toronto', 'Berlin', 'Singapore', 'Dubai', 'San Francisco',
];

// ─────────────────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length]!;
}

function generateFieldValue(field: FieldDefinition, index: number, entityKey = ''): unknown {
  const key = field.key;
  const entity = entityKey.toLowerCase();

  switch (field.type) {
    case 'string': {
      // ── Entity-context-aware rules (must come BEFORE generic /name/ regex) ──

      // Supplier name
      if (/^supplier$/.test(entity) && /^name$/.test(key))
        return pick(SUPPLIER_NAMES, index);

      // Company / customer / account / client — B2B context → org names
      if (/company|account|client/.test(entity) && /^name$/.test(key))
        return pick(COMPANY_NAMES, index);
      if (/^customer$/.test(entity) && /^name$/.test(key))
        return pick(COMPANY_NAMES, index);

      // Domain for company-type entities
      if (/company|supplier|customer|account/.test(entity) && /^domain$/.test(key))
        return pick(COMPANY_DOMAINS, index);

      // Department name/code
      if (/department/.test(entity) && /^name$/.test(key))
        return pick(DEPARTMENT_NAMES, index);
      if (/department/.test(entity) && /^code$/.test(key))
        return pick(DEPARTMENT_CODES, index);

      // Team name
      if (/^team$/.test(entity) && /^name$/.test(key))
        return pick(TEAM_NAMES, index);

      // Job opening title
      if (/job.?opening|job_opening/.test(entity) && /^title$/.test(key))
        return pick(JOB_TITLES, index);

      // Product name
      if (/^product$/.test(entity) && /^name$/.test(key))
        return pick(PRODUCT_NAMES, index);

      // Product category name/code
      if (/^category$/.test(entity) && /^name$/.test(key))
        return pick(PRODUCT_CATEGORY_NAMES, index);
      if (/^category$/.test(entity) && /^code$/.test(key))
        return pick(PRODUCT_CATEGORY_CODES, index);

      // Project name
      if (/project/.test(entity) && /^name$/.test(key))
        return pick(PROJECT_NAMES, index);

      // Leave type name/code
      if (/leave.?type/.test(entity) && /^name$/.test(key))
        return pick(LEAVE_TYPE_NAMES, index);
      if (/leave.?type/.test(entity) && /^code$/.test(key))
        return pick(LEAVE_TYPE_CODES, index);

      // ── Formatted ID/code fields ─────────────────────────────────────────
      if (/^sku$/.test(key))
        return `SKU-${String(index + 1).padStart(4, '0')}`;
      if (/^employee.?id$/.test(key))
        return `EMP-${String(index + 1).padStart(4, '0')}`;
      if (/^po.?number$/.test(key))
        return `PO-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`;
      if (/^(invoice.?)?number$/.test(key) && /invoice/.test(entity))
        return `INV-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`;
      if (/^reference$/.test(key))
        return `ORD-${String(index + 1).padStart(4, '0')}`;
      if (/^(project.?)?key$/.test(key))
        return ['PLATFORM', 'PORTAL', 'DATAWH', 'MOBILE', 'ERPI', 'SECHRD', 'ANLYTX', 'APIGW', 'DEVOPS', 'COMPL'][index % 10];
      if (/^code$/.test(key)) {
        // Generic code — give a clean formatted fallback
        const prefix = entity.slice(0, 3).toUpperCase() || 'REC';
        return `${prefix}-${String(index + 1).padStart(3, '0')}`;
      }

      // ── Generic patterns ─────────────────────────────────────────────────
      if (/first.?name/i.test(key))
        return pick(FIRST_NAMES, index);
      if (/last.?name/i.test(key))
        return pick(LAST_NAMES, index);
      if (/name|full.?name/i.test(key))
        return `${pick(FIRST_NAMES, index)} ${pick(LAST_NAMES, index)}`;
      if (/email/i.test(key)) {
        const fn = pick(FIRST_NAMES, index).toLowerCase();
        const ln = pick(LAST_NAMES, index).toLowerCase();
        return `${fn}.${ln}@example.com`;
      }
      if (/phone/i.test(key))
        return `+1-555-0${String(100 + index).padStart(3, '0')}`;
      if (/company/i.test(key))
        return pick(COMPANY_NAMES, index);
      if (/domain/i.test(key))
        return pick(COMPANY_DOMAINS, index);
      if (/city|location/i.test(key))
        return pick(CITIES, index);
      if (/url|website/i.test(key))
        return `https://example.com/page-${index + 1}`;
      if (/title|subject/i.test(key))
        return `Sample ${field.name || field.key} ${index + 1}`;
      if (/assignee|owner|manager|reporter|approver|recruiter/i.test(key))
        return `${pick(FIRST_NAMES, index)} ${pick(LAST_NAMES, index)}`;
      if (/version/i.test(key))
        return `1.${index}.0`;
      if (/component/i.test(key))
        return pick(['API', 'Frontend', 'Backend', 'Database', 'Auth', 'Payments', 'Notifications', 'Search', 'Storage', 'Admin'], index);

      return `${field.key}_${index + 1}`;
    }

    case 'text':
      return `Sample ${field.name || field.key} content for record ${index + 1}. This is generated test data.`;

    case 'number': {
      if (/salary|wage/i.test(key))
        return [52000, 68000, 85000, 95000, 110000, 72000, 61000, 130000, 88000, 47000][index % 10];
      if (/revenue|budget/i.test(key))
        return [24000, 87500, 142000, 53000, 310000, 76000, 195000, 48000, 225000, 67000][index % 10];
      if (/amount|price|cost/i.test(key))
        return Math.round(((index * 7919 + 42) % 10000) * 10) / 100;
      if (/probability|score/i.test(key))
        return [85, 40, 70, 25, 90, 55, 15, 65, 80, 35][index % 10];
      if (/rating/i.test(key))
        return [4, 3, 5, 4, 2, 5, 3, 4, 5, 3][index % 10];
      if (/qty|quantity|stock/i.test(key))
        return [120, 45, 300, 8, 75, 210, 0, 150, 62, 400][index % 10];
      if (/days|balance/i.test(key))
        return [25, 14, 3, 20, 8, 30, 12, 18, 7, 22][index % 10];
      if (/hours|hrs|capacity/i.test(key))
        return [40, 32, 20, 40, 16, 40, 24, 40, 32, 8][index % 10];
      if (/points|pts/i.test(key))
        return [3, 5, 8, 2, 13, 1, 8, 5, 3, 13][index % 10];
      if (/headcount|employee.?count/i.test(key))
        return [1200, 85, 4500, 320, 28, 950, 175, 2100, 60, 740][index % 10];
      if (/payment.?terms/i.test(key))
        return [30, 45, 60, 30, 14, 30, 90, 30, 45, 60][index % 10];
      if (/count/i.test(key))
        return (index * 3 + 1) % 20;
      return (index * 37 + 17) % 1000;
    }

    case 'boolean':
      return index % 3 !== 0;

    case 'date':
      return new Date(Date.now() - ((index * 13 + 7) % 365) * 86400000)
        .toISOString()
        .split('T')[0];

    case 'datetime':
      return new Date(Date.now() - ((index * 13 + 7) % 365) * 86400000).toISOString();

    case 'enum': {
      const enumValues = (field as any).enumValues as string[] | { key: string }[] | undefined;
      if (!enumValues || enumValues.length === 0) return null;
      const picked = enumValues[index % enumValues.length];
      return typeof picked === 'object' && picked !== null ? (picked as { key: string }).key : picked;
    }

    case 'object': {
      const children = (field as any).fields as FieldDefinition[] | undefined;
      if (!children || children.length === 0) return {};
      const obj: Record<string, unknown> = {};
      for (const child of children) {
        obj[child.key] = generateFieldValue(child, index, entityKey);
      }
      return obj;
    }

    default:
      return `${field.key}_${index + 1}`;
  }
}

export function generateSeedRecords(
  entity: EntityDefinition,
  count: number,
): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];

  for (let i = 0; i < count; i++) {
    const record: Record<string, unknown> = {
      id: crypto.randomUUID(),
      createdAt: new Date(
        Date.now() - (crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000) * 90 * 86400000,
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - (crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000) * 90 * 86400000,
      ).toISOString(),
      createdBy: 'seed-generator',
      updatedBy: 'seed-generator',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    };

    for (const field of entity.fields) {
      record[field.key] = generateFieldValue(field, i, entity.key);
    }

    if (entity.lifecycle) {
      const states = entity.lifecycle.states;
      record[entity.lifecycle.field] = states[i % states.length]!;
    }

    records.push(record);
  }

  return records;
}
