import { describe, it, expect } from 'vitest';
import { entityBaseUrl, entityItemUrl } from './routes';
import { entityListResponseSchema, entityItemResponseSchema } from './entity-response.contract';
import { entityListQuerySchema, filterGroupSchema } from './entity-list-query.contract';
import { z } from 'zod';

const params = {
  tenantId: 't1',
  workspaceId: 'w1',
  cellKey: 'crm',
  entityKey: 'contact',
};

describe('entityBaseUrl', () => {
  it('builds the collection URL', () => {
    expect(entityBaseUrl(params)).toBe('/v1/tenants/t1/workspaces/w1/cells/crm/entities/contact');
  });

  it('prepends apiBase when provided', () => {
    expect(entityBaseUrl(params, 'https://api.example.com')).toBe(
      'https://api.example.com/v1/tenants/t1/workspaces/w1/cells/crm/entities/contact',
    );
  });
});

describe('entityItemUrl', () => {
  it('builds the item URL with id', () => {
    expect(entityItemUrl({ ...params, id: 'abc-123' })).toBe(
      '/v1/tenants/t1/workspaces/w1/cells/crm/entities/contact/abc-123',
    );
  });

  it('prepends apiBase when provided', () => {
    expect(entityItemUrl({ ...params, id: 'abc' }, 'https://api.example.com')).toContain(
      'https://api.example.com',
    );
  });
});

describe('entityListResponseSchema', () => {
  it('validates a list response with a string row schema', () => {
    const schema = entityListResponseSchema(z.object({ name: z.string() }));
    const result = schema.safeParse({
      data: [{ name: 'Alice' }],
      total: 1,
      page: 1,
      pageSize: 20,
      hasMore: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid data shape', () => {
    const schema = entityListResponseSchema(z.object({ name: z.string() }));
    expect(schema.safeParse({ data: 'not-an-array', total: 1, page: 1, pageSize: 20, hasMore: false }).success).toBe(false);
  });
});

describe('entityItemResponseSchema', () => {
  it('validates a single-item response', () => {
    const schema = entityItemResponseSchema(z.object({ id: z.string() }));
    const result = schema.safeParse({ data: { id: 'abc' } });
    expect(result.success).toBe(true);
  });
});

describe('entityListQuerySchema', () => {
  it('parses query with defaults', () => {
    const result = entityListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
    expect(result.data?.pageSize).toBe(20);
  });

  it('parses a string-encoded filter (JSON.parse branch)', () => {
    const filter = JSON.stringify({ logic: 'and', rules: [{ field: 'name', operator: 'eq', value: 'Alice' }] });
    const result = entityListQuerySchema.safeParse({ filter });
    expect(result.success).toBe(true);
  });

  it('parses a nested filterGroup (z.lazy recursion)', () => {
    const filter = {
      logic: 'and',
      rules: [
        { logic: 'or', rules: [{ field: 'status', operator: 'eq', value: 'active' }] },
      ],
    };
    const result = filterGroupSchema.safeParse(filter);
    expect(result.success).toBe(true);
  });

  it('passes through an already-parsed object filter (non-string branch)', () => {
    const filter = { logic: 'and', rules: [{ field: 'name', operator: 'eq', value: 'Alice' }] };
    const result = entityListQuerySchema.safeParse({ filter });
    expect(result.success).toBe(true);
  });
});
