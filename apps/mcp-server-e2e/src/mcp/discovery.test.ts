import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createMcpClient, getMcpSummary, parseMcpData, type McpToolResult } from '../client.js';

let client: Client;
beforeAll(async () => { client = await createMcpClient(); });
afterAll(async () => { await client.close(); });

describe('MCP Discovery Tools', () => {
  describe('tools/list', () => {
    it('exposes all 19 expected tools', async () => {
      const res = await client.listTools();
      const names = res.tools.map((t) => t.name);

      // Discovery
      expect(names).toContain('get_manifest_schema');
      expect(names).toContain('get_entity_definition_schema');
      expect(names).toContain('get_page_schema');
      expect(names).toContain('get_capability_schema');
      // Registry
      expect(names).toContain('list_primitives');
      expect(names).toContain('get_primitive_contract');
      expect(names).toContain('list_examples');
      expect(names).toContain('get_example_manifest');
      // Primitive authoring
      expect(names).toContain('get_primitive_examples');
      expect(names).toContain('scaffold_primitive');
      expect(names).toContain('validate_primitive_props');
      // Guidance
      expect(names).toContain('recommend_manifest_structure');
      expect(names).toContain('suggest_page_set_for_entities');
      expect(names).toContain('suggest_relations');
      expect(names).toContain('explain_validation_errors');
      // Validation
      expect(names).toContain('validate_manifest');
      expect(names).toContain('validate_entity');
      expect(names).toContain('validate_page');
      expect(names).toContain('normalize_manifest');

      expect(names.length).toBe(19);
    });
  });

  describe('get_manifest_schema', () => {
    it('returns CellManifestV1 schema with fields and semantic rules', async () => {
      const result = await client.callTool({ name: 'get_manifest_schema', arguments: {} }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const summary = getMcpSummary(result);
      expect(summary).toContain('CellManifestV1');
      expect(summary).toContain('apiVersion');

      const data = parseMcpData<{ name: string; version: string; fields: Array<{ key: string }>; semanticRules: string[] }>(result);
      expect(data.name).toBe('CellManifestV1');
      expect(data.version).toBe('ikary.co/v1alpha1');
      expect(data.fields.map((f) => f.key)).toContain('spec');
      expect(data.semanticRules.length).toBeGreaterThan(0);
    });

    it('accepts an optional version param without error', async () => {
      const result = await client.callTool({ name: 'get_manifest_schema', arguments: { version: 'latest' } }) as McpToolResult;
      expect(result.isError).toBeFalsy();
    });
  });

  describe('get_entity_definition_schema', () => {
    it('returns EntityDefinition schema with required fields', async () => {
      const result = await client.callTool({ name: 'get_entity_definition_schema', arguments: {} }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const data = parseMcpData<{ name: string; fields: Array<{ key: string }> }>(result);
      expect(data.name).toBe('EntityDefinition');
      const fieldKeys = data.fields.map((f) => f.key);
      expect(fieldKeys).toContain('key');
      expect(fieldKeys).toContain('name');
      expect(fieldKeys).toContain('pluralName');
      expect(fieldKeys).toContain('fields');
    });
  });

  describe('get_page_schema', () => {
    it('returns all page types with no filter', async () => {
      const result = await client.callTool({ name: 'get_page_schema', arguments: {} }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const data = parseMcpData<{ name: string; pageTypes: Array<{ type: string }> }>(result);
      expect(data.name).toBe('PageDefinition');
      const types = data.pageTypes.map((t) => t.type);
      expect(types).toContain('entity-list');
      expect(types).toContain('dashboard');
      expect(types).toContain('custom');
    });

    it('filters to a single page type when pageType is provided', async () => {
      const result = await client.callTool({ name: 'get_page_schema', arguments: { pageType: 'entity-detail' } }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const data = parseMcpData<{ pageType: { type: string; entityRequired: boolean } }>(result);
      expect(data.pageType.type).toBe('entity-detail');
      expect(data.pageType.entityRequired).toBe(true);
    });

    it('returns isError=true for an unknown pageType', async () => {
      const result = await client.callTool({ name: 'get_page_schema', arguments: { pageType: 'not-a-type' } }) as McpToolResult;
      expect(result.isError).toBe(true);
      expect(getMcpSummary(result)).toContain('Error');
    });
  });

  describe('get_capability_schema', () => {
    it('returns all capability types with no filter', async () => {
      const result = await client.callTool({ name: 'get_capability_schema', arguments: {} }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const data = parseMcpData<{ name: string; capabilityTypes: Array<{ type: string }> }>(result);
      expect(data.name).toBe('CapabilityDefinition');
      const types = data.capabilityTypes.map((t) => t.type);
      expect(types).toContain('transition');
      expect(types).toContain('export');
      expect(types).toContain('integration');
    });

    it('filters to a single capability type when capabilityType is provided', async () => {
      const result = await client.callTool({ name: 'get_capability_schema', arguments: { capabilityType: 'workflow' } }) as McpToolResult;
      expect(result.isError).toBeFalsy();

      const data = parseMcpData<{ capabilityType: { type: string } }>(result);
      expect(data.capabilityType.type).toBe('workflow');
    });

    it('returns isError=true for an unknown capabilityType', async () => {
      const result = await client.callTool({ name: 'get_capability_schema', arguments: { capabilityType: 'not-a-type' } }) as McpToolResult;
      expect(result.isError).toBe(true);
    });
  });
});
