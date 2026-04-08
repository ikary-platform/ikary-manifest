import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createMcpClient, getMcpSummary, parseMcpData, type McpToolResult } from '../client.js';
import { SAMPLE_ERRORS, RELATION_ENTITIES } from '../fixtures.js';

let client: Client;
beforeAll(async () => { client = await createMcpClient(); });
afterAll(async () => { await client.close(); });

describe('MCP Guidance Tools', () => {
  describe('recommend_manifest_structure', () => {
    it('returns a structure recommendation for a known domain goal', async () => {
      const result = await client.callTool({
        name: 'recommend_manifest_structure',
        arguments: { goal: 'I need a simple CRM with customers and contacts' },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary).toContain('Recommended Structure');

      const data = parseMcpData<{
        matchedDomain?: string;
        suggestedEntities: Array<{ key: string; reason: string }>;
        suggestedPages: unknown[];
        suggestedRelations: unknown[];
      }>(result);
      expect(data.suggestedEntities.length).toBeGreaterThan(0);
      expect(data.suggestedEntities[0]).toHaveProperty('key');
      expect(data.suggestedEntities[0]).toHaveProperty('reason');
      expect(Array.isArray(data.suggestedPages)).toBe(true);
    });

    it('returns a no-match summary (no data block) for an unrecognized goal', async () => {
      const result = await client.callTool({
        name: 'recommend_manifest_structure',
        arguments: { goal: 'xyzzy42 unrecognized domain xyz' },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary.toLowerCase()).toContain('no matching domain template');
      // No match: mcpResult(text) — no data block
      expect(result.content.length).toBe(1);
    });
  });

  describe('suggest_page_set_for_entities', () => {
    it('generates a page set including dashboard and entity-list for each entity', async () => {
      const result = await client.callTool({
        name: 'suggest_page_set_for_entities',
        arguments: { entities: ['customer', 'order'] },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary).toContain('Suggested Pages');

      const data = parseMcpData<{ pages: Array<{ key: string; type: string; path: string }> }>(result);
      expect(data.pages.length).toBeGreaterThan(0);

      const types = data.pages.map((p) => p.type);
      expect(types).toContain('dashboard');
      expect(types).toContain('entity-list');

      for (const page of data.pages) {
        expect(page.path).toMatch(/^\//);
      }
    });
  });

  describe('suggest_relations', () => {
    it('suggests a belongs_to relation from order to customer via customer_id field', async () => {
      const result = await client.callTool({
        name: 'suggest_relations',
        arguments: { entities: RELATION_ENTITIES as unknown as Array<{ key: string; fields?: string[] }> },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary).toContain('Suggested Relations');

      const data = parseMcpData<Array<{ source: string; target: string; kind: string; reason: string }>>(result);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      const relation = data.find((r) => r.source === 'order' && r.target === 'customer');
      expect(relation).toBeDefined();
      expect(relation?.kind).toBe('belongs_to');
    });

    it('returns a no-relations summary (no data block) for a single entity', async () => {
      const result = await client.callTool({
        name: 'suggest_relations',
        arguments: { entities: [{ key: 'standalone' }] },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary.toLowerCase()).toContain('no relations suggested');
      // No relations: mcpResult(text) — no data block
      expect(result.content.length).toBe(1);
    });
  });

  describe('explain_validation_errors', () => {
    it('returns explanations with path, problem, and fix for each error', async () => {
      const result = await client.callTool({
        name: 'explain_validation_errors',
        arguments: { errors: SAMPLE_ERRORS as unknown as Array<{ field: string; message: string }> },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary).toContain('Error Explanations');

      const data = parseMcpData<Array<{ path: string; problem: string; fix: string }>>(result);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      for (const explanation of data) {
        expect(explanation).toHaveProperty('path');
        expect(explanation).toHaveProperty('problem');
        expect(explanation).toHaveProperty('fix');
      }
    });
  });
});
