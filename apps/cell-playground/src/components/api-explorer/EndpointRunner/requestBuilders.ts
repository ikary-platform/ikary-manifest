import type {
  OpenAPIOperation,
  OpenAPISchema,
  OpenAPISpec,
} from '@ikary/cell-engine';

// ── Resolve a $ref schema ─────────────────────────────────────────────────────

export function resolveSchema(
  schema: OpenAPISchema,
  spec: OpenAPISpec,
): OpenAPISchema {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop()!;
    return spec.components.schemas[refName] ?? schema;
  }
  return schema;
}

// ── Generate an example request body from schema ──────────────────────────────

export function generateExampleBody(
  operation: OpenAPIOperation,
  spec: OpenAPISpec,
): string {
  const rawSchema =
    operation.requestBody?.content?.['application/json']?.schema;
  if (!rawSchema) return '{}';

  const schema = resolveSchema(rawSchema, spec);
  const properties = schema.properties;
  if (!properties || Object.keys(properties).length === 0) return '{}';

  const example: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(properties)) {
    const resolved = resolveSchema(prop, spec);

    if (resolved.enum && resolved.enum.length > 0) {
      example[key] = resolved.enum[0];
    } else if (resolved.format === 'date' || resolved.format === 'date-time') {
      example[key] = '2025-01-01';
    } else if (resolved.type === 'string') {
      example[key] = '';
    } else if (resolved.type === 'number' || resolved.type === 'integer') {
      example[key] = 0;
    } else if (resolved.type === 'boolean') {
      example[key] = false;
    } else {
      example[key] = '';
    }
  }

  return JSON.stringify(example, null, 2);
}

// ── Default path parameter values ─────────────────────────────────────────────

export function buildDefaultPathParams(
  operation: OpenAPIOperation,
  entityKey: string,
): Record<string, string> {
  const defaults: Record<string, string> = {};
  const params = operation.parameters ?? [];

  for (const param of params) {
    if (param.in !== 'path') continue;

    switch (param.name) {
      case 'tenantId':
        defaults[param.name] = '00000000-0000-0000-0000-000000000001';
        break;
      case 'workspaceId':
        defaults[param.name] = '00000000-0000-0000-0000-000000000002';
        break;
      case 'cellKey':
        defaults[param.name] = 'playground';
        break;
      case 'entityKey':
        defaults[param.name] = entityKey;
        break;
      case 'id':
        defaults[param.name] = '';
        break;
      default:
        defaults[param.name] = '';
    }
  }

  return defaults;
}
