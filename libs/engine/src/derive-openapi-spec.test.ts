import { describe, it, expect } from 'vitest';
import type { EntityDefinition, FieldDefinition } from '@ikary/contract';
import { deriveOpenAPISpec } from './derive-openapi-spec';

const minimalEntity = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    { key: 'name', type: 'string', name: 'Name' },
  ] as FieldDefinition[],
} as EntityDefinition;

describe('deriveOpenAPISpec', () => {
  it('returns a valid OpenAPI 3.0.3 spec envelope', () => {
    const spec = deriveOpenAPISpec(minimalEntity);

    expect(spec.openapi).toBe('3.0.3');
    expect(spec.info.title).toBe('Customer API');
    expect(spec.info.version).toBe('1.0.0');
    expect(spec.info.description).toContain('Customer');
    expect(spec.components.schemas).toBeDefined();
  });

  it('generates 5 CRUD endpoints on base and item paths', () => {
    const spec = deriveOpenAPISpec(minimalEntity);
    const basePath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}';
    const itemPath = `${basePath}/{id}`;

    expect(spec.paths[basePath]).toBeDefined();
    expect(spec.paths[basePath].get).toBeDefined();
    expect(spec.paths[basePath].post).toBeDefined();
    expect(spec.paths[itemPath]).toBeDefined();
    expect(spec.paths[itemPath].get).toBeDefined();
    expect(spec.paths[itemPath].put).toBeDefined();
    expect(spec.paths[itemPath].delete).toBeDefined();
  });

  it('list operation includes query parameters', () => {
    const spec = deriveOpenAPISpec(minimalEntity);
    const basePath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}';
    const listOp = spec.paths[basePath].get;

    const queryParams = listOp.parameters!.filter((p) => p.in === 'query');
    const queryNames = queryParams.map((p) => p.name);

    expect(queryNames).toContain('page');
    expect(queryNames).toContain('pageSize');
    expect(queryNames).toContain('sortField');
    expect(queryNames).toContain('sortDir');
    expect(queryNames).toContain('search');
    expect(queryNames).toContain('filter');
  });

  it('builds entity schema with base fields and user fields', () => {
    const spec = deriveOpenAPISpec(minimalEntity);
    const entitySchema = spec.components.schemas.Customer;

    expect(entitySchema.properties!.id).toEqual({ type: 'string' });
    expect(entitySchema.properties!.createdAt).toEqual({ type: 'string', format: 'date-time' });
    expect(entitySchema.properties!.version).toEqual({ type: 'number' });
    expect(entitySchema.properties!.name).toEqual({ type: 'string' });
    expect(entitySchema.required).toContain('id');
  });

  it('builds create input schema from visible fields', () => {
    const entity = {
      ...minimalEntity,
      fields: [
        { key: 'name', type: 'string', name: 'Name', validation: { fieldRules: [{ ruleId: 'r1', type: 'required', field: 'name', messageKey: 'req', clientSafe: true, blocking: true, severity: 'error' }] } },
        { key: 'notes', type: 'text', name: 'Notes' },
        { key: 'hidden', type: 'string', name: 'Hidden', create: { visible: false } },
      ] as FieldDefinition[],
    } as EntityDefinition;

    const spec = deriveOpenAPISpec(entity);
    const createSchema = spec.components.schemas.CustomerCreateInput;

    expect(createSchema.properties!.name).toBeDefined();
    expect(createSchema.properties!.notes).toBeDefined();
    expect(createSchema.properties!.hidden).toBeUndefined();
    expect(createSchema.required).toContain('name');
  });

  it('builds update input schema from edit-visible fields', () => {
    const entity = {
      ...minimalEntity,
      fields: [
        { key: 'name', type: 'string', name: 'Name' },
        { key: 'system_field', type: 'string', name: 'Sys', system: true },
      ] as FieldDefinition[],
    } as EntityDefinition;

    const spec = deriveOpenAPISpec(entity);
    const updateSchema = spec.components.schemas.CustomerUpdateInput;

    expect(updateSchema.properties!.name).toBeDefined();
    expect(updateSchema.properties!.system_field).toBeUndefined();
  });

  it('maps all field types to correct OpenAPI types', () => {
    const entity = {
      key: 'test_item',
      name: 'TestItem',
      pluralName: 'TestItems',
      fields: [
        { key: 'f_string', type: 'string', name: 'S' },
        { key: 'f_text', type: 'text', name: 'T' },
        { key: 'f_number', type: 'number', name: 'N' },
        { key: 'f_boolean', type: 'boolean', name: 'B' },
        { key: 'f_date', type: 'date', name: 'D' },
        { key: 'f_datetime', type: 'datetime', name: 'DT' },
        { key: 'f_enum', type: 'enum', name: 'E', enumValues: ['a', 'b'] },
        { key: 'f_obj', type: 'object', name: 'O', fields: [{ key: 'child', type: 'string', name: 'C' }] },
      ] as FieldDefinition[],
    } as EntityDefinition;

    const spec = deriveOpenAPISpec(entity);
    const props = spec.components.schemas.TestItem.properties!;

    expect(props.f_string).toEqual({ type: 'string' });
    expect(props.f_text).toEqual({ type: 'string' });
    expect(props.f_number).toEqual({ type: 'number' });
    expect(props.f_boolean).toEqual({ type: 'boolean' });
    expect(props.f_date).toEqual({ type: 'string', format: 'date' });
    expect(props.f_datetime).toEqual({ type: 'string', format: 'date-time' });
    expect(props.f_enum).toEqual({ type: 'string', enum: ['a', 'b'] });
    expect(props.f_obj.type).toBe('object');
    expect(props.f_obj.properties!.child).toEqual({ type: 'string' });
  });

  it('maps enum values with object shape ({key, label})', () => {
    const entity = {
      ...minimalEntity,
      fields: [
        { key: 'status', type: 'enum', name: 'Status', enumValues: [{ key: 'active', label: 'Active' }, { key: 'inactive', label: 'Inactive' }] },
      ] as FieldDefinition[],
    } as EntityDefinition;

    const spec = deriveOpenAPISpec(entity);
    const prop = spec.components.schemas.Customer.properties!.status;

    expect(prop.enum).toEqual(['active', 'inactive']);
  });

  it('includes field helpText as schema description', () => {
    const entity = {
      ...minimalEntity,
      fields: [
        { key: 'name', type: 'string', name: 'Name', helpText: 'Full customer name' },
      ] as FieldDefinition[],
    } as EntityDefinition;

    const spec = deriveOpenAPISpec(entity);
    expect(spec.components.schemas.Customer.properties!.name.description).toBe('Full customer name');
  });

  it('handles enum field without enumValues', () => {
    const entity = {
      ...minimalEntity,
      fields: [
        { key: 'status', type: 'enum', name: 'Status' },
      ] as FieldDefinition[],
    } as EntityDefinition;

    const spec = deriveOpenAPISpec(entity);
    const prop = spec.components.schemas.Customer.properties!.status;

    expect(prop.type).toBe('string');
    expect(prop.enum).toBeUndefined();
  });

  it('handles object field without nested fields', () => {
    const entity = {
      ...minimalEntity,
      fields: [
        { key: 'meta', type: 'object', name: 'Meta' },
      ] as FieldDefinition[],
    } as EntityDefinition;

    const spec = deriveOpenAPISpec(entity);
    const prop = spec.components.schemas.Customer.properties!.meta;

    expect(prop.type).toBe('object');
    expect(prop.properties).toBeUndefined();
  });

  describe('capability endpoints', () => {
    it('generates transition endpoint on item path', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{ key: 'approve', type: 'transition' }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const capPath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}/{id}/transitions/approve';

      expect(spec.paths[capPath]).toBeDefined();
      expect(spec.paths[capPath].post).toBeDefined();
      expect(spec.paths[capPath].post.operationId).toBe('transitionCustomerApprove');
    });

    it('generates mutation endpoint on item path', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{ key: 'archive', type: 'mutation' }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const capPath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}/{id}/mutations/archive';

      expect(spec.paths[capPath]).toBeDefined();
      expect(spec.paths[capPath].post).toBeDefined();
    });

    it('generates workflow endpoint on item path (default scope)', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{ key: 'review', type: 'workflow', scope: 'entity' }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const capPath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}/{id}/workflows/review';

      expect(spec.paths[capPath]).toBeDefined();
    });

    it('generates global workflow endpoint on base path', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{ key: 'sync', type: 'workflow', scope: 'global' }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const capPath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}/workflows/sync';

      expect(spec.paths[capPath]).toBeDefined();
    });

    it('generates entity-scoped export endpoint on item path', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{ key: 'export_pdf', type: 'export', scope: 'entity' }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const capPath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}/{id}/exports/export_pdf';

      expect(spec.paths[capPath]).toBeDefined();
    });

    it('generates global export endpoint on base path', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{ key: 'export_csv', type: 'export', scope: 'global' }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const capPath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}/exports/export_csv';

      expect(spec.paths[capPath]).toBeDefined();
    });

    it('generates selection export endpoint on base path', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{ key: 'bulk_export', type: 'export', scope: 'selection' }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const capPath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}/exports/bulk_export';

      expect(spec.paths[capPath]).toBeDefined();
    });

    it('generates integration endpoint on item path', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{ key: 'import_csv', type: 'integration' }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const capPath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}/{id}/integrations/import_csv';

      expect(spec.paths[capPath]).toBeDefined();
    });

    it('builds capability input schema from inputs', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{
          key: 'import_data',
          type: 'integration',
          inputs: [
            { key: 'file_url', type: 'string', label: 'File URL', required: true },
            { key: 'dry_run', type: 'boolean', label: 'Dry Run' },
            { key: 'count', type: 'number' },
            { key: 'start_date', type: 'date' },
            { key: 'source', type: 'select' },
            { key: 'target', type: 'entity' },
            { key: 'description', type: 'text' },
            { key: 'unknown_type', type: 'custom' },
          ],
        }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const inputSchema = spec.components.schemas.CustomerImportDataInput;

      expect(inputSchema.properties!.file_url).toEqual({ type: 'string', description: 'File URL' });
      expect(inputSchema.properties!.dry_run).toEqual({ type: 'boolean', description: 'Dry Run' });
      expect(inputSchema.properties!.count).toEqual({ type: 'number' });
      expect(inputSchema.properties!.start_date).toEqual({ type: 'string' });
      expect(inputSchema.properties!.source).toEqual({ type: 'string' });
      expect(inputSchema.properties!.target).toEqual({ type: 'string' });
      expect(inputSchema.properties!.description).toEqual({ type: 'string' });
      expect(inputSchema.properties!.unknown_type).toEqual({ type: 'string' });
      expect(inputSchema.required).toEqual(['file_url']);
    });

    it('builds empty input schema when no inputs defined', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{ key: 'archive', type: 'transition' }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const inputSchema = spec.components.schemas.CustomerArchiveInput;

      expect(inputSchema).toEqual({ type: 'object' });
    });

    it('skips capabilities with unknown type', () => {
      const entity = {
        ...minimalEntity,
        capabilities: [{ key: 'unknown_cap', type: 'unknown_type' as any }],
      } as EntityDefinition;

      const spec = deriveOpenAPISpec(entity);
      const pathKeys = Object.keys(spec.paths);

      expect(pathKeys.length).toBe(2); // only basePath and itemPath
    });
  });

  it('converts multi-word entity keys to PascalCase', () => {
    const entity = {
      key: 'line_item',
      name: 'Line Item',
      pluralName: 'Line Items',
      fields: [{ key: 'name', type: 'string', name: 'Name' }] as FieldDefinition[],
    } as EntityDefinition;

    const spec = deriveOpenAPISpec(entity);

    expect(spec.components.schemas.LineItem).toBeDefined();
    expect(spec.components.schemas.LineItemCreateInput).toBeDefined();
    expect(spec.components.schemas.LineItemUpdateInput).toBeDefined();
  });

  it('handles entity with no capabilities', () => {
    const spec = deriveOpenAPISpec(minimalEntity);
    const pathKeys = Object.keys(spec.paths);

    expect(pathKeys.length).toBe(2);
  });

  it('create response uses 201 status code', () => {
    const spec = deriveOpenAPISpec(minimalEntity);
    const basePath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}';
    const createOp = spec.paths[basePath].post;

    expect(createOp.responses['201']).toBeDefined();
    expect(createOp.responses['201'].content).toBeDefined();
  });

  it('get and delete operations include 404 response', () => {
    const spec = deriveOpenAPISpec(minimalEntity);
    const itemPath = '/v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}/{id}';

    expect(spec.paths[itemPath].get.responses['404']).toBeDefined();
    expect(spec.paths[itemPath].put.responses['404']).toBeDefined();
    expect(spec.paths[itemPath].delete.responses['404']).toBeDefined();
  });
});
