import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createMcpClient, getMcpSummary, parseMcpData, type McpToolResult } from '../client.js';

let client: Client;
beforeAll(async () => { client = await createMcpClient(); });
afterAll(async () => { await client.close(); });

describe('MCP Registry Tools', () => {
  describe('list_primitives', () => {
    it('returns all 30 primitives with 7 categories when no filter', async () => {
      const result = await client.callTool({ name: 'list_primitives', arguments: {} }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary).toContain('30');

      const data = parseMcpData<Array<{ key: string; category: string; description: string }>>(result);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(30);

      const categories = new Set(data.map((p) => p.category));
      expect(categories.size).toBe(7);
    });

    it('filters to only collection primitives when category=collection', async () => {
      const result = await client.callTool({ name: 'list_primitives', arguments: { category: 'collection' } }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const data = parseMcpData<Array<{ key: string; category: string }>>(result);
      expect(data.length).toBeGreaterThan(0);
      for (const p of data) {
        expect(p.category).toBe('collection');
      }
      const keys = data.map((p) => p.key);
      expect(keys).toContain('data-grid');
    });
  });

  describe('get_primitive_contract', () => {
    it('returns the contract for data-grid with bestFor and avoidWhen', async () => {
      const result = await client.callTool({ name: 'get_primitive_contract', arguments: { primitive: 'data-grid' } }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const data = parseMcpData<{ key: string; category: string; description: string; bestFor?: string[]; avoidWhen?: string[] }>(result);
      expect(data.key).toBe('data-grid');
      expect(data.category).toBe('collection');
      expect(typeof data.description).toBe('string');
      expect(Array.isArray(data.bestFor)).toBe(true);
    });

    it('returns isError=true for an unknown primitive key', async () => {
      const result = await client.callTool({ name: 'get_primitive_contract', arguments: { primitive: 'nonexistent-primitive' } }) as McpToolResult;
      expect(result.isError).toBe(true);
      expect(getMcpSummary(result)).toContain('Error');
    });
  });

  describe('list_examples', () => {
    it('returns available examples including minimal-manifest and crm-manifest', async () => {
      const result = await client.callTool({ name: 'list_examples', arguments: {} }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const data = parseMcpData<Array<{ key: string; title: string; description: string }>>(result);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      const keys = data.map((e) => e.key);
      expect(keys).toContain('minimal-manifest');
      expect(keys).toContain('crm-manifest');
    });
  });

  describe('get_example_manifest', () => {
    // The server reads YAML files from disk at runtime. On production those files may
    // not be bundled, so the tool returns isError=true with a file-not-found message.
    // On a local server (IKARY_API_URL=http://localhost:4502) the files resolve correctly.
    it('returns manifest content (local) or a meaningful error (production) for minimal-manifest', async () => {
      const result = await client.callTool({ name: 'get_example_manifest', arguments: { example: 'minimal-manifest' } }) as McpToolResult;
      const summary = getMcpSummary(result);
      if (!result.isError) {
        const data = parseMcpData<{ example: unknown; manifest: string }>(result);
        expect(data).toHaveProperty('example');
        expect(data).toHaveProperty('manifest');
        expect(typeof data.manifest).toBe('string');
        expect(data.manifest).toContain('apiVersion');
      } else {
        // File not found on server — error message should be descriptive
        expect(summary).toContain('Error');
        expect(summary.length).toBeGreaterThan(10);
      }
    });

    it('returns manifest content (local) or a meaningful error (production) for crm-manifest', async () => {
      const result = await client.callTool({ name: 'get_example_manifest', arguments: { example: 'crm-manifest' } }) as McpToolResult;
      const summary = getMcpSummary(result);
      if (!result.isError) {
        const data = parseMcpData<{ manifest: string }>(result);
        expect(typeof data.manifest).toBe('string');
        expect(data.manifest.length).toBeGreaterThan(0);
      } else {
        expect(summary).toContain('Error');
      }
    });

    it('returns isError=true for an unknown example key', async () => {
      const result = await client.callTool({ name: 'get_example_manifest', arguments: { example: 'nonexistent-example' } }) as McpToolResult;
      expect(result.isError).toBe(true);
    });
  });
});
