import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DiscoveryService } from '../../services/discovery.service';
import { mcpResult, mcpError } from '../helpers';

export function registerDiscoveryTools(server: McpServer, discovery: DiscoveryService): void {
  server.tool(
    'get_manifest_schema',
    'Returns the canonical top-level CellManifestV1 structure with fields, types, and semantic rules. Use this to understand the manifest shape before generating one.',
    { version: z.string().optional().describe('Schema version (default: "latest")') },
    async ({ version }) => {
      try {
        const schema = discovery.getManifestSchema(version);
        return mcpResult(
          `## CellManifestV1 Schema\n\n` +
          `**Version:** ${schema.version}\n\n` +
          `**Root fields:** ${schema.fields.map((f) => `\`${f.key}\` (${f.type}${f.required ? ', required' : ''})`).join(', ')}\n\n` +
          `**Spec fields:** ${schema.spec.map((f) => `\`${f.key}\` (${f.type}${f.required ? ', required' : ''})`).join(', ')}\n\n` +
          `**Semantic rules:**\n${schema.semanticRules.map((r) => `- ${r}`).join('\n')}`,
          schema,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'get_entity_definition_schema',
    'Returns the EntityDefinition contract with fields, nested structures, and semantic rules. Use this when building entity definitions.',
    { version: z.string().optional().describe('Schema version (default: "latest")') },
    async ({ version }) => {
      try {
        const schema = discovery.getEntitySchema(version);
        return mcpResult(
          `## EntityDefinition Schema\n\n` +
          `**Fields:** ${schema.fields.map((f) => `\`${f.key}\` (${f.type}${f.required ? ', required' : ''})`).join(', ')}\n\n` +
          `**Semantic rules:**\n${schema.semanticRules.map((r) => `- ${r}`).join('\n')}`,
          schema,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'get_page_schema',
    'Returns allowed page types and their contracts. Optionally filter by page type.',
    { pageType: z.string().optional().describe('Filter by page type (entity-list, entity-detail, entity-create, entity-edit, dashboard, custom)') },
    async ({ pageType }) => {
      try {
        const schema = discovery.getPageSchema(pageType as string | undefined);
        if ('error' in schema) return mcpError(schema.error as string);
        return mcpResult(
          `## PageDefinition Schema\n\n` +
          `**Fields:** ${schema.fields.map((f) => `\`${f.key}\` (${f.type}${f.required ? ', required' : ''})`).join(', ')}\n\n` +
          `**Semantic rules:**\n${schema.semanticRules.map((r) => `- ${r}`).join('\n')}`,
          schema,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'get_capability_schema',
    'Returns the CapabilityDefinition contract. Optionally filter by capability type (transition, mutation, workflow, export, integration).',
    { capabilityType: z.string().optional().describe('Filter by capability type') },
    async ({ capabilityType }) => {
      try {
        const schema = discovery.getCapabilitySchema(capabilityType as string | undefined);
        if ('error' in schema) return mcpError(schema.error as string);
        return mcpResult(
          `## CapabilityDefinition Schema\n\n` +
          `**Fields:** ${schema.fields.map((f) => `\`${f.key}\` (${f.type}${f.required ? ', required' : ''})`).join(', ')}\n\n` +
          `**Semantic rules:**\n${schema.semanticRules.map((r) => `- ${r}`).join('\n')}`,
          schema,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );
}
