import { describe, it, expect } from 'vitest';
import { restPost } from '../client.js';
import {
  MINIMAL_MANIFEST,
  MINIMAL_ENTITY,
  MINIMAL_PAGE,
  INVALID_MANIFEST,
} from '../fixtures.js';

describe('REST Validation — POST /api/validate', () => {
  describe('POST /api/validate/manifest', () => {
    it('returns valid=true for a correct manifest', async () => {
      const res = await restPost('/api/validate/manifest', { manifest: MINIMAL_MANIFEST });
      expect(res.status).toBe(201);

      const body = await res.json() as { valid: boolean; errors: unknown[] };
      expect(body).toHaveProperty('valid', true);
      expect(body.errors).toHaveLength(0);
    });

    it('returns valid=false with errors for an invalid manifest', async () => {
      const res = await restPost('/api/validate/manifest', { manifest: INVALID_MANIFEST });
      expect(res.status).toBe(201);

      const body = await res.json() as { valid: boolean; errors: Array<{ field: string; message: string }> };
      expect(body).toHaveProperty('valid', false);
      expect(body.errors.length).toBeGreaterThan(0);
      for (const err of body.errors) {
        expect(err).toHaveProperty('field');
        expect(err).toHaveProperty('message');
      }
    });
  });

  describe('POST /api/validate/entity', () => {
    it('returns valid=true for a correct entity', async () => {
      const res = await restPost('/api/validate/entity', { entity: MINIMAL_ENTITY });
      expect(res.status).toBe(201);

      const body = await res.json() as { valid: boolean; errors: unknown[] };
      expect(body).toHaveProperty('valid', true);
      expect(body.errors).toHaveLength(0);
    });

    it('returns valid=false with errors for an empty object', async () => {
      const res = await restPost('/api/validate/entity', { entity: {} });
      expect(res.status).toBe(201);

      const body = await res.json() as { valid: boolean; errors: unknown[] };
      expect(body).toHaveProperty('valid', false);
      expect(body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/validate/page', () => {
    it('returns valid=true for a correct page', async () => {
      const res = await restPost('/api/validate/page', { page: MINIMAL_PAGE });
      expect(res.status).toBe(201);

      const body = await res.json() as { valid: boolean; errors: unknown[] };
      expect(body).toHaveProperty('valid', true);
      expect(body.errors).toHaveLength(0);
    });

    it('returns valid=false for a page missing required fields', async () => {
      const res = await restPost('/api/validate/page', { page: { key: 'x' } });
      expect(res.status).toBe(201);

      const body = await res.json() as { valid: boolean; errors: unknown[] };
      expect(body).toHaveProperty('valid', false);
      expect(body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/validate/normalize', () => {
    it('returns valid=true and the normalized manifest for a valid input', async () => {
      const res = await restPost('/api/validate/normalize', { manifest: MINIMAL_MANIFEST });
      expect(res.status).toBe(201);

      const body = await res.json() as { valid: boolean; manifest?: unknown; errors: unknown[] };
      expect(body).toHaveProperty('valid', true);
      expect(body).toHaveProperty('manifest');
      expect(body.manifest).toHaveProperty('apiVersion');
      expect(body.manifest).toHaveProperty('kind');
    });

    it('returns valid=false with errors for an invalid manifest', async () => {
      const res = await restPost('/api/validate/normalize', { manifest: INVALID_MANIFEST });
      expect(res.status).toBe(201);

      const body = await res.json() as { valid: boolean; errors: unknown[] };
      expect(body).toHaveProperty('valid', false);
      expect(body.errors.length).toBeGreaterThan(0);
    });
  });
});
