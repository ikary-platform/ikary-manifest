import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ValidationService } from '../../services/validation.service';
import { mcpResult, mcpError } from '../helpers';

export function registerValidationTools(server: McpServer, validation: ValidationService): void {
  server.tool(
    'validate_manifest',
    'Validates a full CellManifestV1 JSON against the schema and semantic business rules. Returns errors if invalid.',
    { manifest: z.record(z.unknown()).describe('The manifest object to validate') },
    async ({ manifest }) => {
      try {
        const result = validation.validateManifest(manifest);
        if (result.valid) {
          return mcpResult('Manifest is valid. No errors found.');
        }
        return mcpResult(
          `Manifest is **invalid**. ${result.errors.length} error(s):\n\n` +
          result.errors.map((e) => `- \`${e.field}\`: ${e.message}`).join('\n') +
          '\n\nUse `explain_validation_errors` for detailed fix guidance.',
          result,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'validate_entity',
    'Validates a single EntityDefinition in isolation (structural + semantic). Useful for checking an entity before adding it to a manifest.',
    { entity: z.record(z.unknown()).describe('The entity definition object to validate') },
    async ({ entity }) => {
      try {
        const result = validation.validateEntity(entity);
        if (result.valid) {
          return mcpResult('Entity is valid. No errors found.');
        }
        return mcpResult(
          `Entity is **invalid**. ${result.errors.length} error(s):\n\n` +
          result.errors.map((e) => `- \`${e.field}\`: ${e.message}`).join('\n'),
          result,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'validate_page',
    'Validates a single PageDefinition against the schema. Checks structure, page type, and entity binding.',
    { page: z.record(z.unknown()).describe('The page definition object to validate') },
    async ({ page }) => {
      try {
        const result = validation.validatePage(page);
        if (result.valid) {
          return mcpResult('Page definition is valid. No errors found.');
        }
        return mcpResult(
          `Page is **invalid**. ${result.errors.length} error(s):\n\n` +
          result.errors.map((e) => `- \`${e.field}\`: ${e.message}`).join('\n'),
          result,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'normalize_manifest',
    'Compiles and normalizes a manifest: validates, fills missing defaults, and resolves omitted arrays. Returns the normalized manifest if valid.',
    { manifest: z.record(z.unknown()).describe('The manifest object to compile and normalize') },
    async ({ manifest }) => {
      try {
        const result = validation.normalizeManifest(manifest);
        if (result.valid) {
          return mcpResult(
            'Manifest compiled and normalized successfully.',
            result.manifest,
          );
        }
        return mcpResult(
          `Manifest could not be normalized. ${result.errors.length} error(s):\n\n` +
          result.errors.map((e) => `- \`${e.field}\`: ${e.message}`).join('\n'),
          result,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );
}
