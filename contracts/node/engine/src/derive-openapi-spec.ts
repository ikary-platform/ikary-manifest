import type { EntityDefinition, FieldDefinition } from '@ikary-manifest/contract';
import { deriveCreateFields } from './derive-create-fields';
import { deriveEditFields } from './derive-edit-fields';

// ── Lightweight OpenAPI 3.0.3 types ──────────────────────────────────────────

interface OpenAPISpec {
  openapi: '3.0.3';
  info: { title: string; version: string; description: string };
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components: { schemas: Record<string, OpenAPISchema> };
}

interface OpenAPIOperation {
  operationId: string;
  summary: string;
  tags: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: { required: boolean; content: { 'application/json': { schema: OpenAPISchema } } };
  responses: Record<string, { description: string; content?: { 'application/json': { schema: OpenAPISchema } } }>;
}

interface OpenAPIParameter {
  name: string;
  in: 'path' | 'query';
  required: boolean;
  schema: OpenAPISchema;
  description?: string;
}

interface OpenAPISchema {
  type?: string;
  format?: string;
  enum?: string[];
  items?: OpenAPISchema;
  properties?: Record<string, OpenAPISchema>;
  required?: string[];
  description?: string;
  $ref?: string;
  default?: unknown;
  minimum?: number;
  maximum?: number;
}

export type { OpenAPISpec, OpenAPIOperation, OpenAPIParameter, OpenAPISchema };

// ── Constants ────────────────────────────────────────────────────────────────

const ENTITY_ROUTE_PREFIX =
  'v1/tenants/{tenantId}/workspaces/{workspaceId}/cells/{cellKey}/entities/{entityKey}';

