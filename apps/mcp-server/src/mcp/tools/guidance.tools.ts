import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GuidanceService } from '../../services/guidance.service';
import { mcpResult, mcpError } from '../helpers';

export function registerGuidanceTools(server: McpServer, guidance: GuidanceService): void {
  server.tool(
    'recommend_manifest_structure',
    'Takes a business goal description and recommends IKARY manifest structure: entities, pages, relations, and navigation. Use this as a starting point before building a manifest.',
    { goal: z.string().min(1).describe('Business goal description (e.g., "I need a simple CRM with companies and contacts")') },
    async ({ goal }) => {
      try {
        const result = guidance.recommendStructure(goal);
        if (result.suggestedEntities.length === 0) {
          return mcpResult(
            'No matching domain template found for this goal. Try being more specific (e.g., "CRM", "ticketing", "inventory", "project management", "HR", "ecommerce").',
          );
        }
        return mcpResult(
          `## Recommended Structure${result.matchedDomain ? ` (${result.matchedDomain})` : ''}\n\n` +
          `**Entities:** ${result.suggestedEntities.map((e) => `\`${e.key}\` (${e.reason})`).join(', ')}\n\n` +
          `**Relations:** ${result.suggestedRelations.map((r) => `\`${r.source}\` → \`${r.target}\` (${r.kind})`).join(', ')}\n\n` +
          `**Pages:** ${result.suggestedPages.length} pages generated\n\n` +
          `Use \`validate_manifest\` to check the final output.`,
          result,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'suggest_page_set_for_entities',
    'Generates a standard CRUD page set (list, detail, create) for the given entity keys, plus a dashboard and navigation structure.',
    { entities: z.array(z.string().min(1)).min(1).describe('Array of entity keys (e.g., ["customer", "order"])') },
    async ({ entities }) => {
      try {
        const result = guidance.suggestPages(entities);
        return mcpResult(
          `## Suggested Pages\n\n` +
          `Generated ${result.pages.length} pages for ${entities.length} entities:\n` +
          result.pages.map((p) => `- \`${p.key}\` (${p.type}) → ${p.path}`).join('\n'),
          result,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'suggest_relations',
    'Analyzes entity definitions and suggests relations between them based on naming patterns and domain knowledge.',
    {
      entities: z.array(z.object({
        key: z.string().min(1).describe('Entity key'),
        fields: z.array(z.string()).optional().describe('Field keys (helps detect belongs_to from _id fields)'),
      })).min(1).describe('Array of entity definitions with optional field keys'),
    },
    async ({ entities }) => {
      try {
        const relations = guidance.suggestRelations(entities);
        if (relations.length === 0) {
          return mcpResult('No relations suggested. Add more entities or include field keys ending in "_id" for better detection.');
        }
        return mcpResult(
          `## Suggested Relations\n\n` +
          relations.map((r) => `- \`${r.source}\` **${r.kind}** \`${r.target}\` — ${r.reason}`).join('\n'),
          relations,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'explain_validation_errors',
    'Takes validation errors and returns actionable explanations with fix suggestions and related tools. Use this after validate_manifest returns errors.',
    {
      errors: z.array(z.object({
        field: z.string().describe('Error field path'),
        message: z.string().describe('Error message'),
      })).min(1).describe('Array of validation errors from validate_manifest'),
    },
    async ({ errors }) => {
      try {
        const explanations = guidance.explainErrors(errors);
        return mcpResult(
          `## Error Explanations\n\n` +
          explanations.map((e) =>
            `### \`${e.path}\`\n**Problem:** ${e.problem}\n**Fix:** ${e.fix}` +
            (e.relatedTools ? `\n**Related tools:** ${e.relatedTools.join(', ')}` : ''),
          ).join('\n\n'),
          explanations,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );
}
