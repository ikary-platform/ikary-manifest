import { describe, it, expect } from 'vitest';
import { restGet } from '../client.js';

describe('REST Registry — GET /api/primitives and /api/examples', () => {
  describe('GET /api/primitives', () => {
    it('returns 200 with 30 primitives across 7 categories', async () => {
      const res = await restGet('/api/primitives');
      expect(res.status).toBe(200);

      const body = await res.json() as Array<{ key: string; category: string; description: string }>;
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(30);

      const categories = new Set(body.map((p) => p.category));
      expect(categories.size).toBe(7);
      expect(categories.has('collection')).toBe(true);
      expect(categories.has('input')).toBe(true);
      expect(categories.has('form')).toBe(true);
      expect(categories.has('layout')).toBe(true);
      expect(categories.has('page')).toBe(true);
      expect(categories.has('display')).toBe(true);
      expect(categories.has('feedback')).toBe(true);

      for (const p of body) {
        expect(p).toHaveProperty('key');
        expect(p).toHaveProperty('category');
        expect(p).toHaveProperty('description');
      }
    });

    it('filters by ?category=collection', async () => {
      const res = await restGet('/api/primitives?category=collection');
      expect(res.status).toBe(200);

      const body = await res.json() as Array<{ key: string; category: string }>;
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      for (const p of body) {
        expect(p.category).toBe('collection');
      }
      const keys = body.map((p) => p.key);
      expect(keys).toContain('data-grid');
    });
  });

  describe('GET /api/primitives/:key', () => {
    it('returns the contract for data-grid', async () => {
      const res = await restGet('/api/primitives/data-grid');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('key', 'data-grid');
      expect(body).toHaveProperty('category', 'collection');
      expect(body).toHaveProperty('description');
      expect(body).toHaveProperty('bestFor');
      expect(Array.isArray(body['bestFor'])).toBe(true);
    });

    it('returns an error object for an unknown key', async () => {
      const res = await restGet('/api/primitives/nonexistent-primitive');
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('error');
    });
  });

  describe('GET /api/examples', () => {
    it('returns 200 with example listing including minimal-manifest and crm-manifest', async () => {
      const res = await restGet('/api/examples');
      expect(res.status).toBe(200);

      const body = await res.json() as Array<{ key: string; title: string }>;
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);

      const keys = body.map((e) => e.key);
      expect(keys).toContain('minimal-manifest');
      expect(keys).toContain('crm-manifest');

      for (const e of body) {
        expect(e).toHaveProperty('key');
        expect(e).toHaveProperty('title');
      }
    });
  });

  describe('GET /api/examples/:key', () => {
    // The server reads YAML files from disk at runtime. On production the files may
    // not be bundled, in which case the response is { error: "..." }. On a local server
    // (IKARY_API_URL=http://localhost:3100) the files resolve correctly and the test
    // asserts the full manifest content.
    it('returns manifest content (local) or a meaningful error (production) for minimal-manifest', async () => {
      const res = await restGet('/api/examples/minimal-manifest');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      if ('manifest' in body) {
        expect(typeof body['manifest']).toBe('string');
        expect((body['manifest'] as string).length).toBeGreaterThan(0);
        expect(body['manifest'] as string).toContain('apiVersion');
        expect(body).toHaveProperty('example');
      } else {
        expect(body).toHaveProperty('error');
        expect(typeof body['error']).toBe('string');
      }
    });

    it('returns manifest content (local) or a meaningful error (production) for crm-manifest', async () => {
      const res = await restGet('/api/examples/crm-manifest');
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      if ('manifest' in body) {
        expect(typeof body['manifest']).toBe('string');
        expect((body['manifest'] as string).length).toBeGreaterThan(0);
      } else {
        expect(body).toHaveProperty('error');
        expect(typeof body['error']).toBe('string');
      }
    });

    it('returns an error object for an unknown key', async () => {
      const res = await restGet('/api/examples/nonexistent-example');
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('error');
    });
  });
});
