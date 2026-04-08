import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createMcpClient, getMcpSummary, parseMcpData, type McpToolResult } from '../client.js';
import {
  MINIMAL_MANIFEST,
  MINIMAL_ENTITY,
  MINIMAL_PAGE,
  INVALID_MANIFEST,
} from '../fixtures.js';

let client: Client;
beforeAll(async () => { client = await createMcpClient(); });
afterAll(async () => { await client.close(); });

describe('MCP Validation Tools', () => {
  describe('validate_manifest', () => {
    it('returns valid summary for a correct manifest (no data block)', async () => {
      const result = await client.callTool({
        name: 'validate_manifest',
        arguments: { manifest: MINIMAL_MANIFEST as unknown as Record<string, unknown> },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary.toLowerCase()).toContain('valid');
      // Valid path: mcpResult(summary) — no data block
      expect(result.content.length).toBe(1);
    });

    it('returns invalid summary with error data for a bad manifest', async () => {
      const result = await client.callTool({
        name: 'validate_manifest',
        arguments: { manifest: INVALID_MANIFEST as unknown as Record<string, unknown> },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary.toLowerCase()).toContain('invalid');

      const data = parseMcpData<{ valid: boolean; errors: Array<{ field: string; message: string }> }>(result);
      expect(data.valid).toBe(false);
      expect(data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validate_entity', () => {
    it('returns valid summary for a correct entity', async () => {
      const result = await client.callTool({
        name: 'validate_entity',
        arguments: { entity: MINIMAL_ENTITY as unknown as Record<string, unknown> },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary.toLowerCase()).toContain('valid');
      expect(result.content.length).toBe(1);
    });

    it('returns invalid summary with errors for an empty object', async () => {
      const result = await client.callTool({
        name: 'validate_entity',
        arguments: { entity: {} },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary.toLowerCase()).toContain('invalid');

      const data = parseMcpData<{ valid: boolean; errors: unknown[] }>(result);
      expect(data.valid).toBe(false);
      expect(data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validate_page', () => {
    it('returns valid summary for a correct page', async () => {
      const result = await client.callTool({
        name: 'validate_page',
        arguments: { page: MINIMAL_PAGE as unknown as Record<string, unknown> },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary.toLowerCase()).toContain('valid');
      expect(result.content.length).toBe(1);
    });

    it('returns invalid summary with errors for a page missing required fields', async () => {
      const result = await client.callTool({
        name: 'validate_page',
        arguments: { page: { key: 'x' } },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary.toLowerCase()).toContain('invalid');

      const data = parseMcpData<{ valid: boolean; errors: unknown[] }>(result);
      expect(data.valid).toBe(false);
      expect(data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('normalize_manifest', () => {
    it('returns the compiled manifest object for a valid input', async () => {
      const result = await client.callTool({
        name: 'normalize_manifest',
        arguments: { manifest: MINIMAL_MANIFEST as unknown as Record<string, unknown> },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary.toLowerCase()).toContain('normalized');

      // normalize_manifest returns result.manifest (the object) as data, not the full result wrapper
      const manifest = parseMcpData<Record<string, unknown>>(result);
      expect(manifest).toHaveProperty('apiVersion');
      expect(manifest).toHaveProperty('kind', 'Cell');
    });

    it('returns error data for an invalid manifest', async () => {
      const result = await client.callTool({
        name: 'normalize_manifest',
        arguments: { manifest: INVALID_MANIFEST as unknown as Record<string, unknown> },
      }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary.toLowerCase()).toContain('error');

      const data = parseMcpData<{ valid: boolean; errors: unknown[] }>(result);
      expect(data.valid).toBe(false);
      expect(data.errors.length).toBeGreaterThan(0);
    });
  });
});
