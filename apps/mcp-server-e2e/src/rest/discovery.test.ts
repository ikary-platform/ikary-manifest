import { describe, it, expect } from 'vitest';
import { restGet } from '../client.js';

describe('REST Discovery — GET /api/schemas', () => {
  describe('GET /api/schemas/manifest', () => {
    it('returns 200 with CellManifestV1 schema shape', async () => {
      const res = await restGet('/api/schemas/manifest');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('name', 'CellManifestV1');
      expect(body).toHaveProperty('version', 'ikary.co/v1alpha1');
      expect(body).toHaveProperty('semanticRules');
      expect(Array.isArray(body['semanticRules'])).toBe(true);
      expect((body['semanticRules'] as unknown[]).length).toBeGreaterThan(0);

      const fields = body['fields'] as Array<{ key: string }>;
      expect(Array.isArray(fields)).toBe(true);
      const fieldKeys = fields.map((f) => f.key);
      expect(fieldKeys).toContain('apiVersion');
      expect(fieldKeys).toContain('kind');
      expect(fieldKeys).toContain('metadata');
      expect(fieldKeys).toContain('spec');
    });

    it('returns the same result for ?version=latest', async () => {
      const [r1, r2] = await Promise.all([
        restGet('/api/schemas/manifest'),
        restGet('/api/schemas/manifest?version=latest'),
      ]);
      const [b1, b2] = await Promise.all([r1.json(), r2.json()]);
      expect(JSON.stringify(b1)).toBe(JSON.stringify(b2));
    });
  });

  describe('GET /api/schemas/entity', () => {
    it('returns 200 with EntityDefinition schema shape', async () => {
      const res = await restGet('/api/schemas/entity');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('name', 'EntityDefinition');
      expect(body).toHaveProperty('semanticRules');

      const fields = body['fields'] as Array<{ key: string; required: boolean }>;
      const fieldKeys = fields.map((f) => f.key);
      expect(fieldKeys).toContain('key');
      expect(fieldKeys).toContain('name');
      expect(fieldKeys).toContain('pluralName');
      expect(fieldKeys).toContain('fields');
    });
  });

  describe('GET /api/schemas/page', () => {
    it('returns 200 with all page types when no filter', async () => {
      const res = await restGet('/api/schemas/page');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('name', 'PageDefinition');
      expect(body).toHaveProperty('pageTypes');

      const pageTypes = body['pageTypes'] as Array<{ type: string }>;
      const types = pageTypes.map((t) => t.type);
      expect(types).toContain('entity-list');
      expect(types).toContain('entity-detail');
      expect(types).toContain('entity-create');
      expect(types).toContain('entity-edit');
      expect(types).toContain('dashboard');
      expect(types).toContain('custom');
    });

    it('returns filtered schema for ?type=entity-list', async () => {
      const res = await restGet('/api/schemas/page?type=entity-list');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('name', 'PageDefinition');
      expect(body).toHaveProperty('pageType');

      const pt = body['pageType'] as { type: string; entityRequired: boolean };
      expect(pt.type).toBe('entity-list');
      expect(pt.entityRequired).toBe(true);
    });

    it('returns an error object for an unknown ?type=', async () => {
      const res = await restGet('/api/schemas/page?type=nonexistent');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('error');
      expect(typeof body['error']).toBe('string');
    });
  });

  describe('GET /api/schemas/capability', () => {
    it('returns 200 with all capability types when no filter', async () => {
      const res = await restGet('/api/schemas/capability');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('name', 'CapabilityDefinition');
      expect(body).toHaveProperty('capabilityTypes');

      const capTypes = body['capabilityTypes'] as Array<{ type: string }>;
      const types = capTypes.map((t) => t.type);
      expect(types).toContain('transition');
      expect(types).toContain('mutation');
      expect(types).toContain('workflow');
      expect(types).toContain('export');
      expect(types).toContain('integration');
    });

    it('returns filtered schema for ?type=transition', async () => {
      const res = await restGet('/api/schemas/capability?type=transition');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('capabilityType');

      const ct = body['capabilityType'] as { type: string };
      expect(ct.type).toBe('transition');
    });

    it('returns an error object for an unknown ?type=', async () => {
      const res = await restGet('/api/schemas/capability?type=nonexistent');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('error');
    });
  });
});
