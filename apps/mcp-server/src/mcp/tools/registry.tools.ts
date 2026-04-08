import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { RegistryService } from '../../services/registry.service';
import { mcpResult, mcpError } from '../helpers';

export function registerRegistryTools(server: McpServer, registry: RegistryService): void {
  server.tool(
    'list_primitives',
    'Returns the catalog of 30 IKARY UI primitives with categories and descriptions. Use this to discover available UI components for page layouts.',
    { category: z.string().optional().describe('Filter by category (collection, input, form, layout, page, display, feedback)') },
    async ({ category }) => {
      try {
        const primitives = registry.listPrimitives(category);
        const summary = category
          ? `Found ${primitives.length} primitives in category "${category}".`
          : `${primitives.length} UI primitives available across ${new Set(primitives.map((p) => p.category)).size} categories.`;
        return mcpResult(
          `## UI Primitives\n\n${summary}\n\n` +
          primitives.map((p) => `- **${p.key}** (${p.category}) — ${p.description}`).join('\n'),
          primitives,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'get_primitive_contract',
    'Returns the presentation contract for one UI primitive, including props, best-for hints, and avoid-when guidance.',
    { primitive: z.string().min(1).describe('Primitive key (e.g., "data-grid", "form", "card-list")') },
    async ({ primitive }) => {
      try {
        const contract = registry.getPrimitiveContract(primitive);
        if ('error' in contract) return mcpError(contract.error);
        return mcpResult(
          `## Primitive: ${contract.key}\n\n` +
          `**Category:** ${contract.category}\n` +
          `**Description:** ${contract.description}\n` +
          (contract.bestFor ? `**Best for:** ${contract.bestFor.join(', ')}\n` : '') +
          (contract.avoidWhen ? `**Avoid when:** ${contract.avoidWhen.join(', ')}\n` : ''),
          contract,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'list_examples',
    'Returns available sample manifests from the IKARY examples catalog. Use get_example_manifest to retrieve the full content.',
    {},
    async () => {
      try {
        const examples = registry.listExamples();
        return mcpResult(
          `## Example Manifests\n\n` +
          examples.map((e) => `- **${e.key}** — ${e.title}: ${e.description}`).join('\n'),
          examples,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'get_example_manifest',
    'Returns the full content of one example manifest. Use list_examples first to discover available examples.',
    { example: z.string().min(1).describe('Example key (e.g., "crm-manifest", "minimal-manifest")') },
    async ({ example }) => {
      try {
        const result = registry.getExampleManifest(example);
        if ('error' in result) return mcpError(result.error);
        return mcpResult(
          `## Example: ${example}\n\nFull manifest content below.`,
          result,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );
}
