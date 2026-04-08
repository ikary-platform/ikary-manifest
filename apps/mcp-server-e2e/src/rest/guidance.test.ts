import { describe, it, expect } from 'vitest';
import { restPost } from '../client.js';
import { SAMPLE_ERRORS, RELATION_ENTITIES } from '../fixtures.js';

describe('REST Guidance — POST /api/guidance', () => {
  describe('POST /api/guidance/recommend', () => {
    it('returns a structure recommendation for a known domain goal', async () => {
      const res = await restPost('/api/guidance/recommend', {
        goal: 'I need a simple CRM with customers and contacts',
      });
      expect(res.status).toBe(201);

      const body = await res.json() as {
        matchedDomain?: string;
        suggestedEntities: Array<{ key: string; reason: string }>;
        suggestedPages: unknown[];
        suggestedRelations: unknown[];
      };
      expect(body).toHaveProperty('suggestedEntities');
      expect(Array.isArray(body.suggestedEntities)).toBe(true);
      expect(body.suggestedEntities.length).toBeGreaterThan(0);
      expect(body.suggestedEntities[0]).toHaveProperty('key');
      expect(body.suggestedEntities[0]).toHaveProperty('reason');

      expect(body).toHaveProperty('suggestedPages');
      expect(Array.isArray(body.suggestedPages)).toBe(true);
    });

    it('returns empty suggestedEntities for an unrecognized goal', async () => {
      const res = await restPost('/api/guidance/recommend', {
        goal: 'xyzzy42 unrecognized domain xyz',
      });
      expect(res.status).toBe(201);

      const body = await res.json() as { suggestedEntities: unknown[] };
      expect(body).toHaveProperty('suggestedEntities');
      expect(body.suggestedEntities).toHaveLength(0);
    });
  });

  describe('POST /api/guidance/suggest-pages', () => {
    it('generates a page set for the given entities', async () => {
      const res = await restPost('/api/guidance/suggest-pages', {
        entities: ['customer', 'order'],
      });
      expect(res.status).toBe(201);

      const body = await res.json() as { pages: Array<{ key: string; type: string; path: string }> };
      expect(body).toHaveProperty('pages');
      expect(Array.isArray(body.pages)).toBe(true);
      expect(body.pages.length).toBeGreaterThan(0);

      for (const page of body.pages) {
        expect(page).toHaveProperty('key');
        expect(page).toHaveProperty('type');
        expect(page).toHaveProperty('path');
        expect(page.path).toMatch(/^\//);
      }

      const types = body.pages.map((p) => p.type);
      expect(types).toContain('dashboard');
      expect(types).toContain('entity-list');
    });
  });

  describe('POST /api/guidance/suggest-relations', () => {
    it('suggests a belongs_to relation from order to customer via customer_id field', async () => {
      const res = await restPost('/api/guidance/suggest-relations', {
        entities: RELATION_ENTITIES,
      });
      expect(res.status).toBe(201);

      const body = await res.json() as Array<{ source: string; target: string; kind: string; reason: string }>;
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);

      const relation = body.find((r) => r.source === 'order' && r.target === 'customer');
      expect(relation).toBeDefined();
      expect(relation?.kind).toBe('belongs_to');
    });

    it('returns an empty array for a single entity with no cross-references', async () => {
      const res = await restPost('/api/guidance/suggest-relations', {
        entities: [{ key: 'standalone' }],
      });
      expect(res.status).toBe(201);

      const body = await res.json() as unknown[];
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(0);
    });
  });

  describe('POST /api/guidance/explain-errors', () => {
    it('returns explanations with path, problem, and fix for each error', async () => {
      const res = await restPost('/api/guidance/explain-errors', {
        errors: SAMPLE_ERRORS,
      });
      expect(res.status).toBe(201);

      const body = await res.json() as Array<{ path: string; problem: string; fix: string }>;
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);

      for (const explanation of body) {
        expect(explanation).toHaveProperty('path');
        expect(explanation).toHaveProperty('problem');
        expect(explanation).toHaveProperty('fix');
      }
    });
  });
});
