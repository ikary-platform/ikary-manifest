import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { RegistryService } from '../../services/registry.service';
import { mcpResult, mcpError } from '../helpers';

export function registerRegistryTools(server: McpServer, registry: RegistryService): void {
  server.tool(
    'list_primitives',
    'Returns the catalog of IKARY UI primitives with categories and descriptions. Includes core primitives and any custom primitives registered in ikary-primitives.yaml. Use this to discover available UI components for page layouts.',
    {
      category: z.string().optional().describe('Filter by category (collection, input, form, layout, page, display, feedback, data, navigation, feedback, custom)'),
      source: z.enum(['core', 'custom', 'all']).optional().describe('Filter by source: "core" (built-in), "custom" (from ikary-primitives.yaml), or "all" (default)'),
    },
    async ({ category, source }) => {
      try {
        const primitives = registry.listPrimitives({ category, source });
        const summary = category
          ? `Found ${primitives.length} primitives in category "${category}".`
          : `${primitives.length} UI primitives available across ${new Set(primitives.map((p) => p.category)).size} categories.`;
        return mcpResult(
          `## UI Primitives\n\n${summary}\n\n` +
          primitives.map((p) => {
            const src = 'source' in p ? ` [${p.source}]` : ' [core]';
            const ver = 'version' in p && (p as { version?: string }).version ? ` v${(p as { version?: string }).version}` : '';
            return `- **${p.key}**${ver} (${p.category})${src} — ${p.description}`;
          }).join('\n'),
          primitives,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'get_primitive_contract',
    'Returns the full contract for one UI primitive, including props schema, types, descriptions, best-for hints, and avoid-when guidance. For custom primitives, returns the full .contract.yaml content.',
    { primitive: z.string().min(1).describe('Primitive key (e.g., "data-grid", "form", "my-scheduler")') },
    async ({ primitive }) => {
      try {
        const contract = registry.getPrimitiveContract(primitive);
        if ('error' in contract) return mcpError(contract.error);

        // Custom primitive with full contract schema
        if ('source' in contract && contract.source === 'custom' && 'contract' in contract && contract.contract) {
          const c = contract.contract;
          const propsText = Object.entries(c.props.properties)
            .map(([k, v]) => `  - **${k}** (${v.type})${v.required ? ' *required*' : ''}${v.description ? `: ${v.description}` : ''}`)
            .join('\n');
          return mcpResult(
            `## Primitive: ${c.key} v${c.version} [custom]\n\n` +
            `**Label:** ${c.label}\n` +
            `**Category:** ${c.category}\n` +
            (c.description ? `**Description:** ${c.description}\n` : '') +
            (c.breakingChanges.length > 0 ? `**Breaking changes from:** ${c.breakingChanges.join(', ')}\n` : '') +
            `\n**Props:**\n${propsText || '  (no props defined)'}`,
            contract,
          );
        }

        // Core primitive
        return mcpResult(
          `## Primitive: ${contract.key}\n\n` +
          `**Category:** ${contract.category}\n` +
          `**Description:** ${contract.description}\n` +
          ('bestFor' in contract && contract.bestFor ? `**Best for:** ${contract.bestFor.join(', ')}\n` : '') +
          ('avoidWhen' in contract && contract.avoidWhen ? `**Avoid when:** ${contract.avoidWhen.join(', ')}\n` : ''),
          contract,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'get_primitive_examples',
    'Returns example prop scenarios for a custom UI primitive from its .example.ts file. Use this to understand how to use a primitive or to seed the Primitive Studio with test data.',
    { key: z.string().min(1).describe('Primitive key (must be a custom primitive in ikary-primitives.yaml)') },
    async ({ key }) => {
      try {
        const result = registry.getPrimitiveExamples(key);
        if (!Array.isArray(result) && 'error' in result) return mcpError(result.error);
        return mcpResult(
          `## Examples for primitive: ${key}\n\nFound ${(result as unknown[]).length} example file(s).`,
          result,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'scaffold_primitive',
    'Creates a new custom primitive scaffold in the current project directory — equivalent to `ikary primitive add`. Generates 6 files (component, schema, contract, resolver, register, examples) and updates ikary-primitives.yaml.',
    {
      name: z.string().min(1).regex(/^[a-z][a-z0-9-]*$/).describe('Primitive key (lowercase, hyphens, e.g. "my-widget")'),
      label: z.string().min(1).describe('Human-readable display label (e.g. "My Widget")'),
      description: z.string().optional().describe('Short description of what this primitive does'),
      category: z.enum(['data', 'form', 'layout', 'feedback', 'navigation', 'custom']).optional().describe('Primitive category (default: "custom")'),
    },
    async ({ name, label, description, category }) => {
      try {
        const result = registry.scaffoldPrimitive({ name, label, description, category });
        if ('error' in result) return mcpError(result.error);

        return mcpResult(
          `## Scaffolded primitive: ${name}\n\n` +
          `Created ${result.createdFiles.length} files:\n` +
          result.createdFiles.map((f) => `- \`${f}\``).join('\n') +
          (result.configUpdated ? '\n\n`ikary-primitives.yaml` updated.' : '') +
          '\n\nNext steps:\n' +
          `1. Edit \`primitives/${name}/${name.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('')}PresentationSchema.ts\` to define props\n` +
          `2. Implement the React component\n` +
          `3. Run \`ikary primitive validate\` to check the contract`,
          result,
        );
      } catch (err) {
        return mcpError(String(err));
      }
    },
  );

  server.tool(
    'validate_primitive_props',
    'Validates a props object against a custom primitive\'s declared contract schema. Returns whether the props are valid and lists any type or missing-field errors.',
    {
      key: z.string().min(1).describe('Primitive key to validate against'),
      props: z.record(z.unknown()).describe('Props object to validate'),
    },
    async ({ key, props }) => {
      try {
        const result = registry.validatePrimitiveProps(key, props);
        if ('error' in result) return mcpError(result.error);

        if (result.valid) {
          return mcpResult(`## Props valid for primitive: ${key}\n\nAll props pass the contract schema.`, result);
        }

        return mcpResult(
          `## Props invalid for primitive: ${key}\n\n` +
          `Found ${result.errors?.length ?? 0} error(s):\n` +
          (result.errors ?? []).map((e) => `- ${e}`).join('\n'),
          { ...result, isError: true },
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