const BASE_ENTITY_FIELDS: Array<{ key: string; type: string; format?: string }> = [
  { key: 'id', type: 'string' },
  { key: 'createdAt', type: 'string', format: 'date-time' },
  { key: 'createdBy', type: 'string' },
  { key: 'updatedAt', type: 'string', format: 'date-time' },
  { key: 'updatedBy', type: 'string' },
  { key: 'deletedAt', type: 'string', format: 'date-time' },
  { key: 'deletedBy', type: 'string' },
  { key: 'version', type: 'number' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function pascalCase(str: string): string {
  return str
    .split(/[_\-\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function mapFieldToSchema(field: FieldDefinition): OpenAPISchema {
  const schema: OpenAPISchema = {};

  switch (field.type) {
    case 'string':
    case 'text':
      schema.type = 'string';
      break;
    case 'number':
      schema.type = 'number';
      break;
    case 'boolean':
      schema.type = 'boolean';
      break;
    case 'date':
      schema.type = 'string';
      schema.format = 'date';
      break;
    case 'datetime':
      schema.type = 'string';
      schema.format = 'date-time';
      break;
    case 'enum':
      schema.type = 'string';
      if (field.enumValues) {
        schema.enum = field.enumValues.map((v) =>
          typeof v === 'string' ? v : (v as { key: string }).key,
        );
      }
      break;
    case 'object':
      schema.type = 'object';
      if (field.fields && field.fields.length > 0) {
        schema.properties = {};
        for (const child of field.fields) {
          schema.properties[child.key] = mapFieldToSchema(child);
        }
      }
      break;
  }

  if (field.helpText) {
    schema.description = field.helpText;
  }

  return schema;
}

function buildCapabilityInputSchema(
  inputs: Array<{ key: string; type: string; label?: string; required?: boolean }> | undefined,
): OpenAPISchema {
  if (!inputs || inputs.length === 0) {
    return { type: 'object' };
  }

  const properties: Record<string, OpenAPISchema> = {};
  const required: string[] = [];

  for (const input of inputs) {
    const prop: OpenAPISchema = {};

    switch (input.type) {
      case 'string':
      case 'text':
      case 'date':
      case 'select':
      case 'entity':
        prop.type = 'string';
        break;
      case 'number':
        prop.type = 'number';
        break;
      case 'boolean':
        prop.type = 'boolean';
        break;
      default:
        prop.type = 'string';
    }

    if (input.label) {
      prop.description = input.label;
    }

    properties[input.key] = prop;

    if (input.required) {
      required.push(input.key);
    }
  }

  const schema: OpenAPISchema = { type: 'object', properties };
  if (required.length > 0) {
    schema.required = required;
  }
  return schema;
}

// ── Shared parameters & response helpers ─────────────────────────────────────

function buildPathParameters(): OpenAPIParameter[] {
  return [
    { name: 'tenantId', in: 'path', required: true, schema: { type: 'string' }, description: 'Tenant identifier' },
    { name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' }, description: 'Workspace identifier' },
    { name: 'cellKey', in: 'path', required: true, schema: { type: 'string' }, description: 'Cell key' },
    { name: 'entityKey', in: 'path', required: true, schema: { type: 'string' }, description: 'Entity key' },
  ];
}

function buildQueryParameters(): OpenAPIParameter[] {
  return [
    { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Page number' },
    { name: 'pageSize', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Items per page' },
    { name: 'sortField', in: 'query', required: false, schema: { type: 'string' }, description: 'Field key to sort by' },
    { name: 'sortDir', in: 'query', required: false, schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Sort direction' },
    { name: 'search', in: 'query', required: false, schema: { type: 'string' }, description: 'Full-text search term' },
    { name: 'filter', in: 'query', required: false, schema: { type: 'object' }, description: 'Filter object (operators: eq, neq, gt, gte, lt, lte, contains, startsWith, endsWith, in, notIn, isNull, isNotNull)' },
  ];
}

function listResponseSchema(schemaName: string): OpenAPISchema {
  return {
    type: 'object',
    properties: {
      data: { type: 'array', items: { $ref: `#/components/schemas/${schemaName}` } },
      total: { type: 'integer' },
      page: { type: 'integer' },
      pageSize: { type: 'integer' },
      hasMore: { type: 'boolean' },
      meta: {
        type: 'object',
        properties: { requestId: { type: 'string' } },
      },
    },
    required: ['data', 'total', 'page', 'pageSize', 'hasMore'],
  };
}

function itemResponseSchema(schemaName: string): OpenAPISchema {
  return {
    type: 'object',
    properties: {
      data: { $ref: `#/components/schemas/${schemaName}` },
      meta: {
        type: 'object',
        properties: { requestId: { type: 'string' } },
      },
    },
    required: ['data'],
  };
}

function deleteResponseSchema(): OpenAPISchema {
  return {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          deleted: { type: 'boolean', enum: ['true' as unknown as string] },
        },
        required: ['id', 'deleted'],
      },
      meta: {
        type: 'object',
        properties: { requestId: { type: 'string' } },
      },
    },
    required: ['data'],
  };
}

// ── Main function ────────────────────────────────────────────────────────────

export function deriveOpenAPISpec(entity: EntityDefinition): OpenAPISpec {
  const pascal = pascalCase(entity.key);
  const basePath = `/${ENTITY_ROUTE_PREFIX}`;
  const itemPath = `${basePath}/{id}`;

  const pathParams = buildPathParameters();
  const idParam: OpenAPIParameter = {
    name: 'id',
    in: 'path',
    required: true,
    schema: { type: 'string' },
    description: 'Entity record identifier',
  };

  // ── Build entity schema ──────────────────────────────────────────────────

  const entityProperties: Record<string, OpenAPISchema> = {};
  const entityRequired: string[] = ['id'];

  for (const base of BASE_ENTITY_FIELDS) {
    const prop: OpenAPISchema = { type: base.type };
    if (base.format) {
      prop.format = base.format;
    }
    entityProperties[base.key] = prop;
  }

  for (const field of entity.fields) {
    entityProperties[field.key] = mapFieldToSchema(field);
  }

  const entitySchemaName = pascal;

  // ── Build create input schema ────────────────────────────────────────────

  const createFields = deriveCreateFields(entity.fields);
  const createProperties: Record<string, OpenAPISchema> = {};
  const createRequired: string[] = [];

  for (const field of createFields) {
    createProperties[field.key] = mapFieldToSchema(field);
    const rules = field.validation?.fieldRules ?? [];
    const isRequired = rules.some(
      (r) => r.type === 'required',
    );
    if (isRequired) {
      createRequired.push(field.key);
    }
  }

  const createSchemaName = `${pascal}CreateInput`;

  // ── Build update input schema ────────────────────────────────────────────

  const editFields = deriveEditFields(entity.fields);
  const updateProperties: Record<string, OpenAPISchema> = {};

  for (const field of editFields) {
    updateProperties[field.key] = mapFieldToSchema(field);
  }

  const updateSchemaName = `${pascal}UpdateInput`;

  // ── Component schemas ────────────────────────────────────────────────────

  const schemas: Record<string, OpenAPISchema> = {};

  schemas[entitySchemaName] = {
    type: 'object',
    properties: entityProperties,
    required: entityRequired,
  };

  const createSchema: OpenAPISchema = {
    type: 'object',
    properties: createProperties,
  };
  if (createRequired.length > 0) {
    createSchema.required = createRequired;
  }
  schemas[createSchemaName] = createSchema;

  schemas[updateSchemaName] = {
    type: 'object',
    properties: updateProperties,
  };

  // ── Paths ────────────────────────────────────────────────────────────────

  const paths: Record<string, Record<string, OpenAPIOperation>> = {};
  const tag = entity.pluralName;

  // LIST
  const listOp: OpenAPIOperation = {
    operationId: `list${pascal}`,
    summary: `List ${entity.pluralName}`,
    tags: [tag],
    parameters: [...pathParams, ...buildQueryParameters()],
    responses: {
      '200': {
        description: `A paginated list of ${entity.pluralName}`,
        content: { 'application/json': { schema: listResponseSchema(entitySchemaName) } },
      },
    },
  };

  // CREATE
  const createOp: OpenAPIOperation = {
    operationId: `create${pascal}`,
    summary: `Create a ${entity.name}`,
    tags: [tag],
    parameters: [...pathParams],
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { $ref: `#/components/schemas/${createSchemaName}` } } },
    },
    responses: {
      '201': {
        description: `The created ${entity.name}`,
        content: { 'application/json': { schema: itemResponseSchema(entitySchemaName) } },
      },
    },
  };

  paths[basePath] = { get: listOp, post: createOp };

  // GET BY ID
  const getOp: OpenAPIOperation = {
    operationId: `get${pascal}`,
    summary: `Get a ${entity.name} by ID`,
    tags: [tag],
    parameters: [...pathParams, idParam],
    responses: {
      '200': {
        description: `The requested ${entity.name}`,
        content: { 'application/json': { schema: itemResponseSchema(entitySchemaName) } },
      },
      '404': { description: `${entity.name} not found` },
    },
  };

  // UPDATE
  const updateOp: OpenAPIOperation = {
    operationId: `update${pascal}`,
    summary: `Update a ${entity.name}`,
    tags: [tag],
    parameters: [...pathParams, idParam],
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { $ref: `#/components/schemas/${updateSchemaName}` } } },
    },
    responses: {
      '200': {
        description: `The updated ${entity.name}`,
        content: { 'application/json': { schema: itemResponseSchema(entitySchemaName) } },
      },
      '404': { description: `${entity.name} not found` },
    },
  };

  // DELETE
  const deleteOp: OpenAPIOperation = {
    operationId: `delete${pascal}`,
    summary: `Delete a ${entity.name}`,
    tags: [tag],
    parameters: [...pathParams, idParam],
    responses: {
      '200': {
        description: `Deletion confirmation`,
        content: { 'application/json': { schema: deleteResponseSchema() } },
      },
      '404': { description: `${entity.name} not found` },
    },
  };

  paths[itemPath] = { get: getOp, put: updateOp, delete: deleteOp };

  // ── Capability endpoints ─────────────────────────────────────────────────

  if (entity.capabilities) {
    for (const cap of entity.capabilities) {
      const capPascal = pascalCase(cap.key);
      const inputSchema = buildCapabilityInputSchema(cap.inputs);
      const capInputSchemaName = `${pascal}${capPascal}Input`;

      schemas[capInputSchemaName] = inputSchema;

      const capOp: OpenAPIOperation = {
        operationId: `${cap.type}${pascal}${capPascal}`,
        summary: `${pascalCase(cap.type)}: ${cap.key}`,
        tags: [tag],
        parameters: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: `#/components/schemas/${capInputSchemaName}` } } },
        },
        responses: {
          '200': {
            description: `Result of ${cap.type} ${cap.key}`,
            content: { 'application/json': { schema: itemResponseSchema(entitySchemaName) } },
          },
        },
      };

      let capPath: string;

      switch (cap.type) {
        case 'transition':
          capPath = `${itemPath}/transitions/${cap.key}`;
          capOp.parameters = [...pathParams, idParam];
          break;

        case 'mutation':
          capPath = `${itemPath}/mutations/${cap.key}`;
          capOp.parameters = [...pathParams, idParam];
          break;

        case 'workflow':
          if (cap.scope === 'global') {
            capPath = `${basePath}/workflows/${cap.key}`;
            capOp.parameters = [...pathParams];
          } else {
            capPath = `${itemPath}/workflows/${cap.key}`;
            capOp.parameters = [...pathParams, idParam];
          }
          break;

        case 'export':
          if (cap.scope === 'global' || cap.scope === 'selection') {
            capPath = `${basePath}/exports/${cap.key}`;
            capOp.parameters = [...pathParams];
          } else {
            capPath = `${itemPath}/exports/${cap.key}`;
            capOp.parameters = [...pathParams, idParam];
          }
          break;

        case 'integration':
          capPath = `${itemPath}/integrations/${cap.key}`;
          capOp.parameters = [...pathParams, idParam];
          break;

        default:
          continue;
      }

      if (!paths[capPath]) {
        paths[capPath] = {};
      }
      paths[capPath].post = capOp;
    }
  }

  // ── Assemble spec ────────────────────────────────────────────────────────

  return {
    openapi: '3.0.3',
    info: {
      title: `${entity.name} API`,
      version: '1.0.0',
      description: `Auto-generated OpenAPI spec for the ${entity.name} entity.`,
    },
    paths,
    components: { schemas },
  };
}
